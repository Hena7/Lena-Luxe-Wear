// middleware.ts (in project root or src/)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Use 'jose' library for Edge compatibility

const JWT_SECRET = process.env.JWT_SECRET;
// Convert the string secret to a Uint8Array for 'jose'
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Define paths that require authentication
const protectedPaths = [
    '/profile', // Example: User profile page
    // '/orders',  // Example: User orders page
    '/admin',   // Example: Admin dashboard (prefix match)
    // Add any other paths or API routes that need protection
    // '/api/protected-route',
];

// Define paths that should be accessible only when NOT logged in
const publicOnlyPaths = [
    '/login',
    '/register',
];

export async function middleware(request: NextRequest) {
    console.log(`Middleware running for path: ${request.nextUrl.pathname}`); // Log path

    // 1. Check if JWT_SECRET is configured
    if (!JWT_SECRET || secretKey.length === 0) {
        console.error("JWT_SECRET is not configured correctly in middleware.");
        // Avoid leaking internal errors, redirect or show generic error page
        // For simplicity, let's allow access but log error during dev
        // In production, you might redirect to an error page or block access.
         if (process.env.NODE_ENV === 'production') {
            // Maybe return new Response("Internal Server Error", { status: 500 });
            // Or redirect to a dedicated error page
         }
         // Allow request to proceed in dev if secret is missing, but warn loudly
        return NextResponse.next();
    }

    // 2. Get the token from the cookie
    const token = request.cookies.get('sessionToken')?.value;
    console.log("Token from cookie:", token ? "found" : "not found"); // Log token presence

    let userPayload: { userId?: string; [key: string]: any } | null = null;

    // 3. Verify the token if it exists
    if (token) {
        try {
            // Verify using 'jose' library suitable for Edge runtime
            const { payload } = await jwtVerify(token, secretKey, {
                // Specify expected algorithms if necessary (HS256 is default for sign)
                // algorithms: ['HS256'],
            });
            console.log("Token verification successful, payload:", payload);
            userPayload = payload as { userId?: string; [key: string]: any };
        } catch (error: any) {
            console.warn("Token verification failed:", error.code || error.message); // Log verification errors (e.g., expired)
            // Invalid token - treat as logged out
        }
    }
    
    userPayload = null;
    const { pathname } = request.nextUrl;
    const isUserLoggedIn = !!userPayload; // True if verification succeeded

    console.log("User logged in:", isUserLoggedIn);
    console.log("Current path:", pathname);


    // 4. Handle protected paths
    const isAccessingProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    if (isAccessingProtectedPath && !isUserLoggedIn) {
        console.log("Unauthorized access to protected path, redirecting to login.");
        // Redirect to login, preserving the originally requested URL for redirect after login
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirectedFrom', pathname); // Optional: tell login where user came from
        return NextResponse.redirect(url);
    }

    // 5. Handle public-only paths (login/register)
    const isAccessingPublicOnlyPath = publicOnlyPaths.some(path => pathname.startsWith(path));
    if (isAccessingPublicOnlyPath && isUserLoggedIn) {
        console.log("Logged-in user accessing public-only path, redirecting to homepage.");
        // Redirect logged-in users away from login/register to the homepage
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // 6. If none of the above, allow the request to proceed
    console.log("Allowing request to proceed.");
    // You could potentially add the user payload to request headers here
    // if needed by Server Components (requires cloning headers)
    // const requestHeaders = new Headers(request.headers);
    // if (userPayload) {
    //    requestHeaders.set('x-user-payload', JSON.stringify(userPayload));
    // }
    // return NextResponse.next({ request: { headers: requestHeaders } });

    return NextResponse.next(); // Continue to the requested page/route
}

// Specify which paths the middleware should run on using the matcher
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes - we might protect these individually later if needed)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - / (Homepage - adjust if homepage needs protection)
         * - /shop (Shop page - adjust if shop needs protection)
         * - /product/:path* (Product detail pages - adjust if needed)
         * - lena.png (assume it's the public logo)
         */
         // Apply middleware to MOST paths, then use logic inside to differentiate
        '/((?!api|_next/static|_next/image|favicon.ico|lena.png).*)',
         // Or, be more specific about which paths to include:
         // '/profile/:path*',
         // '/orders/:path*',
         // '/admin/:path*',
         // '/login',
         // '/register',
         // Add other paths you want the middleware to intercept
    ],
};