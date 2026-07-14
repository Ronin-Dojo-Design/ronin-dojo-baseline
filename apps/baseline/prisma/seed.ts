/**
 * Seed `baseline_dev` (ADR 0038 Phase 2).
 *
 * Idempotent, three parts:
 *   1. The owner login (Better Auth) — so the gated admin board (/app) is
 *      reachable headlessly. Created via `auth.api.signUpEmail` (hashes the
 *      password into Account like a real sign-up), then promoted to `owner`
 *      (the admin() plugin's `defaultRole` is `member`). Re-running is a no-op:
 *      we skip the sign-up when the User already exists.
 *   2. The `SchoolSettings` singleton — the one-row white-label config.
 *   3. A few demo `Lead`s (stable ids) so the pipeline board isn't empty on
 *      first sign-in; keyed on seed ids so re-running updates in place (mirrors
 *      Mammoth's demo-project seed).
 *
 * Run: `bun run db:seed` (from apps/baseline). Bun auto-loads `.env`, so
 * DATABASE_URL + BETTER_AUTH_SECRET are present for lib/db + lib/auth.
 *
 * Dev-only credentials — this file is committed, so the values are non-secret by
 * design (a fresh local DB owner). NEVER reuse them for a real deployment.
 */

import { auth } from "../lib/auth";
import { db } from "../lib/db";

const OWNER_EMAIL = "owner@baseline.local";
const OWNER_PASSWORD = "baseline-dev-owner";
const OWNER_NAME = "Baseline Owner";

async function seedOwner() {
  const existing = await db.user.findUnique({ where: { email: OWNER_EMAIL } });
  if (!existing) {
    await auth.api.signUpEmail({
      body: { email: OWNER_EMAIL, password: OWNER_PASSWORD, name: OWNER_NAME },
    });
  }
  // Promote to owner (sign-up lands as the admin() plugin's default `member`).
  await db.user.update({ where: { email: OWNER_EMAIL }, data: { role: "owner" } });
}

async function seedSettings() {
  await db.schoolSettings.upsert({
    where: { singleton: true },
    update: {},
    create: {
      singleton: true,
      schoolName: "Baseline Martial Arts",
      tagline: "Train where the lineage runs deep.",
      heroHeadline: "Find your dojo.",
      heroSub: "A modern school site, ready to make yours.",
    },
  });
}

const DEMO_LEADS = [
  {
    id: "seed-lead-amara",
    name: "Amara Osei",
    email: "amara@example.com",
    phone: "555-0142",
    interest: "Kids",
    message: "My 7-year-old wants to try a class. Do you have weekday evenings?",
    status: "NEW" as const,
    source: "web_form",
  },
  {
    id: "seed-lead-dev",
    name: "Devon Marsh",
    email: "devon@example.com",
    phone: null,
    interest: "Adults",
    message: "Getting back into training after a few years off.",
    status: "CONTACTED" as const,
    source: "web_form",
  },
  {
    id: "seed-lead-priya",
    name: "Priya Nair",
    email: "priya@example.com",
    phone: "555-0199",
    interest: "Competition",
    message: "Interested in structured comp prep — booked a trial for Saturday.",
    status: "TRIAL_BOOKED" as const,
    source: "referral",
  },
];

async function seedLeads() {
  for (const l of DEMO_LEADS) {
    const fields = {
      name: l.name,
      email: l.email,
      phone: l.phone,
      interest: l.interest,
      message: l.message,
      status: l.status,
      source: l.source,
    };
    await db.lead.upsert({
      where: { id: l.id },
      create: { id: l.id, ...fields },
      update: { ...fields },
    });
  }
}

async function main() {
  await seedOwner();
  await seedSettings();
  await seedLeads();

  const [users, leads] = await Promise.all([db.user.count(), db.lead.count()]);
  console.log(
    `✅ Seeded baseline_dev · owner=${OWNER_EMAIL} · ${users} user(s) · ${leads} lead(s)`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
