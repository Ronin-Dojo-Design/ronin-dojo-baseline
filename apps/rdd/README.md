# apps/rdd — Ronin Dojo Design marketing site

The public marketing surface for `ronindojodesign.com` (SESSION_0625). Static Next.js app, no DB,
no Prisma, no auth — one page.

## Deploy unit (`vercel.json` rationale)

RDD is its own Vercel project (`ronindojodesign`) per ADR 0034 (per-product deploy unit) and
ADR 0051 (kernel→brand→app: app = deploy unit). The Vercel project's **Root Directory is
`apps/rdd`** (relative path, no leading slash — the dashboard rejects `/apps/rdd`).

Why the `vercel.json` looks the way it does (this prose lived in a `_comment_deploy_unit` key
inside the JSON until SESSION_0635 — Vercel's CLI `vercel deploy` schema-validates and rejects
unknown keys, even though git-triggered builds tolerate them):

- **Workspace shape:** install and build both `cd ../..` because this is a BUN WORKSPACE member
  (one root `bun.lock`), unlike `clients/*` which are standalone and install in place.
- **No `db:generate` step:** RDD has no Prisma schema (SESSION_0625). If a DB lands, add it the
  way `apps/web` does.
- **`ignoreCommand`:** returns 0 (= skip build) when NONE of these paths changed — scoped to
  `apps/rdd` + the shared kernel it consumes (a `packages/ui-kit` change CAN break RDD, so it must
  rebuild) + root install/config. Markdown is excluded so a docs-only edit inside those paths does
  not deploy (the same false-positive SESSION_0501 fixed for BBL).
- **Deliberately NOT broadened to `apps/*`:** an `apps/web` or `apps/baseline` change must NEVER
  rebuild RDD, and — the direction that matters — BBL is live and paid, so its own root
  `vercel.json` stays scoped to `apps/web` and cannot be triggered by anything here.

## DNS (Bluehost, ADR 0015)

Nameservers stay at Bluehost — never delegate to Vercel. A `@` → the IP the Vercel dashboard shows
for THIS domain (dashboard is the only trustworthy source; the value differs per domain/vintage);
CNAME `www` → `cname.vercel-dns.com`.
