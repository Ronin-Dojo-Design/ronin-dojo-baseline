// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  buildContentSecurityPolicy,
  buildHardeningHeaders,
  buildSecurityHeadersConfig,
  cspHeaderName,
  type HeaderEntry,
} from "./security-headers"

const headerValue = (headers: HeaderEntry[], key: string): string | undefined =>
  headers.find(h => h.key === key)?.value

// Pull a single directive's value out of the `; `-joined CSP string for precise
// per-directive assertions (script-src vs style-src must diverge on 'unsafe-inline').
const directive = (csp: string, name: string): string | undefined =>
  csp
    .split(";")
    .map(p => p.trim())
    .find(p => p === name || p.startsWith(`${name} `))

describe("security headers baseline (RISK #2)", () => {
  it("always enforces the non-CSP hardening headers", () => {
    const headers = buildHardeningHeaders({ NODE_ENV: "development" } as NodeJS.ProcessEnv)

    expect(headerValue(headers, "X-Content-Type-Options")).toBe("nosniff")
    expect(headerValue(headers, "X-Frame-Options")).toBe("DENY")
    expect(headerValue(headers, "Referrer-Policy")).toBe("strict-origin-when-cross-origin")
    expect(headerValue(headers, "Cross-Origin-Opener-Policy")).toBe("same-origin")
    expect(headerValue(headers, "Permissions-Policy")).toContain("camera=()")
    expect(headerValue(headers, "X-DNS-Prefetch-Control")).toBe("on")
  })

  it("declares the CSP Reporting-Endpoints group in the static header set", () => {
    const headers = buildHardeningHeaders({ NODE_ENV: "production" } as NodeJS.ProcessEnv)

    expect(headerValue(headers, "Reporting-Endpoints")).toBe('csp="/api/csp-report"')
  })

  it("does NOT emit a CSP header from the static hardening set (it moved to middleware)", () => {
    const headers = buildHardeningHeaders({ NODE_ENV: "production" } as NodeJS.ProcessEnv)

    expect(headerValue(headers, "Content-Security-Policy")).toBeUndefined()
    expect(headerValue(headers, "Content-Security-Policy-Report-Only")).toBeUndefined()
  })

  it("selects the Report-Only CSP header name by default (observe before enforce)", () => {
    expect(cspHeaderName({ NODE_ENV: "production" } as NodeJS.ProcessEnv)).toBe(
      "Content-Security-Policy-Report-Only",
    )
  })

  it("promotes to the enforcing CSP header name when CSP_ENFORCE is set", () => {
    expect(cspHeaderName({ NODE_ENV: "production", CSP_ENFORCE: "1" } as NodeJS.ProcessEnv)).toBe(
      "Content-Security-Policy",
    )
    expect(
      cspHeaderName({ NODE_ENV: "production", CSP_ENFORCE: "true" } as NodeJS.ProcessEnv),
    ).toBe("Content-Security-Policy")
  })

  it("emits HSTS only in production", () => {
    const dev = buildHardeningHeaders({ NODE_ENV: "development" } as NodeJS.ProcessEnv)
    const prod = buildHardeningHeaders({ NODE_ENV: "production" } as NodeJS.ProcessEnv)

    expect(headerValue(dev, "Strict-Transport-Security")).toBeUndefined()
    expect(headerValue(prod, "Strict-Transport-Security")).toContain("max-age=63072000")
    expect(headerValue(prod, "Strict-Transport-Security")).toContain("includeSubDomains")
  })

  it("allowlists the R2 media + Google favicon image origins (matches next images config)", () => {
    const csp = buildContentSecurityPolicy({ NODE_ENV: "production" } as NodeJS.ProcessEnv)

    expect(csp).toContain("img-src")
    expect(csp).toContain("https://*.r2.dev")
    expect(csp).toContain("https://*.r2.cloudflarestorage.com")
    expect(csp).toContain("https://www.google.com")
    expect(csp).toContain("data:")
    expect(csp).toContain("blob:")
  })

  it("allowlists Stripe Checkout/Billing for frame-src and form-action (redirect target)", () => {
    const csp = buildContentSecurityPolicy({ NODE_ENV: "production" } as NodeJS.ProcessEnv)

    expect(csp).toContain("frame-src https://checkout.stripe.com https://billing.stripe.com")
    expect(csp).toContain(
      "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
    )
  })

  it("allowlists YouTube for frame-src (technique/reel video embeds)", () => {
    const csp = buildContentSecurityPolicy({ NODE_ENV: "production" } as NodeJS.ProcessEnv)

    expect(csp).toContain("https://www.youtube.com")
    expect(csp).toContain("https://www.youtube-nocookie.com")
  })

  it("locks down clickjacking + base-uri + object-src and upgrades mixed content in prod", () => {
    const csp = buildContentSecurityPolicy({ NODE_ENV: "production" } as NodeJS.ProcessEnv)

    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("upgrade-insecure-requests")
  })

  it("keeps unsafe-eval / ws out of production but allows them in dev (Turbopack/HMR)", () => {
    const dev = buildContentSecurityPolicy({ NODE_ENV: "development" } as NodeJS.ProcessEnv)
    const prod = buildContentSecurityPolicy({ NODE_ENV: "production" } as NodeJS.ProcessEnv)

    expect(dev).toContain("'unsafe-eval'")
    expect(dev).toContain("ws:")
    expect(prod).not.toContain("'unsafe-eval'")
    expect(prod).not.toContain("ws:")
    // upgrade-insecure-requests is prod-only.
    expect(dev).not.toContain("upgrade-insecure-requests")
  })

  it("wires the CSP report sink via report-uri + report-to (both nonce and static paths)", () => {
    const noNonce = buildContentSecurityPolicy({ NODE_ENV: "production" } as NodeJS.ProcessEnv)
    const withNonce = buildContentSecurityPolicy(
      { NODE_ENV: "production" } as NodeJS.ProcessEnv,
      "abc123",
    )

    for (const csp of [noNonce, withNonce]) {
      expect(csp).toContain("report-uri /api/csp-report")
      expect(csp).toContain("report-to csp")
    }
  })

  it("nonce migration: script-src drops 'unsafe-inline' for the nonce; style-src keeps it", () => {
    const csp = buildContentSecurityPolicy(
      { NODE_ENV: "production" } as NodeJS.ProcessEnv,
      "TESTNONCE==",
    )

    const scriptSrc = directive(csp, "script-src")
    const styleSrc = directive(csp, "style-src")

    expect(scriptSrc).toBe("script-src 'self' 'nonce-TESTNONCE=='")
    expect(scriptSrc).not.toContain("'unsafe-inline'")
    // style-src is unchanged — a nonce cannot cover inline style={{…}} attributes.
    expect(styleSrc).toBe("style-src 'self' 'unsafe-inline'")
  })

  it("no-nonce path is byte-identical to the pre-nonce behavior (aside from report dirs)", () => {
    const csp = buildContentSecurityPolicy({ NODE_ENV: "production" } as NodeJS.ProcessEnv)

    // Without a nonce (any static call) script-src keeps 'unsafe-inline' — no regression.
    expect(directive(csp, "script-src")).toBe("script-src 'self' 'unsafe-inline'")
    expect(directive(csp, "style-src")).toBe("style-src 'self' 'unsafe-inline'")
    expect(csp).not.toContain("'nonce-")
  })

  it("dev nonce path keeps 'unsafe-eval' alongside the nonce (Turbopack)", () => {
    const csp = buildContentSecurityPolicy(
      { NODE_ENV: "development" } as NodeJS.ProcessEnv,
      "DEVNONCE",
    )

    expect(directive(csp, "script-src")).toBe("script-src 'self' 'nonce-DEVNONCE' 'unsafe-eval'")
  })

  it("scopes the headers config to every route", () => {
    const config = buildSecurityHeadersConfig({ NODE_ENV: "production" } as NodeJS.ProcessEnv)

    expect(config).toHaveLength(1)
    expect(config[0]?.source).toBe("/:path*")
    expect(config[0]?.headers.length).toBeGreaterThan(0)
  })
})
