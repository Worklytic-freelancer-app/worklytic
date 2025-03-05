import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./utils/jwt";

export async function middleware(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("user", JSON.stringify(payload));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Error in middleware:", error);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/users", "/api/users/:path*", "/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};



// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { verifyToken } from "./utils/jwt";

// export async function middleware(request: NextRequest) {
//   try {
//     const publicPaths = ["/", "/terms", "/privacy", "/maintenance"];
//     const path = request.nextUrl.pathname;

//     if (publicPaths.includes(path)) {
//       return NextResponse.next();
//     }
    
//     const token = request.headers.get("Authorization")?.split(" ")[1];

//     if (!token) {
//       return NextResponse.json(
//         { message: "Authentication required" },
//         { status: 401 }
//       );
//     }

//     const payload = await verifyToken(token);
    
//     const requestHeaders = new Headers(request.headers);
//     requestHeaders.set("user", JSON.stringify(payload));

//     return NextResponse.next({
//       request: {
//         headers: requestHeaders,
//       },
//     });
//   } catch (error) {
//     console.error("Error in middleware:", error);
//     return NextResponse.json(
//       { message: "Invalid token" },
//       { status: 401 }
//     );
//   }
// }

// export const config = {
//     matcher: [
//       "/api/:path*",
//       "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
//     ],
//   };