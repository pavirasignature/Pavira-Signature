import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// We cache the redirects in memory for a short time to avoid hitting the backend on every request
let redirectsCache: Record<string, string> | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

// Basic in-memory rate limiting map for the Edge instance
// Note: In Vercel Edge, this is per-isolate. It's not perfectly global but it mitigates localized spam.
const ipRequestMap = new Map<string, { count: number; lastReset: number }>();
const EDGE_RATE_LIMIT = 300; // max 300 hits per IP per minute per edge instance
const EDGE_WINDOW_MS = 60 * 1000;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const now = Date.now();

  // 1. Edge-level rate limit and security check
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "";
  
  // Block blatantly bad requests (e.g., missing User-Agent in non-API contexts, though sometimes bots don't have it)
  // We'll just rely on rate limiting to be safe.
  if (ip !== "unknown") {
    const record = ipRequestMap.get(ip) || { count: 0, lastReset: now };
    
    if (now - record.lastReset > EDGE_WINDOW_MS) {
      record.count = 1;
      record.lastReset = now;
    } else {
      record.count++;
    }
    
    ipRequestMap.set(ip, record);

    if (record.count > EDGE_RATE_LIMIT) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  // Skip middleware for static files, API routes, and internal Next.js requests
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (!redirectsCache || now - lastFetchTime > CACHE_TTL) {
    // Set fallback cache first to prevent concurrent requests from piling up fetches
    redirectsCache = redirectsCache || {};
    lastFetchTime = now;

    try {
      let apiUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      
      // Edge middleware fetch needs an absolute URL. Prepend request origin if relative.
      if (apiUrl.startsWith("/")) {
        const origin = request.nextUrl.origin;
        apiUrl = `${origin}${apiUrl}`;
      } else if (!apiUrl.includes("/api")) {
        apiUrl = `${apiUrl.replace(/\/$/, "")}/api`;
      }

      // Set a short timeout to prevent blocking page load if the backend has a cold start
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);

      const res = await fetch(`${apiUrl}/redirects`, {
        signal: controller.signal,
        next: { revalidate: 300 }, // 5 minutes
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          redirectsCache = data.data;
        }
      }
    } catch (error) {
      console.error("Error fetching redirects in middleware:", error);
    }
  }

  // Check if current path needs redirection
  if (redirectsCache && redirectsCache[pathname]) {
    const newPath = redirectsCache[pathname];
    const targetUrl = new URL(newPath, request.url);
    // Use 301 Permanent Redirect for SEO
    return NextResponse.redirect(targetUrl, 301);
  }

  return NextResponse.next();
}

// Only run middleware on non-API, non-static routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
