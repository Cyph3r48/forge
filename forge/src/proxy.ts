import { createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function sameSecret(actual: string, expected: string) {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(actual), digest(expected));
}

function error(status: number, message: string) {
  const response = NextResponse.json({ ok: false, error: message }, { status });
  response.headers.set("Cache-Control", "no-store");
  if (status === 401) response.headers.set("WWW-Authenticate", "Bearer");
  return response;
}

function isSameOrigin(request: NextRequest, origin: string) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin";
  try {
    const supplied = new URL(origin);
    return supplied.host === request.headers.get("host") && supplied.protocol === request.nextUrl.protocol;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const token = process.env.FORGE_AUTH_TOKEN?.trim();
  if (!token) return error(503, "Forge authentication is not configured");

  const authorization = request.headers.get("authorization") ?? "";
  if (!sameSecret(authorization, `Bearer ${token}`)) {
    return error(401, "Authentication required");
  }

  const origin = request.headers.get("origin");
  if (WRITE_METHODS.has(request.method) && origin && !isSameOrigin(request, origin)) {
    return error(403, "Cross-origin writes are not allowed");
  }

  return NextResponse.next();
}

export const config = { matcher: "/api/factory/:path*" };
