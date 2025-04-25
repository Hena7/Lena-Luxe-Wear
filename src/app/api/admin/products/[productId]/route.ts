// src/app/api/admin/products/[productId]/route.ts
import { Prisma } from '@prisma/client';
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
  userId?: string; email?: string; role?: Role | string;
}
// Define expected request body structure for updates
interface UpdateProductRequestBody {
    name?: string; description?: string | null; price?: number;
    stock?: number; imageUrl?: string | null; categoryId?: string; 
   
}


// Interface for route context (including params)
interface RouteContext { params: { productId: string } }

// --- PUT Handler: Update Existing Product (ADMIN ONLY) ---
export async function PUT(request: NextRequest, context: RouteContext) {
    const productId = context.params.productId;
    console.log(`API: Received request to UPDATE product ${productId} (Admin)`);

    // 1. Verify Admin Authentication
    if (!JWT_SECRET || secretKey.length === 0) { /* ... */ }
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) { return NextResponse.json({ message: "Unauthorized: Login required." }, { status: 401 }); }

    try {
        const { payload } = await jwtVerify(token, secretKey);
        if (!payload || typeof payload.userId !== 'string' || payload.role !== 'ADMIN') {
            return NextResponse.json({ message: "Forbidden: Admin access required." }, { status: 403 });
        }
         console.log(`API: Admin user ${payload.email} authenticated to UPDATE product ${productId}.`);
    } catch (error) {
         return NextResponse.json({ message: "Unauthorized: Invalid session." }, { status: 401 });
    }

    // 2. Parse and Validate Request Body
    let body: UpdateProductRequestBody;
    try {
        body = await request.json();
        console.log("API: Update product request body:", body);

        // Basic validation for updated fields (ensure types are correct if provided)
         if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) { throw new Error("Product name must be a non-empty string."); }
         if (body.price !== undefined && (typeof body.price !== 'number' || body.price < 0)) { throw new Error("Price must be a non-negative number."); }
         if (body.stock !== undefined && (typeof body.stock !== 'number' || body.stock < 0 || !Number.isInteger(body.stock))) { throw new Error("Stock must be a non-negative integer."); }
         if (body.categoryId !== undefined && typeof body.categoryId !== 'string') { throw new Error("Category ID must be a string."); }
         if (body.imageUrl !== undefined && body.imageUrl !== null && typeof body.imageUrl !== 'string') { throw new Error("Image URL must be a string or null."); }
         if (body.description !== undefined && body.description !== null && typeof body.description !== 'string') { throw new Error("Description must be a string or null."); }

    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Invalid request body." }, { status: 400 });
    }

     // 3. Update Product in Database
     try {
        // Optional: Check if category exists if categoryId is being updated
         if (body.categoryId) {
             const categoryExists = await prisma.category.findUnique({ where: { id: body.categoryId } });
             if (!categoryExists) {
                 return NextResponse.json({ message: `Category with ID ${body.categoryId} not found.` }, { status: 400 });
             }
         }

         // --- Prepare data object for update ---
         // Use Prisma's expected input type structure
         const dataToUpdate: Prisma.ProductUpdateInput = {}; // Use Prisma generated type

         // Add scalar fields if they exist in the body
         if (body.name !== undefined) dataToUpdate.name = body.name.trim();
         if (body.description !== undefined) dataToUpdate.description = body.description?.trim() || null;
         if (body.price !== undefined) dataToUpdate.price = body.price;
         if (body.stock !== undefined) dataToUpdate.stock = body.stock;
         if (body.imageUrl !== undefined) dataToUpdate.imageUrl = body.imageUrl?.trim();

         // Handle category update via nested 'connect'
         if (body.categoryId !== undefined) {
             dataToUpdate.category = {
                 connect: { id: body.categoryId }
             };
         }
        // ------------------------------------

         // Check if there's actually anything to update
         if (Object.keys(dataToUpdate).length === 0) {
             return NextResponse.json({ message: "No update data provided." }, { status: 400 });
         }


         const updatedProduct = await prisma.product.update({
             where: { id: productId },
             data: dataToUpdate,       // Pass the correctly structured data
             include: { // Include category in response
                 category: { select: { name: true } }
             }
         });

         console.log(`API: Successfully updated product ${updatedProduct.id}`);
         return NextResponse.json(updatedProduct, { status: 200 }); // 200 OK

    } catch (error: any) {
         console.error(`API: Failed to update product ${productId}:`, error);
         // Handle specific Prisma errors, e.g., P2025 (Record not found)
         if (error.code === 'P2025') {
             return NextResponse.json({ message: `Product with ID ${productId} not found.` }, { status: 404 });
         }
         return NextResponse.json({ message: "An error occurred while updating the product.", error: error.message }, { status: 500 });
    }
}

// --- TODO: Add DELETE Handler ---
// export async function DELETE(request: NextRequest, context: RouteContext) { ... }
// --- DELETE Handler: Delete Existing Product (ADMIN ONLY) ---
export async function DELETE(request: NextRequest, context: RouteContext) {
    const productId = context.params.productId;
    console.log(`API: Received request to DELETE product ${productId} (Admin)`);

    // 1. Verify Admin Authentication (Essential)
    if (!JWT_SECRET || secretKey.length === 0) { /* ... handle missing secret ... */ }
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) { return NextResponse.json({ message: "Unauthorized: Login required." }, { status: 401 }); }

    try {
        const { payload } = await jwtVerify(token, secretKey);
        if (!payload || typeof payload.userId !== 'string' || payload.role !== 'ADMIN') {
            return NextResponse.json({ message: "Forbidden: Admin access required." }, { status: 403 });
        }
         console.log(`API: Admin user ${payload.email} authenticated to DELETE product ${productId}.`);
    } catch (error) {
         return NextResponse.json({ message: "Unauthorized: Invalid session." }, { status: 401 });
    }

    // 2. Delete Product from Database
    try {
        // Use delete - this will throw an error if the record doesn't exist (P2025)
        const deletedProduct = await prisma.product.delete({
            where: { id: productId },
        });

        console.log(`API: Successfully deleted product ${productId} (Name: ${deletedProduct.name})`);
        // 3. Return Success Response (usually no content or just a confirmation)
        // return new NextResponse(null, { status: 204 }); // 204 No Content is common for DELETE
         return NextResponse.json({ message: `Product "${deletedProduct.name}" deleted successfully.` }, { status: 200 }); // Or 200 OK with message

    } catch (error: any) {
         console.error(`API: Failed to delete product ${productId}:`, error);
         // Handle specific Prisma errors, e.g., P2025 (Record to delete not found)
         if (error.code === 'P2025') {
             return NextResponse.json({ message: `Product with ID ${productId} not found.` }, { status: 404 });
         }
         // Handle other potential errors (like foreign key constraints if product is in an order - needs careful schema design or cleanup logic)
          // if (error.code === 'P2003') { // Foreign key constraint failed
          //    return NextResponse.json({ message: "Cannot delete product because it is part of existing orders."}, { status: 409 }); // Conflict
          // }
         return NextResponse.json(
             { message: "An error occurred while deleting the product.", error: error.message },
             { status: 500 }
         );
    }
}