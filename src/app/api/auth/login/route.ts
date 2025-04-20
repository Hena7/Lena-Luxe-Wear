// src/app/api/auth/login/route.ts

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt, {SignOptions} from 'jsonwebtoken'; // Import jsonwebtoken
import * as cookie from 'cookie'; // Import cookie library
// import * as cookie from 'cookie'; // Import cookie library

interface LoginRequestBody {
    email?: string;
    password?: string;
}

const JWT_SECRET = process.env.JWT_SECRET; // Load secret from environment
const JWT_EXPIRATION_SECONDS = 60 * 60 * 24 * 1; // 1 day

export async function POST(request: Request) {
    // Basic validation: Check if JWT_SECRET is set
    if (!JWT_SECRET) {
        console.error("JWT_SECRET environment variable is not set.");
        return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
    }

    try {
        const body: LoginRequestBody = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.passwordHash) {
            return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
        }

        const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

        if (!passwordIsValid) {
            return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
        }

        // --- Login Successful - Generate JWT and Set Cookie ---

       
            // 1. Prepare JWT Payload
            const tokenPayload = {
                userId: user.id,
                email: user.email,
            };
            const SignOptions: SignOptions={   
                expiresIn: JWT_EXPIRATION_SECONDS 
            }

            // 2. Sign the JWT (Ensure JWT_SECRET is treated as a string)
            // We know JWT_SECRET is defined because of the check at the function start
            const token = jwt.sign(
                tokenPayload,
                JWT_SECRET!, // <-- Assert type as string here
                // { expiresIn: JWT_EXPIRES_IN }
                SignOptions
            );


            if (typeof cookie?.serialize !== 'function') {
                console.error("Cookie library not loaded correctly!");
                throw new Error("Server configuration error related to cookie serialization.");
           }

        // 3. Serialize the cookie
        const sessionCookie = cookie.serialize(
            'sessionToken', // Name of the cookie
            token,           // The JWT value
            {
                httpOnly: true,                  // Prevent JS access
                secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
                maxAge: JWT_EXPIRATION_SECONDS,        // 1 day in seconds (match JWT expiration roughly)
                // maxAge: parseInt(JWT_EXPIRES_IN) * 60 * 60; // Alternative based on env var (needs parsing)
                sameSite: 'lax',                 // Recommended setting ('strict' or 'lax')
                path: '/',                       // Cookie is valid for the entire site
            }
        );

        // 4. Prepare response body (optional - can just be success message)
        const userToReturn = {
             id: user.id,
             email: user.email,
             name: user.name,
        };

        // 5. Return success response WITH the Set-Cookie header
        return NextResponse.json(
            { message: "Login successful!", user: userToReturn }, // Send back minimal user info
            {
                status: 200,
                headers: {
                    'Set-Cookie': sessionCookie, // Attach the serialized cookie here!
                },
            }
        );
         // --- End JWT and Cookie Logic ---

    } catch (error) {
        console.error("Login failed:", error);
        if (error instanceof SyntaxError) {
             return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
        }
        return NextResponse.json(
            { message: "An error occurred during login.", error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}