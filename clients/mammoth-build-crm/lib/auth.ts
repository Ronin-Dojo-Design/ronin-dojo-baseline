import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc, userAc } from "better-auth/plugins/admin/access";
import { headers } from "next/headers";
import { db } from "./db";

// Mammoth's two roles map onto Better Auth's admin access-control statements
// (user/session management). `owner` carries the full admin capability set;
// `member` carries none. The admin() plugin requires every `adminRoles` entry to
// be a defined role here — so the role names match the `MammothRole` enum.
const ac = createAccessControl(defaultStatements);
const roles = {
  owner: ac.newRole(adminAc.statements),
  member: ac.newRole(userAc.statements),
};

/**
 * Mammoth Build CRM — its OWN Better Auth instance (ADR 0038 D5: identity per
 * product). No shared User/session across products; Mammoth owns the auth tables
 * in its `mammoth_dev` schema (User/Session/Account/Verification — see
 * prisma/schema.prisma). Mirrors apps/web/lib/auth.ts's shape, trimmed for an
 * internal CRM:
 *
 *   - email + password is the login (Mammoth has no transactional-email infra,
 *     so NO magic-link/social — those need a Resend key + OAuth creds the BBL app
 *     carries and this product does not; add them in a later lane if needed);
 *   - the admin() plugin supplies the role field (User.role: owner | member),
 *     so an `owner` can manage members without a second authz system;
 *   - the CRM-owner link (auth User → TeamMember) is materialized lazily in
 *     lib/actions.ts (`requireOwner`) — not here — so a fresh login resolves to
 *     its owner record on its first authenticated action.
 *
 * Secrets/origins come from env (validated in lib/env.ts): BETTER_AUTH_SECRET is
 * required; BETTER_AUTH_URL is the canonical origin (falls back to VERCEL_URL on
 * preview deploys, like apps/web). Both are wired in vercel.json / .env.
 */
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,

  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),

  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    // Internal CRM: no public self-serve email-verification flow yet (no email
    // infra). Owners provision members; flip this on once a sender is wired.
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
    onError: (error) => console.error("[mammoth-auth]", error),
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
