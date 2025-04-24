// src/app/api/auth/me/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma'; // Adjust path if needed
import type { Role } from '@prisma/client'; // Ensure Role is imported if used in payload type

// --- JWT Verification Setup ---
const JWT_SECRET = process.env.JWT_SECRET;
let secretKey: Uint8Array | undefined = undefined;
if (JWT_SECRET) {
    try {
        secretKey = new TextEncoder().encode(JWT_SECRET);
    } catch (e) { console.error("Failed to encode JWT_SECRET in /api/auth/me", e); }
} else {
    console.error("JWT_SECRET environment variable is not set in /api/auth/me.");
}

// --- Expected JWT Payload Structure ---
interface UserJwtPayload {
  userId: string;
  email?: string; // Email might be optional depending on what you put in login
  role: Role | string; // Role is crucial
  iat?: number;
  exp?: number;
}

// --- GET Handler ---
export async function GET(request: NextRequest) {
    console.log("API ME: Received request to fetch current user");

    // 1. Check Server Configuration
    if (!secretKey || secretKey.length === 0) {
        return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
    }

    // 2. Get Token from Cookie
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) {
        console.log("API ME: No session token found.");
        return NextResponse.json({ message: "Unauthorized: No session token found." }, { status: 401 });
    }

    // 3. Verify Token and Extract User ID
    let userId: string | undefined;
    try {
        const { payload } = await jwtVerify(token, secretKey);
        console.log("API ME: Token verified, payload:", payload);

        // Validate payload structure
        if (payload && typeof payload.userId === 'string') {
            userId = payload.userId;
        } else {
            throw new Error("Invalid token payload: userId missing or invalid.");
        }

    } catch (error: any) {
        console.error("API ME: Auth verification failed:", error.code || error.message);
        let message = "Unauthorized: Invalid or expired token.";
        if (error.code === 'ERR_JWT_EXPIRED') {
            message = "Unauthorized: Session expired.";
        }
        // Clear potentially invalid cookie by sending header with expiry in the past
        const clearCookie = 'sessionToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax';
        return NextResponse.json({ message: message }, { status: 401, headers: { 'Set-Cookie': clearCookie } });
    }

    // 4. Fetch User Data from Database
    try {
        console.log(`API ME: Fetching user data for ID: ${userId}`);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { // <<< SELECT CLAUSE INCLUDING ROLE >>>
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
                role: true, // <<< CRUCIAL: Ensure role is selected
                createdAt: true,
                // Exclude passwordHash and potentially updatedAt if not needed client-side
            }
        });

        if (!user) {
            console.warn(`API ME: User with ID ${userId} from token not found in DB.`);
            // Clear cookie for user that doesn't exist anymore
             const clearCookie = 'sessionToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax';
            return NextResponse.json({ message: "Unauthorized: User not found." }, { status: 401, headers: { 'Set-Cookie': clearCookie } });
        }

        console.log("API ME: User data fetched successfully.");
        // 5. Return User Data
        return NextResponse.json({ user: user }, { status: 200 });

    } catch (error: any) {
        console.error(`API ME: Database error fetching user ${userId}:`, error);
        return NextResponse.json(
            { message: "An error occurred while fetching user data.", error: error.message },
            { status: 500 }
        );
    }
}