// src/app/api/categories/route.ts

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Handler for GET requests to /api/categories
export async function GET(request: Request) {
  try {
    // Fetch all categories from the database
    const categories = await prisma.category.findMany({
        orderBy: {
            name: 'asc', // Order alphabetically by name
        },
        select: { // Select only ID and name
            id: true,
            name: true,
        }
    });

    // Return the categories
    return NextResponse.json(categories, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
        { message: "Failed to fetch categories.", error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
    );
  }
}