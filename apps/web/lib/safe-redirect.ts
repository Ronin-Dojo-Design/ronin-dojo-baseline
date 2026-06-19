/**
 * Open-redirect guard for untrusted `?next`/redirect targets.
 *
 * A value is only honored when it is a SAFE same-origin RELATIVE path. We reject
 * anything that: is absent; doesn't start with a single "/"; starts with "//" or
 * "/\" (protocol-relative — `new URL` would resolve it OFF-origin); or contains a
 * backslash or ASCII control char. As a belt-and-suspenders backstop we resolve
 * it against a fixed base and confirm the origin is unchanged. Returns the path
 * verbatim (pathname + search + hash) when safe, else `fallback` (default "/").
 *
 * Origin-free by design (an internal fixed base does the relative-resolution
 * recheck), so the same guard runs in BOTH a server route handler and a client
 * hook — extracted here so call sites reuse one audited validator instead of
 * re-implementing it per surface (SOP §10b). Consumers:
 *   - `app/(web)/preview/route.ts` — the BBL preview `?next` self-arm hop
 *   - `hooks/use-auth-callback-url.ts` — the login `?next` callback URL
 */
export function safeRelativePath(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback
  // Must be a relative path rooted at a single "/", never protocol-relative.
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback
  }
  // No backslashes (browser-normalized to "/") and no control chars.
  // eslint-disable-next-line no-control-regex -- intentional: reject control chars in the redirect target
  if (/[\\\x00-\x1f\x7f]/.test(next)) return fallback
  // Defensive: resolving against a fixed base must not change the origin.
  try {
    const base = "http://localhost"
    const resolved = new URL(next, base)
    if (resolved.origin !== base) return fallback
    return resolved.pathname + resolved.search + resolved.hash
  } catch {
    return fallback
  }
}
