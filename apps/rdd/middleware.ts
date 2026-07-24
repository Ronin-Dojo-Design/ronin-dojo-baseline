import { NextResponse, type NextRequest } from "next/server";

/**
 * v0 client-preview gate (SESSION_0678).
 *
 * HTTP Basic Auth against two env vars (`CLIENT_PREVIEW_USER` / `CLIENT_PREVIEW_PASS`), scoped
 * ONLY to `/clients/*`. Nothing else on this app passes through here.
 *
 * ── Honesty note ────────────────────────────────────────────────────────────────────────────
 * This is PREVIEW-GRADE access control, not real auth: one shared username/password for every
 * client, no sessions, no per-client scoping, no audit trail, no rate limiting, and the string
 * comparison below is not timing-safe. It exists so Mammoth (Michael) and BBL (Tony) have
 * *something* to look at today. The real client portal — per-client accounts, real auth, real
 * hosting for delivered artifacts — is being specced in the parallel 0677 lane; that spec's
 * Phase 1 replaces this file outright. Do not extend this gate; replace it.
 *
 * ── Fail-closed by omission ─────────────────────────────────────────────────────────────────
 * If either env var is unset, every `/clients/*` request 404s — same response as a route that
 * doesn't exist. A missing/misconfigured env var can never leak this area; it just makes the
 * area disappear. See SESSION_0678 "Residual for AM merge" for the Vercel env step this needs
 * before merge.
 *
 * ── Edge runtime constraint ──────────────────────────────────────────────────────────────────
 * Next.js middleware runs on the Edge runtime by default (no Node `crypto`/`Buffer`). `atob` is
 * a Web API available there and is used instead of `Buffer.from(..., "base64")`.
 */
export function middleware(request: NextRequest): NextResponse {
  const expectedUser = process.env.CLIENT_PREVIEW_USER;
  const expectedPass = process.env.CLIENT_PREVIEW_PASS;

  if (!expectedUser || !expectedPass) {
    return new NextResponse(null, { status: 404 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const encoded = authHeader.slice("Basic ".length).trim();
    let decoded = "";
    try {
      decoded = atob(encoded);
    } catch {
      decoded = "";
    }
    const separatorIndex = decoded.indexOf(":");
    const suppliedUser = separatorIndex === -1 ? decoded : decoded.slice(0, separatorIndex);
    const suppliedPass = separatorIndex === -1 ? "" : decoded.slice(separatorIndex + 1);

    if (suppliedUser === expectedUser && suppliedPass === expectedPass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="RDD client preview", charset="UTF-8"',
      "content-type": "text/plain",
    },
  });
}

export const config = {
  matcher: ["/clients/:path*"],
};
