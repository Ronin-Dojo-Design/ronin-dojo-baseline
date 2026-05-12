# ADR 0003 — No WordPress

**Status:** Accepted
**Date:** 2026-04-25

## Context

Original framing assumed WordPress hosting at the apex domain, with a React app mounted via shortcodes. An interim plan kept WP for `/blog/*` only. User pushed back: "Is there really any reason I am keeping WP at all?"

## Decision

Drop WordPress entirely from the new architecture. The exploratory WP Local install (originally at `/Users/brianscott/Local Sites/ronin-dojo/app/public/` during planning) is not part of the deployment path and can be deleted from the planning machine.

Blog/marketing content ~~lives as **MDX in `apps/web/content/blog/`**, rendered via Dirstarter's `content-collections.ts` setup~~ is now **DB-backed via the `Post` model** with Markdown content rendered by `react-markdown` (SESSION_0136–0137; content-collections removed). Editorial UX deferred — Tiptap rich text editor planned for a future session.

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
