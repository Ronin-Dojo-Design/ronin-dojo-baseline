// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
  buildSecurityHeadersConfig,
  type HeaderEntry,
} from "./security-headers"

const headerValue = (headers: HeaderEntry[], key: string): string | undefined =>
  headers.find(h => h.key === key)?.value

describe("security headers baseline (RISK #2)", () => {
  it("always enforces the non-CSP hardening headers", () => {
    const headers = buildSecurityHeaders({ NODE_ENV: "development" } as NodeJS.ProcessEnv)

    expect(headerValue(headers, "X-Content-Type-Options")).toBe("nosniff")
    expect(headerValue(headers, "X-Frame-Options")).toBe("DENY")
    expect(headerValue(headers, "Referrer-Policy")).toBe("strict-origin-when-cross-origin")
    expect(headerValue(headers, "Cross-Origin-Opener-Policy")).toBe("same-origin")
    expect(headerValue(headers, "Permissions-Policy")).toContain("camera=()")
  })

  it("ships the CSP as Report-Only by default (observe before enforce)", () => {
    const headers = buildSecurityHeaders({ NODE_ENV: "production" } as NodeJS.ProcessEnv)

    expect(headerValue(headers, "Content-Security-Policy-Report-Only")).toBeDefined()
    expect(headerValue(headers, "Content-Security-Policy")).toBeUndefined()
  })

  it("promotes the same policy to the enforcing header when CSP_ENFORCE is set", () => {
    const reportOnly = buildContentSecurityPolicy({ NODE_ENV: "production" } as NodeJS.ProcessEnv)
    const headers = buildSecurityHeaders({
      NODE_ENV: "production",
      CSP_ENFORCE: "1",
    } as NodeJS.ProcessEnv)

    expect(headerValue(headers, "Content-Security-Policy")).toBe(reportOnly)
    expect(headerValue(headers, "Content-Security-Policy-Report-Only")).toBeUndefined()
  })

  it("emits HSTS only in production", () => {
    const dev = buildSecurityHeaders({ NODE_ENV: "development" } as NodeJS.ProcessEnv)
    const prod = buildSecurityHeaders({ NODE_ENV: "production" } as NodeJS.ProcessEnv)

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

  it("scopes the headers config to every route", () => {
    const config = buildSecurityHeadersConfig({ NODE_ENV: "production" } as NodeJS.ProcessEnv)

    expect(config).toHaveLength(1)
    expect(config[0]?.source).toBe("/:path*")
    expect(config[0]?.headers.length).toBeGreaterThan(0)
  })
})
