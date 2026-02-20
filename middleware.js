import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // 1. Admin Protection Logic
    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.rewrite(new URL("/not-found", req.url));
    }
    
    // 2. Ensure we aren't accidentally trapping public blog routes
    // (Though not in matcher, this is a safety check)
    if (pathname.startsWith("/blogs/") && !["post", "my-blogs", "edit"].some(path => pathname.includes(path))) {
       return NextResponse.next();
    }
  },
  {
    callbacks: {
      // Only require a token for the routes matched in the config below
      authorized: ({ token }) => !!token,
    },
  }
);

// Define which routes REQUIRE authentication
export const config = {
  matcher: [
    "/upload",
    "/notes/upload",
    "/feed",
    "/chat/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/collections/:path*",
    "/blogs/post",       // Creation
    "/blogs/my-blogs",   // Management
    "/blogs/edit/:path*", // Editing
  ],
};