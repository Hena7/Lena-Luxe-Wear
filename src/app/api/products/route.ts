// src/app/api/products/route.ts

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { URL } from 'url'; // Import URL for parsing query parameters

// Handler for GET requests to /api/products
export async function GET(request: Request) {
    // Parse URL and query parameters
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId'); // Get categoryId from query string ?categoryId=...

    try {
        // Define Prisma query options
        const queryOptions: Parameters<typeof prisma.product.findMany>[0] = {
            // Include the related Category data in the response
            include: {
                category: {
                    select: { // Select only the category name (and id if needed)
                        id: true,
                        name: true,
                    },
                },
            },
            // Default ordering
            orderBy: {
                createdAt: 'desc',
            },
        };

        // Add a 'where' clause if categoryId filter is provided
        if (categoryId && categoryId !== 'All') { // Ignore 'All' if passed
             queryOptions.where = {
                 categoryId: categoryId,
             };
        }

        // Fetch products from the database using the constructed options
        const products = await prisma.product.findMany(queryOptions);

        // Return the products
        return NextResponse.json(products, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch products:", error);
        return NextResponse.json(
            { message: "Failed to fetch products.", error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}