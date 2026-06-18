import { type NextRequest, NextResponse } from "next/server"
import { BBL_PREVIEW_COOKIE, getBblPreviewToken } from "~/lib/bbl-preview"

/**
 * Ungated-preview unlock for the BBL pre-launch holding page.
 *
 * A previewer (admin / stakeholder) opens `/preview?token=<BBL_PREVIEW_TOKEN>`;
 * a matching token sets the `bbl_preview` cookie and redirects home, so the
 * countdown gate in the `(web)` layout lets them through to the real site. A
 * wrong/absent token just redirects home (still gated). Route handlers are not
 * wrapped by the layout, so this runs regardless of the gate.
 */
export function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  const response = NextResponse.redirect(new URL("/", request.url))

  if (token && token === getBblPreviewToken()) {
    response.cookies.set(BBL_PREVIEW_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  return response
}
