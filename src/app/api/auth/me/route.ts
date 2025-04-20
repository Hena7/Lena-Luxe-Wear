// src/app/api/auth/me/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Use jose for consistency, though jsonwebtoken would work here
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function GET(request: NextRequest) {
    // 1. Check JWT_SECRET configuration
    if (!JWT_SECRET || secretKey.length === 0) {
        console.error("JWT_SECRET is not configured correctly in /api/auth/me.");
        return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
    }

    // 2. Get the token from the cookie
    const token = request.cookies.get('sessionToken')?.value;

    if (!token) {
        // No token found, user is not logged in
        return NextResponse.json({ message: "Unauthorized: No session token found." }, { status: 401 });
    }

    try {
        // 3. Verify the token using 'jose'
        const { payload } = await jwtVerify(token, secretKey);

        // 4. Extract userId from payload
        const userId = payload.userId as string | undefined; // Assuming payload contains userId

        if (!userId) {
            console.error("Token payload is missing userId:", payload);
            return NextResponse.json({ message: "Unauthorized: Invalid token payload." }, { status: 401 });
        }

        // 5. Fetch user data from database using the ID from the token
        const user = await prisma.user.findUnique({
            where: { id: userId },
            // Select only the necessary, non-sensitive fields
            select: {
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
                createdAt: true,
                // Include roles or other relevant info later if needed
            }
        });

        if (!user) {
            // User ID from token doesn't exist in DB (edge case, maybe deleted user)
             console.warn(`User with ID ${userId} from token not found in database.`);
             // Clear the potentially invalid cookie? Or just return unauthorized.
            // For now, just return unauthorized. Consider adding cookie clearing logic.
             return NextResponse.json({ message: "Unauthorized: User not found." }, { status: 401 });
        }

        // 6. Return the user data
        return NextResponse.json({ user: user }, { status: 200 });

    } catch (error: any) {
        console.error("/api/auth/me error:", error.code || error.message);
        // Handle specific JWT errors (like expiration) if needed
        let message = "Unauthorized: Invalid or expired token.";
        if (error.code === 'ERR_JWT_EXPIRED') {
            message = "Unauthorized: Session expired.";
        }
        // Return unauthorized status for any token verification errors
        return NextResponse.json({ message: message }, { status: 401 });
    }
}