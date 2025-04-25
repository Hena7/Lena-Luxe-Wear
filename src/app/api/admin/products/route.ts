// src/app/api/admin/products/route.ts

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import type { Role } from '@prisma/client';
import type { JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Define expected payload structure
interface UserJwtPayload extends JWTPayload {
  userId?: string;
  email?: string;
  role?: Role | string;
}

// Handler for GET requests to fetch all products (ADMIN ONLY)
export async function GET(request: NextRequest) {
    console.log("API: Received request to fetch all products (Admin)");

    // 1. Verify Admin Authentication (Copy logic from /api/admin/users)
    if (!JWT_SECRET || secretKey.length === 0) { /* ... handle missing secret ... */ }
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) {
        return NextResponse.json({ message: "Unauthorized: Login required." }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(token, secretKey);
        console.log("API: Admin products token payload:", payload);

        // Safer Payload Validation & Admin Check
        if (!payload || typeof payload.userId !== 'string' || payload.role !== 'ADMIN') {
             console.warn(`API: Forbidden access attempt to admin products route.`);
             return NextResponse.json({ message: "Forbidden: Admin access required." }, { status: 403 });
        }
        console.log(`API: Admin user ${payload.email} authenticated to fetch products.`);

    } catch (error) {
         console.error("Auth verification failed for admin products route:", error);
         return NextResponse.json({ message: "Unauthorized: Invalid session." }, { status: 401 });
    }

    // 2. Fetch All Products from Database
    try {
        const products = await prisma.product.findMany({
            orderBy: [ // Example: Order by category name, then product name
                { category: { name: 'asc' } },
                { name: 'asc' }
            ],
            include: { // Include category name for context
                category: {
                    select: { name: true }
                }
            },
            // Select all relevant fields for admin view, including stock
            // No specific 'select' needed if we want all Product fields + included category name
        });

        console.log(`API: Fetched ${products.length} products for admin view.`);
        // 3. Return the fetched products
        return NextResponse.json(products, { status: 200 });

    } catch (error: any) {
        console.error("API: Failed to fetch products for admin:", error);
        return NextResponse.json(
            { message: "An error occurred while fetching products.", error: error.message },
            { status: 500 }
        );
    }
}

// TODO: Add POST / PUT / DELETE handlers here later for managing products
// export async function POST(request: NextRequest) { /* Create product logic */ }
// export async function PUT(request: NextRequest) { /* Update product logic */ }
// export async function DELETE(request: NextRequest) { /* Delete product logic */ }

export async function POST(request: NextRequest) {
    console.log("API: Received request to CREATE product (Admin)");

    // 1. Verify Admin Authentication (Essential)
    // (Same logic as in the GET handler - could be refactored into a helper)
    if (!JWT_SECRET || secretKey.length === 0) { return NextResponse.json({ message: "Server configuration error." }, { status: 500 }); }
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) { return NextResponse.json({ message: "Unauthorized: Login required." }, { status: 401 }); }

    try {
        const { payload } = await jwtVerify(token, secretKey);
        if (!payload || typeof payload.userId !== 'string' || payload.role !== 'ADMIN') {
            return NextResponse.json({ message: "Forbidden: Admin access required." }, { status: 403 });
        }
        console.log(`API: Admin user ${payload.email} authenticated to CREATE product.`);
    } catch (error) {
         console.error("Auth verification failed for admin product create:", error);
         return NextResponse.json({ message: "Unauthorized: Invalid session." }, { status: 401 });
    }

    // 2. Parse and Validate Request Body
    let body;
    try {
        body = await request.json();
        console.log("API: Create product request body:", body);

        // Basic validation (add more specific checks as needed)
         if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') { throw new Error("Product name is required."); }
         if (body.price === undefined || typeof body.price !== 'number' || body.price < 0) { throw new Error("Valid non-negative price is required."); }
         if (body.stock === undefined || typeof body.stock !== 'number' || body.stock < 0 || !Number.isInteger(body.stock)) { throw new Error("Valid non-negative integer stock is required."); }
         if (!body.categoryId || typeof body.categoryId !== 'string') { throw new Error("Category ID is required."); }
         // Optional field validation if needed (e.g., URL format for imageUrl)
         if (body.imageUrl && typeof body.imageUrl !== 'string') {throw new Error("Image URL must be a string.");}
         if (body.description && typeof body.description !== 'string') {throw new Error("Description must be a string.");}

    } catch (error: any) {
        console.error("API: Invalid request body for product create:", error);
        return NextResponse.json({ message: error.message || "Invalid request body.", details: error instanceof SyntaxError ? "Malformed JSON" : undefined }, { status: 400 });
    }

    // 3. Create Product in Database
    try {
         // Check if category exists (optional but good practice)
         const categoryExists = await prisma.category.findUnique({ where: { id: body.categoryId } });
         if (!categoryExists) {
             return NextResponse.json({ message: `Category with ID ${body.categoryId} not found.` }, { status: 400 }); // Bad Request
         }

         const newProduct = await prisma.product.create({
             data: {
                 name: body.name.trim(),
                 description: body.description?.trim() || null, // Use null if empty/undefined
                 price: body.price,
                 stock: body.stock,
                 imageUrl: body.imageUrl?.trim() || null, // Use null if empty/undefined
                 categoryId: body.categoryId,
                 // Prisma handles id, createdAt, updatedAt automatically
             },
             include: { // Include category in response for confirmation
                 category: { select: { name: true } }
             }
         });

         console.log(`API: Successfully created product ${newProduct.id}`);
         // 4. Return Success Response
         return NextResponse.json(newProduct, { status: 201 }); // 201 Created

    } catch (error: any) {
         console.error("API: Failed to create product in database:", error);
         // Handle potential Prisma errors (e.g., unique constraints if any)
         // if (error instanceof Prisma.PrismaClientKnownRequestError) { ... }
         return NextResponse.json(
             { message: "An error occurred while creating the product.", error: error.message },
             { status: 500 }
         );
    }
}