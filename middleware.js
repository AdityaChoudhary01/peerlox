// proxy.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // 1. Rename function to 'proxy'
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin Protection Logic
    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      // Use rewrite to hide the fact that the page exists (Security by Obscurity)
      return NextResponse.rewrite(new URL("/not-found", req.url));
    }
    
    // Safety check for public routes
    if (pathname.startsWith("/blogs/") && !["post", "my-blogs", "edit"].some(p => pathname.includes(p))) {
       return NextResponse.next();
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/notes/upload",
    "/feed",
    "/chat/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/collections/:path*",
    "/blogs/post",
    "/blogs/my-blogs",
    "/blogs/edit/:path*",
  ],
};