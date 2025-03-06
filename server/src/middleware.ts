import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./utils/jwt";

export async function middleware(request: NextRequest) {
  try {
    // // Periksa apakah ini adalah rute autentikasi yang tidak memerlukan token
    // if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    //   return NextResponse.next();
    // }

    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
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
    return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
  }
}

export const config = {
  matcher: [
    "/api/users/:path*",
    "/api/projects/:path*",
    "/api/services/:path*",
    "/api/projectfeatures/:path*",
    "/api/projectdiscussions/:path*",
    // "/api/payments/:path*",
    // Tambahkan endpoint lain yang memerlukan autentikasi
    // PENTING: Jangan sertakan endpoint autentikasi
  ],
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

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { verifyToken } from "./utils/jwt";

// // Helper function untuk memeriksa apakah path dilewatkan
// function shouldSkipAuth(path: string): boolean {
//     // Lewati autentikasi untuk path tertentu
//     return path.includes('/api/auth/') ||
//            path.includes('/api/projects/') ||
//            path.includes('/api/services/');
// }

// export async function middleware(request: NextRequest) {
//     // Dapatkan path dari request
//     const path = request.nextUrl.pathname;

//     // Skip authentication untuk path tertentu
//     if (shouldSkipAuth(path)) {
//         return NextResponse.next();
//     }

//     try {
//         const token = request.headers.get("Authorization")?.split(" ")[1];

//         if (!token) {
//             return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
//         }

//         const payload = await verifyToken(token);

//         const requestHeaders = new Headers(request.headers);
//         requestHeaders.set("user", JSON.stringify(payload));

//         return NextResponse.next({
//             request: {
//                 headers: requestHeaders,
//             },
//         });
//     } catch (error) {
//         console.error("Error in middleware:", error);
//         return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
//     }
// }

// export const config = {
//     matcher: [
//         // Terapkan middleware ke semua routes
//         "/api/services/aiRecommendations",
//         "/api/projects/aiRecommendations",
//         "/api/users/:path*",
//     ]
// };
