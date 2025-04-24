// src/app/api/admin/users/route.ts

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import type { Role } from '@prisma/client';
import type { JWTPayload } from 'jose'; // Import base type

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Extend JWTPayload or define separately, ensuring fields are optional for checks
interface UserJwtPayload extends JWTPayload {
  userId?: string;
  email?: string;
  role?: Role | string; // Allow string for initial check
}

// Handler for GET requests to fetch all users (ADMIN ONLY)
export async function GET(request: NextRequest) {
    console.log("API: Received request to fetch all users (Admin)");

    // 1. Verify User Authentication & Admin Role
    if (!JWT_SECRET || secretKey.length === 0) {
        console.error("API Error: JWT_SECRET not configured.");
        return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
    }
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) {
        return NextResponse.json({ message: "Unauthorized: Login required." }, { status: 401 });
    }

    let userPayload: UserJwtPayload | null = null; // Use extended type
    let isAdmin = false; // Flag for admin status

    try {
        const { payload } = await jwtVerify(token, secretKey);
        console.log("API: Token verification successful, raw payload:", payload);

        // --- Safer Type Guard Check ---
        if (payload &&
            typeof payload.userId === 'string' &&
            typeof payload.email === 'string' &&
            typeof payload.role === 'string' // Check as string initially
           )
        {
             // Assign validated payload
             userPayload = {
                 ...payload,
                 userId: payload.userId,
                 email: payload.email,
                 role: payload.role // Keep as string or cast carefully if needed elsewhere
             };
             // --- ADMIN CHECK ---
             if (userPayload.role === 'ADMIN') {
                  isAdmin = true;
             }
             // -------------------
        } else {
            console.warn("API: Token payload missing required fields (userId, email, role).");
            // Treat as invalid payload -> Unauthorized
            return NextResponse.json({ message: "Unauthorized: Invalid token payload." }, { status: 401 });
        }
        // -------------------------

    } catch (error: any) {
        console.error("Auth verification failed for admin users route:", error.code || error.message);
        // Handle specific JWT errors (like expiration) if needed
        let message = "Unauthorized: Invalid or expired token.";
        if (error.code === 'ERR_JWT_EXPIRED') {
            message = "Unauthorized: Session expired.";
        }
        return NextResponse.json({ message: message }, { status: 401 });
    }

    // --- Check Admin Status ---
    if (!isAdmin) {
        console.warn(`API: Forbidden access attempt to admin users route by user: ${userPayload?.email || 'Unknown (non-admin)'}`);
        return NextResponse.json({ message: "Forbidden: Admin access required." }, { status: 403 });
    }
    // ------------------------

    console.log(`API: Admin user ${userPayload?.email} authenticated to fetch users.`);

    // 2. Fetch All Users from Database (Only if admin check passed)
    try {
        const users = await prisma.user.findMany({
           // ... (orderBy, select clauses remain the same) ...
           orderBy: { createdAt: 'desc' },
           select: {
               id: true, email: true, name: true, phoneNumber: true, role: true,
               createdAt: true, updatedAt: true,
               _count: { select: { orders: true } }
            }
        });
        console.log(`API: Fetched ${users.length} users.`);
        return NextResponse.json(users, { status: 200 });
    } catch (error: any) {
        // ... (database fetch error handling remains the same) ...
    }
}

// ... (keep POST/PUT/DELETE placeholders if needed) ...