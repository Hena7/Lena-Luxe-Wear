// src/app/api/auth/logout/route.ts

import { NextResponse } from 'next/server';
import cookie from 'cookie'; // Need cookie library again

// Handle POST (or GET, though POST is slightly safer against accidental logout via links/prefetching)
// requests to clear the session cookie
export async function POST(request: Request) {
  try {
    console.log("API Logout: Attempting to clear session token cookie.");

    // Serialize a cookie with the same name, but make it expire immediately
    // and clear its value.
    const sessionCookie = cookie.serialize(
        'sessionToken', // Must match the name of the cookie set during login
        '',             // Set value to empty string
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            // Set maxAge to 0 or a past date to expire it immediately
            maxAge: 0,
            // Or use expires: new Date(0) // Sets expiration to epoch time
            sameSite: 'lax',
            path: '/',     // Must match the path set during login
        }
    );

    // Return a success response with the instruction to clear the cookie
    return NextResponse.json(
        { message: "Logout successful." },
        {
            status: 200,
            headers: {
                'Set-Cookie': sessionCookie, // The key step: send back header to expire the cookie
            },
        }
    );

  } catch (error) {
       console.error("Logout failed:", error);
       return NextResponse.json(
           { message: "An error occurred during logout.", error: error instanceof Error ? error.message : 'Unknown error' },
           { status: 500 }
       );
  }
}

// Optional: Allow GET requests for logout too, redirecting afterwards
// export async function GET(request: Request) {
//    const response = await POST(request); // Reuse POST logic
//    if (response.status === 200) {
//        // Redirect to homepage after clearing cookie via GET
//        const url = new URL('/', request.url); // Base URL
//        return NextResponse.redirect(url.toString(), { headers: response.headers });
//    }
//    return response; // Return error response if POST logic failed
// }