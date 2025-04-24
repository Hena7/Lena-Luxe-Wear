// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWTPayload, jwtVerify } from 'jose';
import type { Role } from '@prisma/client'; // Import Role enum type if needed for comparison

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Define protected paths (can differentiate general vs admin)
const protectedPaths = ['/profile', '/orders']; // Needs login
const adminOnlyPaths = ['/admin', '/admin/users'];             // Needs login AND admin role

const publicOnlyPaths = ['/login', '/register'];

// Define type for expected JWT payload including role
interface UserJwtPayload extends JWTPayload{
  userId: string;
  email: string;
  role: Role  | string; // Use the imported Role enum or just 'string' if not importing
  iat?: number; // Issued at (standard JWT claim)
  exp?: number; // Expiration time (standard JWT claim)
}

export async function middleware(request: NextRequest) {
    console.log(`Middleware running for path: ${request.nextUrl.pathname}`);

    if (!JWT_SECRET || secretKey.length === 0) {
        // ... (handle missing secret as before) ...
        return NextResponse.next(); // Allow in dev, block/redirect in prod
    }

    const token = request.cookies.get('sessionToken')?.value;
    let userPayload: UserJwtPayload | null = null;

    if (token) {
        try {
            const { payload } = await jwtVerify(token, secretKey);
            console.log("Token verification successful, payload:", payload);
             // Type assertion might be needed if Role enum isn't directly inferred
             userPayload = payload as UserJwtPayload;
        } catch (error: any) {
            console.warn("Token verification failed:", error.code || error.message);
            userPayload = null;
        }
    }




    
    const { pathname } = request.nextUrl;
    const isUserLoggedIn = !!userPayload;
    // Check if the logged-in user is an admin
    const isUserAdmin = isUserLoggedIn && userPayload?.role === 'ADMIN'; // Check role

    console.log(`User logged in: ${isUserLoggedIn}, Is Admin: ${isUserAdmin}`);
    console.log(`Current path: ${pathname}`);

    // --- Routing Logic ---

    // 1. Handle Admin-Only Paths
    const isAccessingAdminPath = adminOnlyPaths.some(path => pathname.startsWith(path));
    if (isAccessingAdminPath) {
         if (!isUserLoggedIn) {
             console.log("Unauthorized access to ADMIN path (not logged in), redirecting to login.");
             return NextResponse.redirect(new URL(`/login?redirectedFrom=${pathname}`, request.url));
         }
         if (!isUserAdmin) {
              console.log("Forbidden access to ADMIN path (not admin role), redirecting to home (or show 403).");
             // Option A: Redirect to homepage
             return NextResponse.redirect(new URL('/', request.url));
             // Option B: Show a simple forbidden message (or render a proper 403 page)
             // return new NextResponse("Forbidden: Access Denied", { status: 403 });
         }
          // If logged in AND admin, allow access to admin paths
         console.log("Admin access granted.");
         return NextResponse.next();
     }

    // 2. Handle General Protected Paths
    const isAccessingProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    if (isAccessingProtectedPath && !isUserLoggedIn) {
        console.log("Unauthorized access to protected path, redirecting to login.");
        return NextResponse.redirect(new URL(`/login?redirectedFrom=${pathname}`, request.url));
    }

    // 3. Handle Public-Only Paths
    const isAccessingPublicOnlyPath = publicOnlyPaths.some(path => pathname.startsWith(path));
    if (isAccessingPublicOnlyPath && isUserLoggedIn) {
        console.log("Logged-in user accessing public-only path, redirecting to homepage.");
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 4. Allow access to all other paths
    console.log("Allowing request to proceed.");
    return NextResponse.next();
}

// --- Matcher ---
// Update matcher if needed to include /admin paths for checking
export const config = {
    matcher: [
        //'/((?!api|_next/static|_next/image|favicon.ico|lena.png).*)', // General matcher
         // Or be more explicit:
         '/profile/:path*',
         '/orders/:path*',
         '/admin/:path*', // <<< Make sure admin paths are intercepted
         '/login',
         '/register',
    ],
};

// export async function middleware(request: NextRequest) {
//     console.log(`Middleware running for path: ${request.nextUrl.pathname}`); // Log path
//     // 1. Check if JWT_SECRET is configured
//     if (!JWT_SECRET || secretKey.length === 0) {
//         console.error("JWT_SECRET is not configured correctly in middleware.");
//         // Avoid leaking internal errors, redirect or show generic error page
//         // For simplicity, let's allow access but log error during dev
//         // In production, you might redirect to an error page or block access.
//          if (process.env.NODE_ENV === 'production') {
//             // Maybe return new Response("Internal Server Error", { status: 500 });
//             // Or redirect to a dedicated error page
//          }
//          // Allow request to proceed in dev if secret is missing, but warn loudly
//         return NextResponse.next();
//     }

//     // 2. Get the token from the cookie
//     const token = request.cookies.get('sessionToken')?.value;
//     console.log("Token from cookie:", token ? "found" : "not found"); // Log token presence

//     let userPayload: { userId?: string; [key: string]: any } | null = null;

//     // 3. Verify the token if it exists
//     if (token) {
//         try {
//             // Verify using 'jose' library suitable for Edge runtime
//             const { payload } = await jwtVerify(token, secretKey, {
//                 // Specify expected algorithms if necessary (HS256 is default for sign)
//                 // algorithms: ['HS256'],
//             });
//             console.log("Token verification successful, payload:", payload);
//             userPayload = payload as { userId?: string; [key: string]: any };
//         } catch (error: any) {
//             console.warn("Token verification failed:", error.code || error.message); // Log verification errors (e.g., expired)
//             // Invalid token - treat as logged out
//         }
//     }
    
//     userPayload = null;
//     const { pathname } = request.nextUrl;
//     const isUserLoggedIn = !!userPayload; // True if verification succeeded

//     console.log("User logged in:", isUserLoggedIn);
//     console.log("Current path:", pathname);


//     // 4. Handle protected paths
//     const isAccessingProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
//     if (isAccessingProtectedPath && !isUserLoggedIn) {
//         console.log("Unauthorized access to protected path, redirecting to login.");
//         // Redirect to login, preserving the originally requested URL for redirect after login
//         const url = request.nextUrl.clone();
//         url.pathname = '/login';
//         url.searchParams.set('redirectedFrom', pathname); // Optional: tell login where user came from
//         return NextResponse.redirect(url);
//     }

//     // 5. Handle public-only paths (login/register)
//     const isAccessingPublicOnlyPath = publicOnlyPaths.some(path => pathname.startsWith(path));
//     if (isAccessingPublicOnlyPath && isUserLoggedIn) {
//         console.log("Logged-in user accessing public-only path, redirecting to homepage.");
//         // Redirect logged-in users away from login/register to the homepage
//         const url = request.nextUrl.clone();
//         url.pathname = '/';
//         return NextResponse.redirect(url);
//     }

//     // 6. If none of the above, allow the request to proceed
//     console.log("Allowing request to proceed.");
//     // You could potentially add the user payload to request headers here
//     // if needed by Server Components (requires cloning headers)
//     // const requestHeaders = new Headers(request.headers);
//     // if (userPayload) {
//     //    requestHeaders.set('x-user-payload', JSON.stringify(userPayload));
//     // }
//     // return NextResponse.next({ request: { headers: requestHeaders } });

//     return NextResponse.next(); // Continue to the requested page/route
// }

// // Specify which paths the middleware should run on using the matcher
// export const config = {
//     matcher: [
//         /*
//          * Match all request paths except for the ones starting with:
//          * - api (API routes - we might protect these individually later if needed)
//          * - _next/static (static files)
//          * - _next/image (image optimization files)
//          * - favicon.ico (favicon file)
//          * - / (Homepage - adjust if homepage needs protection)
//          * - /shop (Shop page - adjust if shop needs protection)
//          * - /product/:path* (Product detail pages - adjust if needed)
//          * - lena.png (assume it's the public logo)
//          */
//          // Apply middleware to MOST paths, then use logic inside to differentiate
//         '/((?!api|_next/static|_next/image|favicon.ico|lena.png).*)',
//          // Or, be more specific about which paths to include:
//          // '/profile/:path*',
//          // '/orders/:path*',
//          // '/admin/:path*',
//          // '/login',
//          // '/register',
//          // Add other paths you want the middleware to intercept
//     ],
// };