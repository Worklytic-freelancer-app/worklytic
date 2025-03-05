console.log("middleware.ts");

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./utils/jwt";

export async function middleware(request: NextRequest) {
    // Allow public access to the main page and other public pages
    const publicPaths = ["/", "/terms", "/privacy", "/maintenance"];
    const path = request.nextUrl.pathname;
    
    // Skip middleware for public pages
    if (publicPaths.includes(path)) {
        return NextResponse.next();
    }
    
    // Skip middleware for static assets
    if (
        path.startsWith("/_next") || 
        path.startsWith("/favicon.ico") || 
        path.includes(".") // files with extensions are usually static
    ) {
        return NextResponse.next();
    } 
  
    try {
        // For API routes and protected pages, check auth
        if (path.startsWith("/api/") && !path.startsWith("/api/auth")) {
            const token = request.headers.get("Authorization")?.split(" ")[1];

            if (!token) {
                return NextResponse.json(
                    { message: "Authentication required" },
                    { status: 401 }
                );
            }

            const payload = await verifyToken(token);
            
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set("user", JSON.stringify(payload));

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        }
        
        // For other routes, allow access
        return NextResponse.next();
    } catch (error) {
        console.error("Error in middleware:", error);
        return NextResponse.json(
            { message: "Invalid token" },
            { status: 401 }
        );
    }
}

export const config = {
    matcher: [
        "/api/:path*",
        "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
    ],
};