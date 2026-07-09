import { NextRequest, NextResponse } from "next/server";

const getBackendBaseUrl = () => {
  const explicit = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (explicit) {
    return explicit.replace(/\/api\/?$/, "");
  }
  return "http://localhost:5000";
};

async function forward(request: NextRequest) {
  try {
    const backendBaseUrl = getBackendBaseUrl();
    const targetPath = request.nextUrl.searchParams.get("path") || "";
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    searchParams.delete("path");
    const query = searchParams.toString();
    const targetUrl = `${backendBaseUrl}/api/${targetPath}${query ? `?${query}` : ""}`;

    const headers = new Headers(request.headers);
    headers.delete("host");

    const init: RequestInit = {
      method: request.method,
      headers,
      redirect: "manual",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = await request.text();
    }

    const response = await fetch(targetUrl, init);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to reach backend service" },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest) {
  return forward(request);
}

export async function POST(request: NextRequest) {
  return forward(request);
}

export async function PUT(request: NextRequest) {
  return forward(request);
}

export async function PATCH(request: NextRequest) {
  return forward(request);
}

export async function DELETE(request: NextRequest) {
  return forward(request);
}

export async function OPTIONS(request: NextRequest) {
  return forward(request);
}
