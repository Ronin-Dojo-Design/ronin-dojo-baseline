import { readFile } from "node:fs/promises"
import path from "node:path"
import type { NextRequest } from "next/server"
import { getServerSession } from "~/lib/auth"
import { can } from "~/server/orpc/permissions"

export async function GET(request: NextRequest) {
  const session = await getServerSession(request)

  // Action gate (authz-conformance sweep item 3): route through `can()` — the ONLY
  // authorized reader of role for action gates — instead of a raw role check.
  // `repo-docs.manage` is held by no non-admin role, so admins still pass via `["*"]`
  // and FI-019 override grantees can be admitted without a code change. 404 (not 403)
  // is deliberate — do not reveal that admin routes exist.
  if (!can(session?.user, "repo-docs.manage")) {
    return new Response("Not found", { status: 404 })
  }

  const html = await readFile(resolveDocsNavigatorPath(), "utf8")

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}

const resolveDocsNavigatorPath = () => {
  const cwd = process.cwd()
  const candidates = [
    path.join(cwd, "docs", "index.html"),
    path.join(cwd, "..", "..", "docs", "index.html"),
  ]

  return candidates[0].includes(`${path.sep}apps${path.sep}web${path.sep}`)
    ? candidates[1]
    : candidates[0]
}
