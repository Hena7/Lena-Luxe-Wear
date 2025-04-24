// middleware.ts (in project root or src/)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import type { Role } from '@prisma/client'; // Make sure Role is imported or defined
import type { JWTPayload } from 'jose'; // Import base type

const JWT_SECRET = process.env.JWT_SECRET;

// Define paths
const protectedPaths = ['/profile', '/orders'];
const adminOnlyPaths = ['/admin']; // Let's simplify - check for prefix /admin
const publicOnlyPaths = ['/login', '/register'];

// Define expected payload structure, extending JWTPayload
interface UserJwtPayload extends JWTPayload {
  userId?: string;
  email?: string;
  role?: Role | string; // Allow string for initial check
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    console.log(`MIDDLEWARE: Running for path: ${pathname}`); // Log the actual path it's running for

    // --- Pre-computation: Basic Checks & Token Retrieval ---
    let secretKey: Uint8Array | undefined = undefined;
    if (JWT_SECRET) {
        try {
             secretKey = new TextEncoder().encode(JWT_SECRET);
        } catch (e) { console.error("MIDDLEWARE: Failed to encode JWT_SECRET", e); }
    }

    if (!secretKey || secretKey.length === 0) {
        console.error("MIDDLEWARE: JWT_SECRET is not configured correctly.");
        // In production, block or redirect to error page
        if (process.env.NODE_ENV === 'production') {
             return new NextResponse("Internal Server Error: Configuration issue.", { status: 500 });
        }
        // Allow in dev with error logged
        return NextResponse.next();
    }

    const token = request.cookies.get('sessionToken')?.value;
    console.log(`MIDDLEWARE: Token found: ${!!token}`);

    let userPayload: UserJwtPayload | null = null;
    let isValidToken = false;

    // --- Token Verification ---
    if (token) {
        try {
            const { payload } = await jwtVerify(token, secretKey);
            console.log("MIDDLEWARE: Raw token payload:", payload);

            // Safer Payload Validation (Type Guard)
            if (payload && typeof payload.userId === 'string' && typeof payload.role === 'string') {
                 userPayload = { // Assign only if valid structure
                    ...payload, // Keep standard claims like iat, exp
                    userId: payload.userId,
                    email: payload.email as string | undefined, // Handle potentially missing email
                    role: payload.role as Role | string,
                 };
                 isValidToken = true; // Mark token as valid
                 console.log("MIDDLEWARE: Validated userPayload:", userPayload);
            } else {
                 console.warn("MIDDLEWARE: Token payload structure invalid.");
            }
        } catch (error: any) {
            console.warn("MIDDLEWARE: Token verification failed (invalid/expired):", error.code || error.message);
            // isValidToken remains false, userPayload remains null
        }
    }

    const isUserLoggedIn = isValidToken && !!userPayload;
    const userRole = userPayload?.role;
    const isUserAdmin = isUserLoggedIn && userRole === 'ADMIN';

    console.log(`MIDDLEWARE: User logged in: ${isUserLoggedIn}, Role: ${userRole}, Is Admin: ${isUserAdmin}`);


    // --- Routing Logic ---

    // 1. Check Admin Paths FIRST
    const isAccessingAdminPath = pathname.startsWith('/admin'); // Simplified check for any /admin/* path
    console.log(`MIDDLEWARE: Checking Admin Path (${pathname}): ${isAccessingAdminPath}`);
    if (isAccessingAdminPath) {
        if (!isUserLoggedIn) {
            console.log("MIDDLEWARE: Redirecting to login (Admin Path, Not Logged In).");
            return NextResponse.redirect(new URL(`/login?redirectedFrom=${pathname}`, request.url));
        }
        if (!isUserAdmin) {
            console.log(`MIDDLEWARE: Redirecting to home (Admin Path, Role is ${userRole}, Not Admin).`);
            return NextResponse.redirect(new URL('/', request.url)); // Redirect non-admins home
        }
        // If we reach here, user is logged in AND is Admin
        console.log("MIDDLEWARE: Admin access granted. Allowing request.");
        return NextResponse.next(); // Allow access to the requested admin path
    }

    // 2. Check General Protected Paths (if not an admin path)
    const isAccessingProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    console.log(`MIDDLEWARE: Checking Protected Path (${pathname}): ${isAccessingProtectedPath}`);
    if (isAccessingProtectedPath && !isUserLoggedIn) {
        console.log("MIDDLEWARE: Redirecting to login (Protected Path, Not Logged In).");
        return NextResponse.redirect(new URL(`/login?redirectedFrom=${pathname}`, request.url));
    }

    // 3. Check Public-Only Paths (if not admin or protected path)
    const isAccessingPublicOnlyPath = publicOnlyPaths.some(path => pathname.startsWith(path));
    console.log(`MIDDLEWARE: Checking Public-Only Path (${pathname}): ${isAccessingPublicOnlyPath}`);
    if (isAccessingPublicOnlyPath && isUserLoggedIn) {
        console.log("MIDDLEWARE: Redirecting to home (Public-Only Path, Logged In).");
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 4. Allow all other requests
    console.log(`MIDDLEWARE: Allowing request to proceed (Path: ${pathname}).`);
    return NextResponse.next();
}

// --- Matcher ---
// Ensure this matcher includes the paths you want the middleware to check
export const config = {
    matcher: [
        // Apply to specific routes needing checks
        '/profile/:path*',
        '/orders/:path*',
        '/admin/:path*',    // <<< Crucial: Intercept all /admin routes
        '/login',
        '/register',
        '/cart',           // Example: Might want to protect cart too
        // Add other specific pages if needed
        // Avoid overly broad matchers like '/' if possible unless homepage needs checks
    ],
};