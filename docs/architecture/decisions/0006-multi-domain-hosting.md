# ADR 0006 — Multi-domain hosting on one Vercel deployment

**Status:** Accepted
**Date:** 2026-04-25

## Context

Each brand on the new stack has its own marketing identity and ideally its own apex domain (e.g., `ronindojodesign.com`, `baselinemartialarts.com`, `&lt;bbl-domain&gt;`, `wekafusa.com` — final domain names TBD per brand). All brands share one Postgres DB and one Next.js codebase. Need a routing strategy that keeps brands on their own domains without forking the codebase.

## Decision

Configure all brand domains as custom domains on a **single Vercel deployment** of `apps/web`. Use Next.js middleware to read `request.headers.host`, map it to a `Brand` enum value, and inject `activeBrand` into the request context (cookie + header) for downstream route handlers and server components.

```ts
// apps/web/middleware.ts (sketch)
const HOST_TO_BRAND: Record<string, Brand> = {
  'ronindojodesign.com':     'RONIN_DOJO_DESIGN',
  'baselinemartialarts.com': 'BASELINE_MARTIAL_ARTS',
  '<bbl-domain>':            'BBL',
  'wekafusa.com':            'WEKAF',
  // localhost & previews fall back to a default
};

export function middleware(req: NextRequest) {
  const host = req.headers.get('host')?.split(':')[0] ?? '';
  const brand = HOST_TO_BRAND[host] ?? 'RONIN_DOJO_DESIGN';
  const res = NextResponse.next();
  res.cookies.set('brand', brand, { httpOnly: false, sameSite: 'lax' });
  res.headers.set('x-brand', brand);
  return res;
}
```

## Consequences

### Positive

- One deploy, four domains. CI ships every brand at once.
- Each brand keeps its own marketing URL — no `/baseline` path prefixes.
- Brand resolution happens once, at the edge — server components and API routes downstream just read it.
- Cross-brand admin tooling (Ronin Dojo Design) can serve a different UI from the same code via `if (brand === 'RONIN_DOJO_DESIGN')` branches in layout components.

### Negative

- Per-brand SEO, sitemaps, robots.txt must be brand-aware (handled in `app/robots.ts` and `app/sitemap.ts` by reading the host).
- Vercel Preview deployments need a default brand (typically `RONIN_DOJO_DESIGN`) since previews use `*.vercel.app` URLs.
- Brand-aware OG images / metadata needs branching in `generateMetadata`.

## Brand context vs. user's active brand

Two distinct concepts that must not be conflated:

- **`brand`** (from middleware/host) — *which marketing site is the user looking at*. Determines theme, copy, marketing pages, default routing.
- **`session.user.activeBrandId`** (from auth context) — *which brand a multi-brand user has switched into*. Determines `where: { brand }` clauses in Prisma queries for app data.

For single-brand users they're always equal. For multi-brand users (instructors, admins), they can diverge — an admin browsing `wekafusa.com` while authenticated as a Ronin Dojo Design admin sees the WEKAF site chrome but their own admin-scope queries.

See [ADR 0008](0008-brand-switcher.md) for the switcher UX.

## DNS configuration

Each brand's domain (registered at Bluehost or wherever) gets:

- `A` record → Vercel's anycast IPs (or `CNAME` for subdomains)
- Vercel custom-domain config in the project settings
- Auto SSL via Vercel
