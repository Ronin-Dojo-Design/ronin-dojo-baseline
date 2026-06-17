---
name: r2-sync
description: Upload brand media (WordPress / monorepo assets) to the BBL Cloudflare R2 bucket preserving exact filenames, and verify public read. Use for "pull assets / sync images / media migration / upload avatars" to R2.
---

BBL media lives in the Cloudflare R2 bucket **`bbl-media`** — `apps/web/services/s3.ts` builds `s3ClientBBL`
from the `S3_*_BBL` vars. The app + profile import resolve avatars at **`media/bbl/profiles/<exact-basename>`**
(R2 keys are case-sensitive). See `docs/runbooks/integrations/aws-s3-operator-runbook.md`.

## Guards

- **Preserve EXACT filenames.** `apps/web/scripts/import-bbl-wp-media.ts` **slugifies** keys (lowercases,
  re-detects extension) → that 404s the profile import, which resolves by exact basename (drift **D-025**).
  Use name-preserving **`aws s3 cp`**, not that script, for avatars the import references.
- **Least-privilege token:** the R2 API token needs only **Object Read & Write** on `bbl-media`, **not Admin**.
  Confirm write with a throwaway probe (`aws s3 cp` a tiny file → `ls` → `rm`) before a bulk upload.
- R2 vars are Vercel **Sensitive** (pull empty) — the operator pastes them. Put them in a `chmod 600` `/tmp`
  file; delete after; remind the operator to rotate the token if it was pasted into chat.

## Env (operator-supplied)

`S3_BUCKET_BBL=bbl-media`, `S3_REGION_BBL=auto`,
`S3_ENDPOINT_BBL=https://<account-id>.r2.cloudflarestorage.com`, `S3_ACCESS_KEY_BBL`,
`S3_SECRET_ACCESS_KEY_BBL`, `S3_PUBLIC_URL_BBL=https://pub-<hash>.r2.dev` (the public read URL),
`NEXT_PUBLIC_MEDIA_BASE_URL` = same as `S3_PUBLIC_URL_BBL`.

## Steps (aws CLI uses `AWS_*` env, not `S3_*`)

1. **Validate** creds + bucket: `AWS_ACCESS_KEY_ID=$S3_ACCESS_KEY_BBL AWS_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY_BBL aws s3 ls s3://bbl-media/ --endpoint-url "$S3_ENDPOINT_BBL" --region auto`.
2. **Upload preserving names** (one per file, exact basename):
   `aws s3 cp "<src>/<File>.jpg" "s3://bbl-media/media/bbl/profiles/<File>.jpg" --endpoint-url "$S3_ENDPOINT_BBL" --region auto`.
3. **Verify public read** via the r2.dev URL: `curl -sI https://pub-<hash>.r2.dev/media/bbl/profiles/<File>.jpg`
   → `200` + `content-type: image/*`. (A custom `media.blackbeltlegacy.com` needs the DNS **zone on Cloudflare**;
   it's on Bluehost, so use the r2.dev URL until/if you migrate DNS.)
4. **Cleanup:** delete the temp creds file.

## Gotchas

- `aws s3 ls … | head -N` SIGPIPE-truncates the count — **redirect to a file**, then count, when you need a total.
- Vercel serves JS chunks gzip/br-encoded — `curl --compressed` before grepping bundle contents.
- The profile import bakes **absolute** r2.dev URLs into `avatarUrl`, so prod's (often empty)
  `NEXT_PUBLIC_MEDIA_BASE_URL` doesn't affect already-imported avatars — but set it for **new** uploads.
