// src/app/api/orders/route.ts

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // To get user ID from token
import bcrypt from 'bcrypt'; // Keep for POST handler if in same file

// Define expected request body structure for creating an order
interface CreateOrderRequestBody {
    items: { // Array of items in the cart
        productId: string;
        quantity: number;
    }[];
    // We'll get userId from the token, not the body
    // totalAmount will be calculated on the server
    // shippingAddress could be added later
}

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = new TextEncoder().encode(JWT_SECRET);

// --- GET Handler: Fetch Orders for Logged-in User ---
// --- GET Handler: Fetch Orders for Logged-in User (CUSTOMER or ADMIN) ---
export async function GET(request: NextRequest) {
    console.log("API: Received request to fetch CURRENT USER orders");

    // 1. Verify User Authentication (No Admin check needed here)
    if (!JWT_SECRET || secretKey.length === 0) { /* ... */ }
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) {
        // Return 401 if no token
        return NextResponse.json({ message: "Unauthorized: Login required to view orders." }, { status: 401 });
    }

    let userId: string | undefined;
    try {
        const { payload } = await jwtVerify(token, secretKey);
        userId = payload.userId as string | undefined;
        if (!userId) throw new Error("Invalid token payload: userId missing."); // Ensure userId exists
        console.log(`API: Fetching orders for user ID: ${userId}`);
    } catch (error) {
        console.error("Auth verification failed for fetching user orders:", error);
         // Return 401 if token is invalid/expired
         return NextResponse.json({ message: "Unauthorized: Invalid session." }, { status: 401 });
    }

    // --- User is Authenticated - Proceed to Fetch THEIR Orders ---

    // 2. Fetch Orders from Database for this specific user
    try {
        const orders = await prisma.order.findMany({
            where: {
                userId: userId, // <<< CRUCIAL: Filter orders by the authenticated user's ID
            },
            include: {
                // Include needed related data for display
                items: {
                    include: {
                        product: {
                            select: { id: true, name: true, imageUrl: true }
                        }
                    }
                }
                // No need to include 'user' as we are already filtering by userId
            },
            orderBy: {
                createdAt: 'desc', // Show most recent orders first
            }
        });

        console.log(`API: Found ${orders.length} orders for user ${userId}`);
        // 3. Return the fetched orders
        return NextResponse.json(orders, { status: 200 });

    } catch (error: any) {
        console.error(`API: Failed to fetch orders for user ${userId}:`, error);
        return NextResponse.json(
            { message: "An error occurred while fetching your orders.", error: error.message },
            { status: 500 }
        );
    }
} // End GET Handler

// Handle POST requests to create a new order
export async function POST(request: NextRequest) {
    console.log("Received request to create order");

    // 1. Verify User Authentication (Essential for orders)
    if (!JWT_SECRET || secretKey.length === 0) {
         return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
    }
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) {
         return NextResponse.json({ message: "Unauthorized: Must be logged in to place orders." }, { status: 401 });
    }

    let userId: string | undefined;
    try {
         const { payload } = await jwtVerify(token, secretKey);
         userId = payload.userId as string | undefined;
         if (!userId) throw new Error("Invalid token payload");
         console.log(`Order creation initiated by user ID: ${userId}`);
    } catch (error) {
         console.error("Auth verification failed for order creation:", error);
         return NextResponse.json({ message: "Unauthorized: Invalid session." }, { status: 401 });
    }

    // 2. Parse Request Body
    let body: CreateOrderRequestBody;
    try {
        body = await request.json();
        console.log("Parsed order request body:", body);
    } catch (error) {
        return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
    }

    // 3. Basic Validation
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
        return NextResponse.json({ message: "Order must contain at least one item." }, { status: 400 });
    }
    for (const item of body.items) {
         if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
             return NextResponse.json({ message: "Invalid item data. Each item needs productId and a positive integer quantity." }, { status: 400 });
         }
    }

    // --- START TRANSACTION (Crucial for consistency) ---
    try {
        console.log("Starting order creation transaction...");
        const newOrder = await prisma.$transaction(async (tx) => {
            // IMPORTANT: Use 'tx' instead of 'prisma' inside the transaction block

            // a. Get Product Details (including price and stock) for items in the order
            const productIds = body.items.map(item => item.productId);
            const productsInOrder = await tx.product.findMany({
                where: {
                    id: { in: productIds }
                },
                select: { // Select only needed fields
                    id: true,
                    price: true,
                    stock: true,
                    name: true, // For potential error messages
                }
            });

             // Map product details for easy lookup
            const productMap = new Map(productsInOrder.map(p => [p.id, p]));
            console.log(`Fetched details for ${productsInOrder.length} products.`);


            // b. Validate quantities and calculate total amount
            let totalAmount = 0;
            const orderItemsData = []; // Data for creating OrderItem records

            for (const item of body.items) {
                const product = productMap.get(item.productId);

                if (!product) {
                     throw new Error(`Product with ID ${item.productId} not found.`);
                }
                 // --- Basic Stock Check (Can be improved with locking) ---
                 if (product.stock < item.quantity) {
                      throw new Error(`Insufficient stock for product "${product.name}" (ID: ${item.productId}). Available: ${product.stock}, Requested: ${item.quantity}`);
                 }
                // --------------------------------------------------------

                totalAmount += product.price * item.quantity;
                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price // Store price *at the time of order*
                });
            }
            console.log(`Calculated total amount: ${totalAmount}`);

            // c. Create the Order record
            console.log(`Creating Order record for user ${userId}...`);
            const createdOrder = await tx.order.create({
                data: {
                    userId: userId, // From verified token
                    totalAmount: totalAmount,
                    status: 'PENDING', // Default status
                    // OrderItems will be created below using a nested write
                    items: {
                        create: orderItemsData.map(itemData => ({
                            quantity: itemData.quantity,
                            price: itemData.price,
                            // Connect the product within the nested create
                            product: {
                                connect: { id: itemData.productId }
                            }
                            // orderId is automatically linked by Prisma here
                        }))
                    }
                },
                include: { // Include created items in the response (optional)
                   items: {
                       include: { product: { select : { name: true } } } // Include product name for context
                   }
                }
            });
            console.log(`Created Order record with ID: ${createdOrder.id}`);

             // d. Update Stock Levels (Crucial!)
            console.log("Updating stock levels...");
            for (const item of orderItemsData) {
                 await tx.product.update({
                      where: { id: item.productId },
                      data: {
                           // Use Prisma's atomic decrement operation
                           stock: {
                                decrement: item.quantity
                           }
                      }
                 });
                 console.log(`Decremented stock for product ${item.productId} by ${item.quantity}`);
            }
            console.log("Stock levels updated.");


            return createdOrder; // Return the created order object from the transaction
        });
        // --- TRANSACTION END ---

        console.log("Order creation transaction completed successfully.");
        // 4. Return Success Response
        return NextResponse.json(newOrder, { status: 201 }); // 201 Created

    } catch (error: any) {
        console.error("Order creation failed:", error);
         // Handle specific errors like stock issues or product not found from the transaction
         // Handle Prisma transaction errors
         let statusCode = 500;
         let message = "An error occurred while creating the order.";
         if (error.message.includes("Insufficient stock") || error.message.includes("not found")) {
            statusCode = 400; // Bad Request if stock/product issue
            message = error.message;
         }

         return NextResponse.json({ message: message, error: error instanceof Error ? error.message : 'Unknown error' }, { status: statusCode });
    }
}