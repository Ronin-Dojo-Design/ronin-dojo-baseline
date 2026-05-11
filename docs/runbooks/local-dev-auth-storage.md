---
title: "Local Dev Auth + Storage Runbook"
slug: local-dev-auth-storage
type: runbook
status: active
created: 2026-05-11
updated: 2026-05-11
last_agent: copilot-session-0131
pairs_with:
  - docs/runbooks/dev-environment.md
  - docs/runbooks/aws-s3-operator-runbook.md
  - docs/runbooks/sop-data-and-wiring-flows.md
  - docs/sprints/SESSION_0131.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - dev
  - auth
  - storage
  - minio
  - better-auth
  - troubleshooting
---

# Local Dev Auth + Storage Runbook

Covers two systems that caused friction in SESSION_0131: **Better-Auth session management** and **S3-compatible local storage via MinIO**. This runbook documents the setup, the pitfalls found during debugging, and the fixes.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    Local Dev Stack                        │
│                                                          │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────────┐ │
│  │ Next.js  │   │ Postgres.app │   │ MinIO (Docker)   │ │
│  │ :3000    │──▶│ :5432        │   │ :9000 API        │ │
│  │ Turbopack│   │ ronindojo_dev│   │ :9001 Console    │ │
│  └────┬─────┘   └──────────────┘   └────────┬─────────┘ │
│       │                                      │           │
│       │  Better-Auth                         │ S3 API    │
│       │  (magic link + session cookies)      │ (uploads) │
│       ▼                                      ▼           │
│  ┌──────────────────────────────────────────────────┐    │
│  │          Browser (localhost:3000)                 │    │
│  │  ┌──────────────────────────────────────┐        │    │
│  │  │ Cookies:                             │        │    │
│  │  │  better-auth.session_token (signed)  │        │    │
│  │  │  better-auth.session_data (cache)    │        │    │
│  │  │  brand (BASELINE_MARTIAL_ARTS)       │        │    │
│  │  └──────────────────────────────────────┘        │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 1. MinIO Setup (Local S3)

### Why MinIO, not AWS S3 for local dev

- Zero external dependency — runs in docker-compose alongside Postgres
- S3-compatible API — same `@aws-sdk` client works unchanged
- Free, no credentials to manage
- The existing `services/s3.ts` already has `forcePathStyle: true` — MinIO-ready

### Docker Compose (already in `docker-compose.yml`)

```yaml
minio:
  image: minio/minio:latest
  ports: ["9000:9000", "9001:9001"]
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
  command: server /data --console-address ":9001"

minio-init:
  image: minio/mc:latest
  depends_on:
    minio: { condition: service_healthy }
  entrypoint: >
    /bin/sh -c "
    mc alias set local http://minio:9000 minioadmin minioadmin;
    mc mb --ignore-existing local/ronindojo-dev;
    mc anonymous set download local/ronindojo-dev;
    exit 0;
    "
```

### Env vars (`.env`)

```bash
S3_ENDPOINT="http://localhost:9000"
S3_BUCKET="ronindojo-dev"
S3_REGION="us-east-1"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_PUBLIC_URL="http://localhost:9000/ronindojo-dev"
```

### Start / Verify

```bash
# Requires Docker Desktop running
docker compose up -d minio minio-init

# Verify bucket exists
curl -s http://localhost:9000/minio/health/live  # → 200
open http://localhost:9001                        # MinIO Console (minioadmin/minioadmin)
```

### Dirstarter alignment

Dirstarter docs at `dirstarter.com/docs/integrations/storage` confirm S3-compatible providers are supported via `S3_ENDPOINT`. Our setup follows their exact env var naming. `lib/media.ts` → `services/s3.ts` → `S3Client({ endpoint: env.S3_ENDPOINT, forcePathStyle: true })`.

---

## 2. Auth Setup (Better-Auth + Dev Login Bypass)

### How Better-Auth sessions work

```
┌─────────────┐     ┌────────────────┐     ┌──────────────┐
│ Magic Link  │     │ BA creates     │     │ Cookie set   │
│ or Google   │────▶│ Session row in │────▶│ on browser:  │
│ OAuth       │     │ Postgres +     │     │ signed token │
│             │     │ signs token    │     │ + data cache │
└─────────────┘     └────────────────┘     └──────────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │ getServerSession()
                    │ reads cookie,  │
                    │ validates HMAC │
                    │ against        │
                    │ BETTER_AUTH_   │
                    │ SECRET         │
                    └────────────────┘
```

**Key insight:** The session cookie is **HMAC-signed**, not a raw UUID. You cannot create a session by inserting a UUID into the Session table and setting it as a cookie. Better-Auth's `getSession` will reject unsigned tokens silently (returns null → redirect to login).

### Dev Login Bypass Route

**File:** `app/api/auth/dev-login/route.ts`

**Flow:**

```
GET /api/auth/dev-login
  │
  ├── Guard: isDev && DEV_LOGIN_USER_ID set? (404 if not)
  │
  ├── Lookup user by DEV_LOGIN_USER_ID
  │
  ├── auth.api.signInMagicLink({ email }) → creates Verification row
  │
  ├── Read Verification row from DB (identifier = token)
  │
  ├── auth.api.magicLinkVerify({ token })
  │   └── BA throws APIError(status: FOUND, 302)
  │       with Set-Cookie headers containing signed session
  │
  ├── Catch the "error", extract Set-Cookie headers
  │
  └── Return 307 redirect to /me with cookies forwarded
```

**Env var:**

```bash
# Set to a valid User.id from the database
DEV_LOGIN_USER_ID="cmp1gwfcq0000owdskqo2vlqp"
```

**Usage:**

```bash
# In real browser (not curl — cookies need browser cookie jar)
open http://localhost:3000/api/auth/dev-login
```

---

## 3. Troubleshooting Guide

### Problem: "Failed to fetch" / dev server hangs

```
Symptom: Next.js starts but requests hang indefinitely
         or "Failed to fetch" in browser
```

**Root causes found:**

| # | Cause | Fix |
|---|---|---|
| 1 | Stale `next dev` process holding `.next/dev/lock` | `pkill -9 -f "next dev"; rm -f apps/web/.next/dev/lock` |
| 2 | Corrupted Turbopack cache | `rm -rf apps/web/.next` |
| 3 | Port conflict (zombie on :3000) | `lsof -ti :3000 \| xargs kill -9` |

**Full recovery sequence:**

```bash
pkill -9 -f "next dev"
pkill -9 -f "next-server"
lsof -ti :3000 | xargs kill -9
rm -rf apps/web/.next
cd apps/web && bun dev
```

### Problem: `/me` returns 307 redirect to `/auth/login`

```
Symptom: User appears authenticated (get-session returns 200)
         but /me keeps redirecting to login
```

**Decision tree:**

```
/me returns 307
  │
  ├── Is getServerSession() returning null?
  │   ├── Yes → cookie not set or unsigned
  │   │   └── Use dev-login route (creates signed session)
  │   │
  │   └── No → session exists, check next guard
  │
  └── Does user have Passport + DirectoryProfile?
      ├── No → /me redirects to login (misleading!)
      │   └── Fix: Insert missing identity shell records
      │       (see "Seed user fix" below)
      │
      └── Yes → /me should render 200
```

**Seed user fix** (admin user created before sign-up hook):

```sql
-- Run against ronindojo_dev
INSERT INTO "Passport" ("id", "userId", "displayName", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'cmp1gwfcq0000owdskqo2vlqp', 'Admin User', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "DirectoryProfile" ("id", "userId", "slug", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'cmp1gwfcq0000owdskqo2vlqp', 'admin-user', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;
```

**Why this happens:** The sign-up hook in `lib/auth.ts` creates Passport + DirectoryProfile on new user creation. Seed users inserted directly into the User table bypass this hook.

### Problem: Dev-login returns 500

```
Symptom: /api/auth/dev-login returns 500 Internal Server Error
```

**Root cause:** Better-Auth's `magicLinkVerify` returns a 302 redirect by throwing an `APIError` with status `FOUND`. This is BA's internal pattern — the "error" contains the session cookies in its headers.

**Fix:** The route handler catches this specific error and forwards the cookies:

```typescript
try {
  await auth.api.magicLinkVerify({ headers, query: { token, callbackURL: "/me" } })
} catch (error) {
  // BA throws 302 as APIError — extract cookies and redirect
  if (err.statusCode === 302 && err.headers) {
    const response = NextResponse.redirect(new URL("/me", env.BETTER_AUTH_URL))
    for (const cookie of err.headers.getSetCookie()) {
      response.headers.append("Set-Cookie", cookie)
    }
    return response
  }
  throw error
}
```

### Problem: Self-fetch deadlock (dev server hangs for 20+ seconds)

```
Symptom: Route handler calls fetch("http://localhost:3000/api/auth/...")
         Dev server hangs until timeout
```

**Root cause:** Next.js dev server is single-threaded. A route handler fetching another route on the same server deadlocks.

**Fix:** Use `auth.api.*` methods (in-process calls) instead of `fetch()` to the same server.

```
❌ await fetch("http://localhost:3000/api/auth/magic-link/verify?token=...")
✅ await auth.api.magicLinkVerify({ headers: request.headers, query: { token } })
```

### Problem: VS Code Simple Browser doesn't get authenticated

```
Symptom: Real browser works, Simple Browser shows login page
```

**Root cause:** VS Code's Simple Browser has a separate cookie jar from your real browser. Session cookies set via the dev-login route only apply to the browser that made the request.

**Fix:** Use the real browser (`open http://localhost:3000/api/auth/dev-login`) for authenticated testing.

### Problem: Plausible analytics error in console

```
Symptom: "Invalid API key or site ID" error in server logs
```

**Non-blocking.** `PLAUSIBLE_API_KEY` is empty in `.env`. Admin dashboard still renders; analytics widget shows fallback. Set a valid key when analytics are needed.

---

## 4. Verification Checklist

Run after any environment change:

```bash
# 1. Database
psql postgresql://brianscott@localhost:5432/ronindojo_dev \
  -c 'SELECT count(*) FROM "User";'                         # → should be > 0

# 2. MinIO (if Docker running)
curl -s http://localhost:9000/minio/health/live               # → 200

# 3. Dev server
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ # → 200

# 4. Auth (use real browser)
open http://localhost:3000/api/auth/dev-login                 # → redirects to /me

# 5. Session check
curl -s http://localhost:3000/api/auth/get-session \
  -H "Cookie: <paste session cookie>"                         # → JSON with user
```

---

## 5. Files Referenced

| File | Purpose |
|---|---|
| `docker-compose.yml` | MinIO + Postgres services |
| `apps/web/.env` | All env vars (gitignored) |
| `apps/web/env.ts` | Zod env schema (includes `DEV_LOGIN_USER_ID`) |
| `apps/web/services/s3.ts` | S3 client config (`forcePathStyle: true`) |
| `apps/web/lib/media.ts` | Upload function (`uploadToS3Storage`) |
| `apps/web/lib/auth.ts` | Better-Auth config + sign-up hook |
| `apps/web/app/api/auth/dev-login/route.ts` | Dev-only auth bypass |
| `apps/web/app/(web)/me/page.tsx` | Passport editor (requires Passport + DirectoryProfile) |

## 6. Dirstarter Docs Cross-References

| Topic | Dirstarter URL | Notes |
|---|---|---|
| Auth setup | `dirstarter.com/docs/authentication` | BA config, magic link, social login, route protection |
| Storage setup | `dirstarter.com/docs/integrations/storage` | S3 env vars, S3-compatible providers, `S3_ENDPOINT` |
| Media handling | `dirstarter.com/docs/integrations/media` | `uploadToS3Storage` in `lib/media.ts` |
