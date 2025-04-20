// src/app/api/products/[productId]/route.ts

import prisma from '@/lib/prisma'; // Import shared Prisma client
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'; // Use NextRequest for context type access if needed

// Define interface for the context object containing route params
interface RouteContext {
    params: {
        productId: string; // Must match the folder name '[productId]'
    }
}

// Handler for GET requests to /api/products/[productId]
export async function GET(request: NextRequest, context: RouteContext) {
    const { params } = context; // Destructure params from context
    const productId = params.productId;
    console.log(`API received request for single product ID: ${productId}`); // Log received ID

    // Validate if productId was actually captured
    if (!productId || typeof productId !== 'string') {
        console.log("API Error: Product ID missing or invalid in request.");
        return NextResponse.json({ message: "Product ID is required and must be a string." }, { status: 400 }); // Bad Request
    }

    try {
        // Fetch the unique product from the database by its ID
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },
            // Include related category data (optional but good for detail pages)
            include: {
                 category: {
                     select: { id: true, name: true }
                 }
             }
        });

        // Check if the product was found in the database
        if (!product) {
            console.log(`API Info: Product with ID ${productId} not found in database.`);
            return NextResponse.json({ message: `Product with ID ${productId} not found.` }, { status: 404 }); // Not Found
        }

        // Product found, return it
        console.log(`API Success: Found product ${productId}`);
        return NextResponse.json(product, { status: 200 }); // OK status with product data

    } catch (error) {
        console.error(`API Error: Failed to fetch product ${productId}:`, error);

        // Return a generic server error response for unexpected issues
        return NextResponse.json(
            { message: "An error occurred while fetching the product.", error: error instanceof Error ? error.message : 'Unknown server error' },
            { status: 500 } // Internal Server Error
        );
    }
}

// Potential future handlers for updating (PUT) or deleting (DELETE) a specific product
// export async function PUT(request: NextRequest, context: RouteContext) { /* ... */ }
// export async function DELETE(request: NextRequest, context: RouteContext) { /* ... */ }