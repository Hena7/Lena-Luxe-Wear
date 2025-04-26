// src/app/api/admin/orders/[orderId]/route.ts

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

import type { JWTPayload } from 'jose';
import { OrderStatus, Role } from '@prisma/client'; // <<< IMPORT OrderStatus Enum

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = new TextEncoder().encode(JWT_SECRET);

interface UserJwtPayload extends JWTPayload { /* ... userId, email, role ... */ }
//interface RouteContext { params: { orderId: string } }

// Handler for GET requests to fetch a single order by ID (ADMIN ONLY)
export async function GET(
    request: NextRequest,
    // Directly type the second argument's expected structure
    { params }: { params: { orderId: string } }
) {
    // Destructure orderId directly from the params object in the argument
    const orderId = params.orderId;
    console.log(`API: Received request for single order ID: ${orderId} (Admin)`);
    console.log(`API_ORDER_DETAIL: Received request for orderId: ${orderId}`);
    // 1. Verify Admin Authentication
    if (!JWT_SECRET || secretKey.length === 0) { /* ... */ }
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) { return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); }

    try {
        const { payload } = await jwtVerify(token, secretKey);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
         console.log(`API: Admin user ${payload.email} authenticated for order ${orderId}.`);
    } catch (error) {
         return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate orderId
    if (!orderId || typeof orderId !== 'string') {
         return NextResponse.json({ message: "Order ID is required." }, { status: 400 });
    }

    // 3. Fetch the specific order with full details
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: { // Include full user details needed for display
                    select: { id: true, email: true, name: true, phoneNumber: true }
                },
                items: { // Include items and their product details
                    include: {
                        product: {
                            select: { id: true, name: true, imageUrl: true }
                        }
                    }
                }
                // Include address info here later if added to Order model
            }
        });

        if (!order) {
            return NextResponse.json({ message: `Order with ID ${orderId} not found.` }, { status: 404 });
        }

        console.log(`API: Found order ${orderId}`);
        return NextResponse.json(order, { status: 200 });

    } catch (error: any) {
         console.error(`API: Failed to fetch order ${orderId}:`, error);
         return NextResponse.json({ message: "Error fetching order.", error: error.message }, { status: 500 });
    }
}

// TODO: Add PUT handler here later for updating order status
// export async function PUT(request: NextRequest, context: RouteContext) { /* ... update status ... */ }
// --- PUT Handler: Update Order Status (ADMIN ONLY) ---
export async function PUT(
    request: NextRequest,
    // Directly type the second argument's expected structure
    { params }: { params: { orderId: string } }
) {
    // Destructure orderId directly from the params object in the argument
    const orderId = params.orderId;
    console.log(`API: Received request to UPDATE status for order ${orderId} (Admin)`);

    // 1. Verify Admin Authentication
    if (!JWT_SECRET || secretKey.length === 0) { return NextResponse.json({ message: "Server configuration error." }, { status: 500 }); }
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) { return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); }

    try {
        const { payload } = await jwtVerify(token, secretKey);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
         console.log(`API: Admin user ${payload.email} authenticated for order status update ${orderId}.`);
    } catch (error) {
         return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and Validate Request Body for Status
    let body: { status?: OrderStatus }; // Expect structure like { "status": "SHIPPED" }
    try {
        body = await request.json();
        console.log(`API: Update order ${orderId} status request body:`, body);

        // Validate the received status value against the OrderStatus enum
        if (!body.status || !Object.values(OrderStatus).includes(body.status)) {
            throw new Error(`Invalid or missing status value. Valid statuses are: ${Object.values(OrderStatus).join(', ')}`);
        }

    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Invalid request body." }, { status: 400 });
    }

    // 3. Update Order Status in Database
    try {
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: body.status, // Update only the status field
                // Prisma automatically updates the 'updatedAt' field
            },
             select: { // Return the updated status and timestamp
                 id: true,
                 status: true,
                 updatedAt: true
             }
        });

        console.log(`API: Successfully updated order ${orderId} status to ${updatedOrder.status}`);
        // 4. Return Success Response
        return NextResponse.json(updatedOrder, { status: 200 }); // 200 OK

    } catch (error: any) {
        console.error(`API: Failed to update status for order ${orderId}:`, error);
        if (error.code === 'P2025') { // Prisma code for Record to update not found
            return NextResponse.json({ message: `Order with ID ${orderId} not found.` }, { status: 404 });
        }
        // Handle other potential database errors
        return NextResponse.json({ message: "Error updating order status.", error: error.message }, { status: 500 });
    }
} // End PUT Handler


// --- DELETE Handler (Optional - Placeholder for deleting an order) ---
// export async function DELETE(request: NextRequest, context: RouteContext) { /* ... */ }
