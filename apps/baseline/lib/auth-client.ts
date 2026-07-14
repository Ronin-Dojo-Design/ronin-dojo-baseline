import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * Baseline — the browser-side Better Auth client (email+password only).
 *
 * Mirrors apps/web/lib/auth-client.ts, trimmed to Baseline's surface: no
 * magic-link (no email infra), just the admin() role plugin to match lib/auth.ts.
 * Used by the local sign-in page (app/login) so the owner can reach the gated
 * admin board.
 */
export const { signIn, signOut } = createAuthClient({
  plugins: [adminClient()],
});
