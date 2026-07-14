/**
 * Seed `baseline_dev` (ADR 0038 Phase 2).
 *
 * Idempotent, three parts:
 *   1. The owner login (Better Auth) — so the gated admin board (/app) is
 *      reachable headlessly. Public sign-up is disabled (single-tenant), so the
 *      first owner is bootstrapped DIRECTLY: a User + a `credential` Account whose
 *      password is hashed with Better Auth's own hasher (`auth.$context`), so it
 *      verifies on sign-in. Re-running is a no-op (upsert + skip-if-credential).
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
  // Upsert the owner login (idempotent; keep it `owner` on re-runs).
  const user = await db.user.upsert({
    where: { email: OWNER_EMAIL },
    update: { role: "owner" },
    create: { name: OWNER_NAME, email: OWNER_EMAIL, emailVerified: true, role: "owner" },
  });

  // Ensure a credential (email+password) account exists so the owner can sign in.
  // Public sign-up is disabled (lib/auth.ts `disableSignUp`) and the admin
  // createUser path needs an existing admin session (bootstrap chicken-and-egg),
  // so we insert the credential DIRECTLY using Better Auth's own password hasher
  // (`auth.$context.password.hash`) — the produced hash verifies on sign-in.
  // Idempotent: skip when the owner already has a credential (don't re-salt).
  const existingCred = await db.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
    select: { id: true },
  });
  if (!existingCred) {
    const ctx = await auth.$context;
    const hashed = await ctx.password.hash(OWNER_PASSWORD);
    await db.account.create({
      data: {
        userId: user.id,
        // Better Auth's credential account keys accountId = the user id.
        accountId: user.id,
        providerId: "credential",
        password: hashed,
      },
    });
  }
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
