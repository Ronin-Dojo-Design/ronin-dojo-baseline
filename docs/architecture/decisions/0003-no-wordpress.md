# ADR 0003 — No WordPress

**Status:** Accepted
**Date:** 2026-04-25

## Context

Original framing assumed WordPress hosting at the apex domain (`/Users/brianscott/Local Sites/ronin-dojo/app/public/`), with a React app mounted via shortcodes. An interim plan kept WP for `/blog/*` only. User pushed back: "Is there really any reason I am keeping WP at all?"

## Decision

Drop WordPress entirely from the new architecture. The Local install at `/Users/brianscott/Local Sites/ronin-dojo/app/public/` is no longer in the deployment path; ignore or delete it.

Blog/marketing content lives as **MDX in `apps/web/content/blog/`**, rendered via Dirstarter's `content-collections.ts` setup. Editorial UX deferred — add **Keystatic** (git-backed) or **TinaCMS** (visual editing) later if and only if a non-dev co-author joins.

## Consequences

**Positive**

- One stack, one auth, one deploy, one security perimeter.
- No PHP runtime, no Wordfence, no SMTP plugin, no plugin-update treadmill.
- Articles version-controlled and reviewable as PRs.
- Bluehost DNS just points the apex A/CNAME at Vercel — domain registrar is unchanged.

**Negative**

- No WP article editor for non-technical writers (acceptable: solo build, no co-authors today).
- Lose the WP plugin ecosystem (Yoast, RankMath, etc.) — replaced by Next.js metadata APIs and structured-data helpers in Dirstarter.

## Alternatives considered

- **WP at `/blog/*` only:** rejected as vestigial overhead — see context.
- **Headless WP feeding Next.js via REST/GraphQL:** rejected — same maintenance tax, no editorial benefit for solo author.
