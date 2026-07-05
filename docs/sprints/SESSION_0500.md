# SESSION_0500 — Epic B: Mobile shell (bottom nav + radial MAB)

Branch: `session-0500-epic-b` (off `origin/main` `24737a19`). Worktree: `/Users/brianscott/dev/ronin-0500-epic-b`.
Spec: `docs/petey-plan-0494-experience-epics.md` §EPIC B. Locked decisions from operator + Petey (see task brief).

Slices: B0 bottom nav · B1 radial movable MAB (admin-only) · B2 bottom-sheet host · B3 haptics.

---

## Pre-flight: BottomNav (B0)

### 1. Existing component scan
- Searched `components/web/` for: nav, sheet, tab, bottom → `components/web/nav/nav-sheet.tsx` (the hamburger drawer,
  right slide-in, `Sheet` primitive), `components/web/header.tsx` (mounts NavSheet + hamburger button),
  `components/web/ui/nav-link.tsx` (the `NavLink` L1 nav item with active-state variant).
- Searched `components/common/` for: sheet, drawer → `sheet.tsx` (side panel), `drawer.tsx` (bottom-sheet).
- Found: **NO existing bottom nav.** Net-new component. Hamburger drawer = `NavSheet` (demote target).

### 2. L1 template scan
- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes (no bottom-nav entry — Dirstarter is a
  desktop directory; bottom nav is a BBL mobile-shell addition).
- Closest L1 pattern: `NavLink` (`components/web/ui/nav-link.tsx`) — the active-aware nav item, reused per tab.
- **Primitive API spot-check:**
  - `NavLink (href?, prefix?, suffix?, exact?, isActive?, isPadded?, render?, children)` — active auto-derives from
    `usePathname().startsWith(href)` unless `exact`/`isActive` override.
  - `useSession()` → `{ data: { user: { role, name, email, image, … } }, isPending }` (better-auth `adminClient`
    adds `role`).
  - `isAdmin(user: {role?})` → `role === "admin"` (client-safe, no Prisma).
- BBLApp reference (feel only, monorepo `src/brands/blackbeltlegacy/components/navigation/BottomNav.jsx`): 5-tab,
  `md:hidden fixed bottom-0`, active tab tinted, `safe-area-inset-bottom`. We DROP its center-create tab (creation
  lives in the MAB per operator).

### 3. Composition decision
- [x] New component `components/web/nav/bottom-nav.tsx` — no bottom-nav L1 exists. Composes `NavLink`-style items +
  reuses `NavSheet` (demoted to a "More" overflow tab, not duplicated).

### 4. Routes confirmed (pre-flight)
- **Dashboard** → `/app/profile` (the member home; `/dashboard` has NO `page.tsx` → 404. `(web)/dashboard/*` tabs
  all `redirect("/auth/login?next=/app/profile")` and the events breadcrumb labels `/app/profile` = "Dashboard").
  ⚠ nav-sheet's existing "Dashboard" → `/dashboard` link is a pre-existing 404 bug (flagged, out of scope to fully
  fix; bottom-nav routes to the working `/app/profile`).
- **Lineage** → `/lineage` (exists). **Directory** → `/directory` (exists). **Posts** → `/posts` (exists, labeled
  "Community"). **Profile** → `/app/profile` (same as Dashboard home target for members).
  - Resolution: Dashboard tab → `/app/profile`, Profile tab → `/app/profile?tab=profile` (distinct deep-link;
    profile tab still highlights on the profile surface). Keeps 5 distinct tabs.

### 5. Dev environment
- Dev server: `cd apps/web && npx next dev --turbo -p 3502` (bg → file; :3000 untouched).
- Verify: `bun run typecheck`, `bun run lint` (FIXER), `bunx oxfmt --check .`, `bun run test` (`--parallel=1`).

### 6. FAILED_STEPS check
- FS-0002 (dev server = `npx next dev`, not `bun dev`): acknowledged. FS-0001 (raw HTML over L1): using `NavLink`
  + `Link` + `Button`, no raw `<select>`/`<input>`.

---

## Pre-flight: Mab (B1) + BottomSheet (B2)

### 1. Existing component scan
- Searched for: fab, floating, radial, mab → the ONLY existing FAB is the mobile create-post FAB inside
  `components/web/community/community-feed.tsx` (`fixed right-5 bottom-5 z-40 md:hidden`, opens
  `CreateCommunityPostDialog`). **The MAB absorbs it** — the feed FAB hides when the MAB is mounted (admin) to
  avoid two FABs (operator: "MAB should ABSORB/replace it").
- Bottom-sheet host: `components/common/drawer.tsx` = THE bottom-sheet primitive (mobile slides up from bottom,
  `max-h-85vh`, `rounded-t-xl`, drag handle, swipe-to-dismiss, reduced-motion fallback). Compose, don't rebuild.

### 2. L1 / primitive API spot-check
- `Drawer / DrawerContent / DrawerHeader / DrawerTitle / DrawerDescription / DrawerFooter / DrawerClose`
  (`components/common/drawer.tsx`) — `Drawer(open, onOpenChange)`, `DrawerContent(showOverlay?, className?)`.
- `Button (variant: default|secondary|ghost|fancy|…, size: sm|md|lg|icon, prefix?, isPending?, render?)`.
- `motion` from `motion/react`; `useReducedMotion` from **`@mantine/hooks`** (returns `boolean`) — precedent
  `students-carousel-v2.tsx`, `lineage-honor-strip.tsx`.
- `can(user, permission)` from `server/orpc/permissions.ts` — pure, reads only role grants (client-safe;
  `matchesPattern` + `ROLES`). `isAdmin(user)` from `lib/authz-predicates.ts` — client-safe admin check.
- Haptics: `lib/haptics.ts` → `haptics.tap()` / `.select()` / `.success()` (no-op where unsupported; iOS Safari
  degrades silently — memory `motion-system-and-haptics-constraints`).

### 3. Composition decision
- [x] New `components/web/nav/mab.tsx` — net-new movable radial FAB (no existing radial). Composes `motion` +
  `Button` + `haptics` + `can()`; ABSORBS the community-feed FAB.
- [x] New `components/web/nav/mab-bottom-sheet.tsx` — thin host composing `Drawer` (B2). Hosts Create-Post +
  Upload forms in-context; Claim/verify + Log-promotion **navigate**.

### 4. MAB actions — routes + gates (pre-flight)
- **Claim/verify a person** → NAVIGATE `/app/lineage/claims` (admin claim review). Gate `can(user,"claims.manage")`
  (admin-only today).
- **Create Post** → BOTTOM-SHEET, hosts `CreateCommunityPostDialog` content feel. Gate `can(user,"posts.manage")`.
- **Upload photo/media** → BOTTOM-SHEET, hosts the admin `MediaUploader` (`uploadMediaToLibrary`, no target needed).
  Gate `can(user,"media.manage")`.
- **Log a promotion** → NAVIGATE `/app/events/new` ("New Promotion Event"). Gate `can(user,"tournaments.manage")`.
- Whole-MAB gate: `isAdmin(user)` (operator: admin-only for now). Each action additionally `can()`-gated.
- All 4 permissions are admin-only under today's flat `ROLES` (`user` grants = `belt.manage` only), so a non-admin
  never sees the MAB and, even if the whole-MAB gate widened, no action would render for non-admins.

### 5. Persistence (localStorage, zero migration)
- `lib/mab-preferences.ts` — per-device `localStorage` for BOTH the on/off toggle AND drag position (corner).
  Docblock notes the promotion path: on/off → per-account DB column + write action WHEN the MAB opens beyond admins.
  No schema column now.

### 6. FAILED_STEPS check
- Prisma-in-browser: `can()`/`isAdmin` are pure (no `services/db`), safe in client chrome. Confirmed
  `server/orpc/permissions.ts` imports only `roles` (types) — no Prisma.

---

## Build log

### Files created
- `apps/web/lib/mab-preferences.ts` — per-device `localStorage` for MAB on/off + corner; `MAB_ENABLED_EVENT`
  same-tab sync; docblock promotion path to per-account.
- `apps/web/components/web/nav/bottom-nav.tsx` — B0 mobile-only 5-tab bottom nav (session-aware, active-route
  highlight, "More" → demoted `NavSheet`).
- `apps/web/components/web/nav/mab.tsx` — B1 movable radial MAB (admin-only, drag+4-corner snap, toggle-off,
  4 role-gated actions, reduced-motion fallback, absorbs the community FAB).
- `apps/web/components/web/nav/mab-upload-sheet.tsx` — B2 bottom-sheet host (composes `Drawer`, hosts `MediaUploader`).
- `apps/web/components/web/nav/mab-toggle.tsx` — re-enable switch in the "More" drawer.
- `apps/web/components/web/nav/mobile-shell.tsx` — server wrapper (resolves `can()` server-side → booleans),
  mounts BottomNav always + Mab admin-only.
- `apps/web/messages/en/mobileShell.json` — i18n namespace.
- `apps/web/e2e/mobile-shell.spec.ts` — mobile-viewport proof (CI-skipped local aid).

### Files modified
- `apps/web/app/(web)/layout.tsx` — mount `<MobileShell>`; `max-md:pb-16` clears the fixed bottom nav.
- `apps/web/components/web/nav/nav-sheet.tsx` — admin-only `<MabToggle>` (demotion = it's now the "More" overflow).
- `apps/web/components/web/community/community-feed.tsx` — hide the mobile create FAB for admins (MAB absorbs it);
  non-admin FAB moved to `bottom-20 z-30` to clear the bottom nav.

### Resolved fork (Cody call)
- **Create-Post host.** Spec: both Create-Post + Upload open a bottom-sheet. `CreateCommunityPostDialog` is a
  shipped, tested `Dialog`-based create surface (login-gate + image upload) live on `/posts`. Re-hosting it in a
  `Drawer` would either duplicate the whole post form or refactor a tested surface (regression risk on `/posts`) —
  a worse tradeoff than reuse. **Call:** MAB Create-Post reuses `CreateCommunityPostDialog` as-is; Upload (the
  genuinely-light action) gets the ONE new bottom-sheet (`MabUploadSheet`). Both light actions still open
  in-context from the MAB. Flagged for Desi/Doug; trivially revisitable by extracting a `CommunityPostForm` body
  later if a Drawer host is required.

### Pre-existing issue flagged (out of scope)
- `nav-sheet.tsx` "Dashboard" links to `/dashboard`, which has NO `page.tsx` → 404. The member home is
  `/app/profile`. Bottom-nav routes to `/app/profile` (correct); the nav-sheet link is left as-is (separate fix).

### Gates (final SHA)
- `bun run typecheck` ✓ · `bun run lint` ✓ (no new-file issues; pre-existing warnings only) · `bunx oxfmt --check .` ✓
  · `bun run test` ✓ 1103 pass / 0 fail. No `"use server"` boundary touched → `next build` not required.
- Mobile-viewport e2e (:3502, chromium, 390px): 2/2 pass — admin (nav+MAB+fan+upload-sheet+drag/snap/persist+
  toggle-off/persist+re-enable+desktop-hidden), non-admin (5-tab nav, NO MAB). Screenshots in
  `apps/web/test-results/mobile-shell/`.
