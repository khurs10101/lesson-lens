import { NextRequest, NextResponse } from "next/server";

const GATE_TOKEN = process.env.GATE_TOKEN;

export default function middleware(req: NextRequest) {
  // If gate is not configured, allow everything (local dev)
  if (!GATE_TOKEN) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Always allow login/logout pages and APIs
  if (pathname === "/login" || pathname === "/api/login" || pathname === "/api/logout") {
    return NextResponse.next();
  }

  // Check gate cookie
  const cookie = req.cookies.get("gate");
  if (cookie?.value === GATE_TOKEN) {
    return NextResponse.next();
  }

  // Return 401 for API routes, redirect to login for pages
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
