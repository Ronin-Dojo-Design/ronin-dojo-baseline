import { execFileSync } from "node:child_process"

/**
 * SESSION_0502 (TASK_03) — directory profile paywall field-boundary fixture (wrapper).
 *
 * Seeds two CLAIMED, PUBLIC, BBL directory profiles under a published claimable BBL tree so
 * both resolve on `/directory/[slug]`: a FREE profile and a PREMIUM profile. BOTH carry the
 * rich-media fields (cover photo, video intro, social links, city/region/country) so the e2e
 * proves the paywall NON-vacuously — the free page must render the BASIC profile (bio + ranks +
 * organizations) while hiding cover/video/social/location; the premium page renders all.
 *
 * Playwright runs under Node; the generated Prisma client runs under Bun, so this wrapper shells
 * into `seed-directory-paywall-db.ts` (the same split as the other lineage/directory fixtures).
 */

export interface DirectoryPaywallSeedFixture {
  runId: string
  treeId: string
  freeSlug: string
  premiumSlug: string
  freeName: string
  premiumName: string
  bio: string
  coverPhotoUrl: string
  videoIntroTitle: string
  socialPlatform: string
  locationCity: string
  orgName: string
  userIds: string[]
  nodeIds: string[]
  createdEntitlementIds: string[]
}

function run<T>(command: string, fixture?: DirectoryPaywallSeedFixture): T {
  const args = ["e2e/helpers/seed-directory-paywall-db.ts", command]
  if (fixture) {
    args.push(Buffer.from(JSON.stringify(fixture), "utf-8").toString("base64"))
  }
  const raw = execFileSync("bun", args, { cwd: process.cwd(), encoding: "utf-8" })
  return raw ? (JSON.parse(raw) as T) : (undefined as T)
}

export async function seedDirectoryPaywallFixture(): Promise<DirectoryPaywallSeedFixture> {
  return run<DirectoryPaywallSeedFixture>("seed")
}

export async function cleanupDirectoryPaywallFixture(fixture: DirectoryPaywallSeedFixture) {
  run<void>("cleanup", fixture)
}
