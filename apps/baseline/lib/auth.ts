import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc, userAc } from "better-auth/plugins/admin/access";
import { headers } from "next/headers";
import { db } from "./db";

/**
 * Baseline — its OWN Better Auth instance (ADR 0038 D5: identity per product).
 *
 * No shared User/session across products; Baseline owns its auth tables in
 * `baseline_dev` (User/Session/Account/Verification — see prisma/schema.prisma).
 * Mirrors Mammoth's shape, trimmed for a single-tenant school:
 *
 *   - email + password is the login (Baseline has no transactional-email infra,
 *     so NO magic-link/social — those need a Resend key + OAuth creds this product
 *     does not carry; add them in a later lane if needed);
 *   - the admin() plugin supplies the role field (User.role: owner | member), so
 *     an `owner` gates the admin Leads board without a second authz system;
 *   - SIMPLER than Mammoth: single-tenant means NO owner-entity (no TeamMember)
 *     resolution — the session `user` + `role` IS the owner. No per-row ownership.
 *
 * Secret/origin come from env: BETTER_AUTH_SECRET is required (validated below,
 * mirroring lib/db.ts's loud env contract); BETTER_AUTH_URL is the canonical
 * origin (falls back to VERCEL_URL on preview deploys, like apps/web).
 */

// Fail loud at module load (clear message) rather than with an opaque signing
// error on the first auth call — mirrors lib/db.ts's validated env contract.
const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw new Error("BETTER_AUTH_SECRET is required (Baseline owns its own identity — ADR 0038 D5).");
}

// Baseline's two roles map onto Better Auth's admin access-control statements
// (user/session management). `owner` carries the full admin capability set;
// `member` carries none. The admin() plugin requires every `adminRoles` entry to
// be a defined role here — so the role names match the `BaselineRole` enum.
const ac = createAccessControl(defaultStatements);
const roles = {
  owner: ac.newRole(adminAc.statements),
  member: ac.newRole(userAc.statements),
};

export const auth = betterAuth({
  secret,

  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),

  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    // Single-tenant school: no public self-serve email-verification flow yet (no
    // email infra). The owner is provisioned by seed; flip this on once a sender
    // is wired.
    requireEmailVerification: false,
  },

  account: {
    accountLinking: {
      enabled: true,
    },
  },

  session: {
    cookieCache: {
      enabled: true,
    },
  },

  onAPIError: {
    onError: (error) => console.error("[baseline-auth]", error),
  },

  plugins: [
    // Role-based admin: `owner` is the elevated role; `member` the default. The
    // `ac` + `roles` map registers owner/member so `adminRoles` validates.
    admin({
      ac,
      roles,
      adminRoles: ["owner"],
      defaultRole: "member",
    }),
  ],
});

/**
 * Resolve the current Better Auth session from the incoming request headers.
 * Server-only (reads next/headers). Returns `null` when unauthenticated.
 */
export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

export type Session = typeof auth.$Infer.Session;
