// src/app/api/auth/register/route.ts

import prisma from '@/lib/prisma'; // Ensure path to shared prisma client is correct
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt'; // Ensure bcrypt is installed

// Define expected request body structure (optional but good practice)
interface RegisterRequestBody {
    email?: string;
    password?: string;
    phoneNumber?: string;
    name?: string; // Optional name
}

// Handler for POST requests to /api/auth/register
export async function POST(request: Request) {
    console.log("Register API endpoint hit"); // Log entry

    try {
        // 1. Parse the request body
        let body: RegisterRequestBody;
        try {
            body = await request.json();
            console.log("Parsed register body:", body);
        } catch (e) {
            console.error("Failed to parse request body:", e);
            return NextResponse.json({ message: "Invalid JSON in request body." }, { status: 400 });
        }

        const { email, password, phoneNumber, name } = body;

        // 2. Basic Validation
        if (!email || !password || !phoneNumber) {
            console.log("Validation failed: Missing required fields.");
            return NextResponse.json(
                { message: "Email, password, and phone number are required." },
                { status: 400 } // Bad Request
            );
        }
        // --- Add more robust validation as needed ---
        // Example: Basic email format check (not foolproof)
        if (!/\S+@\S+\.\S+/.test(email)) {
            console.log(`Validation failed: Invalid email format - ${email}`);
            return NextResponse.json({ message: "Invalid email format." }, { status: 400 });
        }
        // Example: Basic password length check
        if (password.length < 6) {
            console.log("Validation failed: Password too short.");
            return NextResponse.json({ message: "Password must be at least 6 characters long." }, { status: 400 });
        }
        // Example: Basic phone number format check (adjust regex as needed for your region)
        // This is a very simple example, consider a library for real validation
        if (!/^[0-9\-\+\(\) ]{7,15}$/.test(phoneNumber)) { // Allows digits, hyphens, plus, parentheses, spaces
             console.log(`Validation failed: Invalid phone number format - ${phoneNumber}`);
             return NextResponse.json({ message: "Invalid phone number format." }, { status: 400 });
        }
        // --- End Validation Examples ---


        // 3. Check if user already exists (case-insensitive email check is often good)
        console.log(`Checking for existing user with email: ${email}`);
        const existingUser = await prisma.user.findUnique({
            // Use 'email' index defined in schema
            where: { email: email.toLowerCase() }, // Store and check lowercase email
        });

        if (existingUser) {
            console.log(`Registration conflict: User already exists with email ${email}`);
            return NextResponse.json(
                { message: "User with this email already exists." },
                { status: 409 } // Conflict
            );
        }

        // 4. Hash the password
        console.log("Hashing password...");
        const saltRounds = 10; // Cost factor for hashing
        const passwordHash = await bcrypt.hash(password, saltRounds);
        console.log("Password hashed successfully.");

        // 5. Create the new user in the database
        console.log(`Creating new user: ${email.toLowerCase()}`);
        const newUser = await prisma.user.create({
            data: {
                email: email.toLowerCase(), // Store lowercase email
                passwordHash: passwordHash, // Store the HASHED password
                phoneNumber: phoneNumber, // Store provided phone number
                name: name || null, // Store name or null if not provided
                // Role defaults to CUSTOMER via schema definition
            },
            // Select only non-sensitive fields to return
            select: {
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
                role: true, // Return role
                createdAt: true,
            }
        });
        console.log("New user created successfully:", newUser.id);

        // 6. Return success response
        return NextResponse.json(newUser, { status: 201 }); // 201 Created

    } catch (error) {
        console.error("Registration process failed:", error);

        // Specific check for Prisma Unique constraint violation (just in case race condition)
        if (error instanceof Error && (error as any).code === 'P2002') { // Prisma unique constraint error code
             return NextResponse.json({ message: "Email or another unique field already exists." }, { status: 409 });
        }

        return NextResponse.json(
            { message: "An error occurred during registration.", error: error instanceof Error ? error.message : 'Unknown server error' },
            { status: 500 } // Internal Server Error
        );
    }
}