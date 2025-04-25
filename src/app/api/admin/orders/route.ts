// src/app/api/admin/orders/route.ts

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

// Handler for GET requests to fetch ALL orders (ADMIN ONLY)
export async function GET(request: NextRequest) {
    console.log("API: Received request to fetch all orders (Admin)");

    // 1. Verify Admin Authentication (Reuse logic)
    if (!JWT_SECRET || secretKey.length === 0) { /* ... handle missing secret ... */ }
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) {
        return NextResponse.json({ message: "Unauthorized: Login required." }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(token, secretKey);
        console.log("API: Admin orders token payload:", payload);

        // Safer Payload Validation & Admin Check
        if (!payload || typeof payload.userId !== 'string' || payload.role !== 'ADMIN') {
             console.warn(`API: Forbidden access attempt to admin orders route.`);
             return NextResponse.json({ message: "Forbidden: Admin access required." }, { status: 403 });
        }
        console.log(`API: Admin user ${payload.email} authenticated to fetch all orders.`);

    } catch (error) {
         console.error("Auth verification failed for admin orders route:", error);
         return NextResponse.json({ message: "Unauthorized: Invalid session." }, { status: 401 });
    }

    // 2. Fetch ALL Orders from Database with related data
    try {
        const orders = await prisma.order.findMany({
            // No 'where' clause needed - fetch all orders
            orderBy: {
                createdAt: 'desc', // Show most recent orders first
            },
            include: {
                // Include User details (select specific fields)
                user: {
                    select: { id: true, email: true, name: true }
                },
                // Include OrderItems
                items: {
                    // Optional: Include Product details within items if needed
                    // include: { product: { select: { name: true, imageUrl: true } } }
                    // Or just select item fields
                     select: { id: true, quantity: true, price: true, productId: true } // Select item details
                }
            }
        });

        console.log(`API: Fetched ${orders.length} total orders for admin view.`);
        // 3. Return the fetched orders
        return NextResponse.json(orders, { status: 200 });

    } catch (error: any) {
        console.error("API: Failed to fetch all orders for admin:", error);
        return NextResponse.json(
            { message: "An error occurred while fetching orders.", error: error.message },
            { status: 500 }
        );
    }
}