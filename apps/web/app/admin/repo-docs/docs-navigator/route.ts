import { readFile } from "node:fs/promises"
import path from "node:path"
import type { NextRequest } from "next/server"
import { getServerSession } from "~/lib/auth"

export async function GET(request: NextRequest) {
  const session = await getServerSession(request)

  if (session?.user.role !== "admin") {
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
