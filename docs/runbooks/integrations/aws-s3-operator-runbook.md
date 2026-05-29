---
title: "AWS S3 Operator Runbook"
slug: aws-s3-operator-runbook
type: runbook
status: active
created: 2026-05-08
updated: 2026-05-08
last_agent: codex-session-0099
pairs_with:
  - docs/sprints/SESSION_0099.md
  - docs/runbooks/deployment.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# AWS S3 Operator Runbook

Use this for Ronin public media in staging and production. Local development keeps files under `apps/web/public`; staging/prod should set `NEXT_PUBLIC_MEDIA_BASE_URL` so those same public paths resolve to S3 or CloudFront.

## Recommended Shape

| Layer | Recommendation |
| --- | --- |
| Storage | One S3 bucket per environment: `ronin-dojo-media-staging` and `ronin-dojo-media-prod`, or globally unique variants. |
| Public delivery | CloudFront distribution with Origin Access Control (OAC), bucket remains private. |
| App uploads | Least-privilege IAM access key scoped to the media bucket. |
| Public URL | `https://media.<domain>` or the CloudFront domain. Use the same value for `S3_PUBLIC_URL` and `NEXT_PUBLIC_MEDIA_BASE_URL`. |
| Local dev | Leave `NEXT_PUBLIC_MEDIA_BASE_URL` blank so `/images/...` resolves from `apps/web/public`. |

## AWS Setup Checklist

### 1. Create Buckets

Create staging and production buckets in a US region. Recommended first choice: `us-east-2` to stay near the current deployment/database region.

Bucket settings:

- Object Ownership: **Bucket owner enforced**
- Block Public Access: **On**
- Default encryption: **SSE-S3**
- Versioning: **On for production**, optional for staging
- Lifecycle: expire noncurrent versions after 30-90 days

Do not paste access keys into chat or docs.

### 2. Create CloudFront Delivery

For each environment:

1. Create a CloudFront distribution.
2. Origin: the matching S3 bucket.
3. Origin access: **Origin Access Control**, signing behavior **always sign**.
4. Viewer protocol policy: redirect HTTP to HTTPS.
5. Cache policy: optimized/static asset caching.
6. Optional custom domain: `media.baselinemartialarts.com` or environment equivalent.
7. If using a custom domain, create the ACM certificate in `us-east-1` for CloudFront.

After the distribution exists, add the CloudFront-generated bucket policy that allows only that distribution to read objects.

### 3. Create App Upload IAM Policy

Create a dedicated IAM user or role for the web app. Scope it to the media bucket only.

Replace `BUCKET_NAME` with the actual bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListMediaBucket",
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:ListBucketMultipartUploads"],
      "Resource": "arn:aws:s3:::BUCKET_NAME"
    },
    {
      "Sid": "ManageMediaObjects",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": "arn:aws:s3:::BUCKET_NAME/*"
    }
  ]
}
```

The current app uploads from server actions. Browser direct uploads and presigned upload CORS are not required for SESSION_0099.

### 4. Upload Current Local Gear Assets

Install/configure AWS CLI locally, then run from the repo root:

```bash
aws s3 sync apps/web/public/images/merch s3://BUCKET_NAME/images/merch \
  --region us-east-2 \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude ".DS_Store"
```

Verify:

```bash
aws s3 ls s3://BUCKET_NAME/images/merch/ --region us-east-2
```

If CloudFront is configured, verify a known object through the public media URL:

```bash
curl -I https://MEDIA_DOMAIN/images/merch/placeholder.svg
```

### 5. Set Vercel Environment Variables

Set these in Vercel for Preview/Staging and Production:

| Variable | Value |
| --- | --- |
| `S3_BUCKET` | The environment bucket name |
| `S3_REGION` | `us-east-2` or selected region |
| `S3_ACCESS_KEY` | IAM access key id |
| `S3_SECRET_ACCESS_KEY` | IAM secret access key |
| `S3_PUBLIC_URL` | CloudFront/custom media base URL, no trailing slash |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | Same CloudFront/custom media base URL, no trailing slash |
| `S3_ENDPOINT` | Leave blank for AWS S3 |

Local `.env` can keep S3 values blank unless you are testing uploads. Leave `NEXT_PUBLIC_MEDIA_BASE_URL` blank locally to serve `apps/web/public/images/...`.

### 6. App Verification

After deploy:

1. Open `/gear`.
2. Inspect an image URL. In staging/prod it should start with `NEXT_PUBLIC_MEDIA_BASE_URL`.
3. Open `/admin/storage/monitoring`.
4. Confirm status moves from `NEEDS_SETUP` to `CONFIGURED`.
5. Confirm `Missing local paths` is `0`.
6. Confirm the projected monthly cost looks reasonable.

## Cost Model

The admin Storage Monitor uses the same assumptions below. These are estimates, not a replacement for AWS Billing.

Current pricing source checked on 2026-05-08:

- Amazon S3 pricing: https://aws.amazon.com/s3/pricing/
- Amazon CloudFront pricing: https://aws.amazon.com/cloudfront/pricing/
- S3 Block Public Access docs: https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html
- CloudFront OAC docs: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html

### S3 Estimate Inputs

| Line item | Current admin assumption |
| --- | ---: |
| S3 Standard storage | `$0.023 / GB-month` |
| GET requests | `$0.0004 / 1,000 requests` |
| PUT/COPY/POST/LIST-class requests | `$0.005 / 1,000 requests` |
| Direct S3 data transfer out free tier | First `100 GB / month` |
| Direct S3 transfer after free tier | `$0.09 / GB` |

The monitor reads the current catalog asset paths from the TuffBuffs gear/merch catalogs and sums local file sizes when they are present in `apps/web/public`.

### Default Scenarios

| Scenario | Monthly gear views | Images per view | Monthly uploads |
| --- | ---: | ---: | ---: |
| Launch | 2,000 | 12 | 100 |
| Growth | 10,000 | 12 | 500 |
| Heavy | 50,000 | 12 | 2,000 |

At current expected asset sizes, S3 storage and request costs should be well under one dollar per month until traffic or image/video volume grows substantially. Direct S3 public egress becomes the first meaningful cost once monthly image transfer exceeds the 100 GB free tier.

SESSION_0099 local catalog estimate:

| Metric | Value |
| --- | ---: |
| Catalog objects | 59 |
| Local catalog size | 0.040 GB |
| Missing local paths | 0 |
| Launch scenario | about `$0.012 / month` direct S3 |
| Growth scenario | about `$0.057 / month` direct S3 |
| Heavy direct-S3 scenario | about `$27.87 / month` because projected image transfer exceeds the 100 GB free tier |

### CloudFront Note

If `NEXT_PUBLIC_MEDIA_BASE_URL` points at CloudFront, S3 transfer to CloudFront is not billed as direct public egress. CloudFront itself has either flat-rate plans or pay-as-you-go billing. As of the checked pricing page, the CloudFront Free flat-rate plan is `$0/month` with `100 GB` transfer, `1M` requests, and `5 GB` included S3 storage for one distribution. Re-check AWS pricing before production launch because CloudFront and S3 pricing can change.

## Image Optimization

### Next.js Image Loader for S3/CloudFront

When `NEXT_PUBLIC_MEDIA_BASE_URL` points to CloudFront, configure the Next.js `<Image>` component
to use it as an external image source. In `next.config.ts`:

```ts
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "media.baselinemartialarts.com", // or your CloudFront domain
      pathname: "/images/**",
    },
  ],
}
```

For self-hosted Next.js (Vercel), the built-in image optimizer handles format negotiation (WebP/AVIF)
automatically when you use `<Image>`. For static exports or edge deployments, use a custom loader
pointing to CloudFront.

### WebP/AVIF Auto-Conversion via CloudFront

Two approaches, in order of preference:

1. **CloudFront Functions (simplest, free tier eligible):** Create a viewer-request function that
   reads the `Accept` header and rewrites the origin path to serve pre-generated WebP/AVIF variants
   if they exist in S3 (e.g., `image.jpg` → `image.webp`). This requires uploading variants at
   upload time (see below).

2. **Lambda@Edge (dynamic, more cost):** Attach a Lambda@Edge origin-response function that
   converts images on the fly using `sharp`. Cache the result at CloudFront edge. Cost scales with
   invocations — suitable if you have many images and don't want to pre-generate variants.

For launch, rely on Next.js `<Image>` component's built-in optimization (Vercel handles this
server-side). Add CloudFront-level conversion only if you move off Vercel or need edge-level
optimization for non-Next.js consumers.

### Upload-Time Compression and Resizing

Add a processing step in the upload server action (or a post-upload async job):

1. **Resize:** Generate standard variants (thumbnail 150px, card 600px, full 1200px) using `sharp`.
2. **Compress:** Apply lossy compression (quality 80 for JPEG, quality 85 for WebP).
3. **Format variants:** Generate `.webp` alongside the original format.
4. **Upload all variants** to S3 with appropriate `Content-Type` and `Cache-Control` headers.

This is not required for launch but should be added before the catalog exceeds ~500 images or
if page load metrics show image size as a bottleneck.

### Cost Impact

Image optimization reduces CloudFront transfer costs significantly:

- WebP is ~25-35% smaller than JPEG at equivalent quality
- AVIF is ~50% smaller than JPEG
- Proper resizing prevents serving 4000px originals to mobile devices

At current catalog size (59 objects, 0.04 GB), optimization is nice-to-have. At growth scenario
(10,000+ monthly views), it materially reduces transfer costs.

## Operator Provisioning Checklist

Follow these steps in order. Each step has a verification check.

### Prerequisites

- [ ] AWS account with billing enabled
- [ ] AWS CLI installed locally (`brew install awscli`)
- [ ] AWS CLI configured (`aws configure` — use a personal admin profile, NOT the app IAM user)
- [ ] Domain DNS access (for custom media subdomain, optional)

### Step-by-step

1. **Create S3 bucket (staging)**
   ```bash
   aws s3 mb s3://ronin-dojo-media-staging --region us-east-2
   ```
   - [ ] Enable versioning: `aws s3api put-bucket-versioning --bucket ronin-dojo-media-staging --versioning-configuration Status=Enabled --region us-east-2`
   - [ ] Block public access: `aws s3api put-public-access-block --bucket ronin-dojo-media-staging --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true --region us-east-2`
   - [ ] Enable SSE-S3 encryption (default on new buckets, verify in console)
   - ✅ Verify: `aws s3 ls s3://ronin-dojo-media-staging --region us-east-2` returns empty bucket

2. **Create S3 bucket (production)**
   ```bash
   aws s3 mb s3://ronin-dojo-media-prod --region us-east-2
   ```
   - [ ] Same settings as staging (versioning, block public access, encryption)
   - [ ] Add lifecycle rule: expire noncurrent versions after 90 days
   - ✅ Verify: bucket exists and settings match

3. **Create IAM policy**
   - [ ] Go to IAM → Policies → Create Policy
   - [ ] Use the JSON from the "Create App Upload IAM Policy" section above
   - [ ] Name it `ronin-dojo-media-upload-policy`
   - [ ] Create for staging bucket first, duplicate for prod

4. **Create IAM user**
   - [ ] Go to IAM → Users → Create User
   - [ ] Name: `ronin-dojo-media-uploader`
   - [ ] No console access — programmatic only
   - [ ] Attach the policy from step 3
   - [ ] Generate access key → copy `Access Key ID` and `Secret Access Key`
   - ⚠️ Store credentials securely (1Password, not in chat/docs)

5. **Create CloudFront distribution (staging)**
   - [ ] Go to CloudFront → Create Distribution
   - [ ] Origin: `ronin-dojo-media-staging.s3.us-east-2.amazonaws.com`
   - [ ] Origin access: Origin Access Control → Create new OAC
   - [ ] Viewer protocol: Redirect HTTP to HTTPS
   - [ ] Cache policy: CachingOptimized
   - [ ] Copy the bucket policy CloudFront generates → apply to S3 bucket
   - ✅ Verify: distribution status = Deployed

6. **Create CloudFront distribution (production)**
   - [ ] Same as staging but with production bucket
   - [ ] Optional: add custom domain `media.baselinemartialarts.com`
   - [ ] If custom domain: create ACM certificate in `us-east-1` first
   - [ ] If custom domain: add CNAME record in DNS

7. **Sync local assets to staging**
   ```bash
   aws s3 sync apps/web/public/images/merch s3://ronin-dojo-media-staging/images/merch \
     --region us-east-2 \
     --cache-control "public,max-age=31536000,immutable" \
     --exclude ".DS_Store"
   ```
   - ✅ Verify: `curl -I https://<cloudfront-domain>/images/merch/placeholder.svg` returns 200

8. **Set Vercel environment variables (staging)**
   - [ ] `S3_BUCKET` = `ronin-dojo-media-staging`
   - [ ] `S3_REGION` = `us-east-2`
   - [ ] `S3_ACCESS_KEY` = from step 4
   - [ ] `S3_SECRET_ACCESS_KEY` = from step 4
   - [ ] `S3_PUBLIC_URL` = CloudFront domain (e.g., `https://d1234abcdef.cloudfront.net`)
   - [ ] `NEXT_PUBLIC_MEDIA_BASE_URL` = same as `S3_PUBLIC_URL`
   - [ ] Redeploy preview/staging

9. **Verify staging**
   - [ ] Open `/gear` on staging — images load from CloudFront domain
   - [ ] Open `/admin/storage/monitoring` — status shows `CONFIGURED`
   - [ ] Check browser DevTools Network tab — images served from CloudFront

10. **Repeat steps 7-9 for production** when ready to go live

### Estimated time

- Steps 1-4: ~20 minutes (AWS console)
- Steps 5-6: ~15 minutes (CloudFront can take 5-10 min to deploy)
- Steps 7-9: ~10 minutes (sync + verify)
- Total: ~45 minutes for staging, ~30 additional for production

### Cost estimate (monthly)

| Scenario | S3 Storage | S3 Requests | CloudFront | Total |
| --- | ---: | ---: | ---: | ---: |
| Launch (2K views/mo) | $0.001 | $0.01 | $0.00 (free tier) | ~$0.01 |
| Growth (10K views/mo) | $0.001 | $0.05 | $0.00 (free tier) | ~$0.05 |
| Heavy (50K views/mo) | $0.001 | $0.24 | $0.00 (free tier covers 100GB) | ~$0.24 |

CloudFront free tier includes 1TB/month transfer + 10M requests. You won't exceed this until significant scale.

## Operating Rules

- Keep private certificates, student media, and future protected downloads out of this public bucket unless signed/private delivery is implemented.
- Rotate `S3_ACCESS_KEY` and `S3_SECRET_ACCESS_KEY` if a teammate leaves or a secret is exposed.
- Keep Block Public Access on when using CloudFront OAC.
- Do not grant `s3:*` or account-wide permissions to the app.
- Check AWS Billing after the first staging week and first production week.
- If traffic spikes, switch public media to CloudFront before direct S3 transfer becomes material.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `/gear` works locally but images 404 in staging | Objects were not synced to `images/merch` in S3 | Re-run the `aws s3 sync` command and invalidate CloudFront if needed |
| Admin monitor says `NEEDS_SETUP` | Missing S3 or media base env var | Set all vars listed in Vercel and redeploy |
| Uploads succeed but image URLs use the wrong host | `S3_PUBLIC_URL` and `NEXT_PUBLIC_MEDIA_BASE_URL` differ | Make both values the same unless you intentionally split upload return URLs and public catalog URLs |
| CloudFront returns 403 | OAC bucket policy missing or wrong distribution ARN | Re-apply the CloudFront-generated bucket policy |
| Direct S3 URL returns AccessDenied | Bucket is private, as intended for OAC | Test through CloudFront/media domain instead |
