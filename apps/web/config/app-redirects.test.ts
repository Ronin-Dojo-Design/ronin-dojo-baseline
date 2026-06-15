// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  buildMigratedAdminAppRedirects,
  buildMigratedDashboardAppRedirects,
  resolveAppTabRedirect,
  resolveMigratedAppRedirect,
} from "./app-redirects"

describe("migrated admin app redirects", () => {
  it("redirects only admin areas with existing /app equivalents", () => {
    expect(buildMigratedAdminAppRedirects()).toEqual([
      { source: "/admin", destination: "/app", permanent: true },
      { source: "/admin/users", destination: "/app/users", permanent: true },
      { source: "/admin/users/:path*", destination: "/app/users/:path*", permanent: true },
      { source: "/admin/lineage", destination: "/app/lineage", permanent: true },
      { source: "/admin/lineage/:path*", destination: "/app/lineage/:path*", permanent: true },
      { source: "/admin/claims", destination: "/app/claims", permanent: true },
      { source: "/admin/claims/:path*", destination: "/app/claims/:path*", permanent: true },
      { source: "/admin/tournaments", destination: "/app/tournaments", permanent: true },
      {
        source: "/admin/tournaments/:path*",
        destination: "/app/tournaments/:path*",
        permanent: true,
      },
      { source: "/admin/memberships", destination: "/app/memberships", permanent: true },
      {
        source: "/admin/memberships/:path*",
        destination: "/app/memberships/:path*",
        permanent: true,
      },
      { source: "/admin/organizations", destination: "/app/organizations", permanent: true },
      {
        source: "/admin/organizations/:path*",
        destination: "/app/organizations/:path*",
        permanent: true,
      },
      { source: "/admin/certificates", destination: "/app/certificates", permanent: true },
      {
        source: "/admin/certificates/:path*",
        destination: "/app/certificates/:path*",
        permanent: true,
      },
      { source: "/admin/posts", destination: "/app/posts", permanent: true },
      { source: "/admin/posts/:path*", destination: "/app/posts/:path*", permanent: true },
      { source: "/admin/content", destination: "/app/content", permanent: true },
      { source: "/admin/content/:path*", destination: "/app/content/:path*", permanent: true },
      { source: "/admin/media", destination: "/app/media", permanent: true },
      { source: "/admin/media/:path*", destination: "/app/media/:path*", permanent: true },
      { source: "/admin/roles", destination: "/app/roles", permanent: true },
      { source: "/admin/roles/:path*", destination: "/app/roles/:path*", permanent: true },
      { source: "/admin/entitlements", destination: "/app/entitlements", permanent: true },
      {
        source: "/admin/entitlements/:path*",
        destination: "/app/entitlements/:path*",
        permanent: true,
      },
      { source: "/admin/invites", destination: "/app/invites", permanent: true },
      { source: "/admin/invites/:path*", destination: "/app/invites/:path*", permanent: true },
      { source: "/admin/leads", destination: "/app/leads", permanent: true },
      { source: "/admin/leads/:path*", destination: "/app/leads/:path*", permanent: true },
      { source: "/admin/email", destination: "/app/email", permanent: true },
      { source: "/admin/email/:path*", destination: "/app/email/:path*", permanent: true },
      {
        source: "/admin/brand-settings",
        destination: "/app/brand-settings",
        permanent: true,
      },
      {
        source: "/admin/brand-settings/:path*",
        destination: "/app/brand-settings/:path*",
        permanent: true,
      },
      { source: "/admin/privacy", destination: "/app/privacy/requests", permanent: true },
      {
        source: "/admin/privacy/requests",
        destination: "/app/privacy/requests",
        permanent: true,
      },
      {
        source: "/admin/privacy/requests/:path*",
        destination: "/app/privacy/requests/:path*",
        permanent: true,
      },
      { source: "/admin/reports", destination: "/app/reports", permanent: true },
      { source: "/admin/reports/:path*", destination: "/app/reports/:path*", permanent: true },
      { source: "/admin/programs", destination: "/app/programs", permanent: true },
      { source: "/admin/programs/:path*", destination: "/app/programs/:path*", permanent: true },
      { source: "/admin/courses", destination: "/app/courses", permanent: true },
      { source: "/admin/courses/:path*", destination: "/app/courses/:path*", permanent: true },
      { source: "/admin/age-groups", destination: "/app/age-groups", permanent: true },
      {
        source: "/admin/age-groups/:path*",
        destination: "/app/age-groups/:path*",
        permanent: true,
      },
      { source: "/admin/skill-levels", destination: "/app/skill-levels", permanent: true },
      {
        source: "/admin/skill-levels/:path*",
        destination: "/app/skill-levels/:path*",
        permanent: true,
      },
      { source: "/admin/schedule", destination: "/app/schedule", permanent: true },
      { source: "/admin/schedule/:path*", destination: "/app/schedule/:path*", permanent: true },
      { source: "/admin/billing", destination: "/app/billing", permanent: true },
      { source: "/admin/billing/:path*", destination: "/app/billing/:path*", permanent: true },
      { source: "/admin/categories", destination: "/app/categories", permanent: true },
      { source: "/admin/categories/:path*", destination: "/app/categories/:path*", permanent: true },
      { source: "/admin/tags", destination: "/app/tags", permanent: true },
      { source: "/admin/tags/:path*", destination: "/app/tags/:path*", permanent: true },
      { source: "/admin/pricing-plans", destination: "/app/pricing-plans", permanent: true },
      { source: "/admin/pricing-plans/:path*", destination: "/app/pricing-plans/:path*", permanent: true },
      { source: "/admin/subscription-tiers", destination: "/app/subscription-tiers", permanent: true },
      { source: "/admin/subscription-tiers/:path*", destination: "/app/subscription-tiers/:path*", permanent: true },
      { source: "/admin/subscriptions", destination: "/app/subscriptions", permanent: true },
      { source: "/admin/subscriptions/:path*", destination: "/app/subscriptions/:path*", permanent: true },
      { source: "/admin/merch", destination: "/app/merch", permanent: true },
      { source: "/admin/merch/:path*", destination: "/app/merch/:path*", permanent: true },
      { source: "/admin/tools", destination: "/app/tools", permanent: true },
      { source: "/admin/tools/:path*", destination: "/app/tools/:path*", permanent: true },
      { source: "/admin/storage", destination: "/app/storage", permanent: true },
      { source: "/admin/storage/:path*", destination: "/app/storage/:path*", permanent: true },
      { source: "/admin/repo-docs", destination: "/app/repo-docs", permanent: true },
      { source: "/admin/repo-docs/:path*", destination: "/app/repo-docs/:path*", permanent: true },
    ])
  })

  it("does not claim 2c blanket parity for unmigrated admin areas", () => {
    const sources = buildMigratedAdminAppRedirects().map(route => route.source)

    expect(sources).not.toContain("/admin/:path*")
  })

  it("redirects only dashboard routes with exact app editor parity", () => {
    expect(buildMigratedDashboardAppRedirects()).toEqual([
      {
        source: "/dashboard",
        destination: "/app/profile",
        permanent: true,
      },
      {
        source: "/dashboard/lineage/:treeId",
        destination: "/app/lineage/:treeId/edit",
        permanent: true,
      },
      {
        source: "/dashboard/events",
        destination: "/app/events",
        permanent: true,
      },
      {
        source: "/dashboard/events/:path*",
        destination: "/app/events/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/techniques",
        destination: "/app/techniques",
        permanent: true,
      },
      {
        source: "/dashboard/techniques/:path*",
        destination: "/app/techniques/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/:path*",
        destination: "/app/profile",
        permanent: true,
      },
    ])
  })

  it("keeps exact dashboard child routes before the catch-all fallback", () => {
    const sources = buildMigratedDashboardAppRedirects().map(route => route.source)

    expect(sources.indexOf("/dashboard/events/:path*")).toBeLessThan(
      sources.indexOf("/dashboard/:path*"),
    )
    expect(sources.indexOf("/dashboard/techniques/:path*")).toBeLessThan(
      sources.indexOf("/dashboard/:path*"),
    )
    expect(sources.indexOf("/dashboard/lineage/:treeId")).toBeLessThan(
      sources.indexOf("/dashboard/:path*"),
    )
  })

  it("resolves migrated paths for proxy redirects before auth redirects", () => {
    expect(resolveMigratedAppRedirect("/admin/users")).toBe("/app/users")
    expect(resolveMigratedAppRedirect("/admin/users/abc")).toBe("/app/users/abc")
    expect(resolveMigratedAppRedirect("/dashboard")).toBe("/app/profile")
    expect(resolveMigratedAppRedirect("/dashboard/events/new")).toBe("/app/events/new")
    expect(resolveMigratedAppRedirect("/dashboard/techniques/abc")).toBe("/app/techniques/abc")
    expect(resolveMigratedAppRedirect("/dashboard/lineage/tree_123")).toBe(
      "/app/lineage/tree_123/edit",
    )
    expect(resolveMigratedAppRedirect("/dashboard/unknown/stale")).toBe("/app/profile")
    expect(resolveMigratedAppRedirect("/admin/certificates")).toBe("/app/certificates")
    expect(resolveMigratedAppRedirect("/admin/certificates/new")).toBe("/app/certificates/new")
    expect(resolveMigratedAppRedirect("/admin/roles")).toBe("/app/roles")
    expect(resolveMigratedAppRedirect("/admin/roles/new")).toBe("/app/roles/new")
    expect(resolveMigratedAppRedirect("/admin/entitlements/abc")).toBe("/app/entitlements/abc")
    expect(resolveMigratedAppRedirect("/admin/invites/new")).toBe("/app/invites/new")
    expect(resolveMigratedAppRedirect("/admin/leads/lead_123")).toBe("/app/leads/lead_123")
    expect(resolveMigratedAppRedirect("/admin/email")).toBe("/app/email")
    expect(resolveMigratedAppRedirect("/admin/brand-settings")).toBe("/app/brand-settings")
    expect(resolveMigratedAppRedirect("/admin/privacy")).toBe("/app/privacy/requests")
    expect(resolveMigratedAppRedirect("/admin/privacy/requests/dsr_123")).toBe(
      "/app/privacy/requests/dsr_123",
    )
    expect(resolveMigratedAppRedirect("/admin/reports/report_123")).toBe("/app/reports/report_123")
    expect(resolveMigratedAppRedirect("/admin/programs")).toBe("/app/programs")
    expect(resolveMigratedAppRedirect("/admin/programs/program_123")).toBe(
      "/app/programs/program_123",
    )
    expect(resolveMigratedAppRedirect("/admin/courses/course_123")).toBe("/app/courses/course_123")
    expect(resolveMigratedAppRedirect("/admin/age-groups/new")).toBe("/app/age-groups/new")
    expect(resolveMigratedAppRedirect("/admin/skill-levels/level_123")).toBe(
      "/app/skill-levels/level_123",
    )
    expect(resolveMigratedAppRedirect("/admin/schedule")).toBe("/app/schedule")
    expect(resolveMigratedAppRedirect("/admin/schedule/month")).toBe("/app/schedule/month")
    expect(resolveMigratedAppRedirect("/admin/pricing-plans")).toBe("/app/pricing-plans")
    expect(resolveMigratedAppRedirect("/admin/tools/tool_123")).toBe("/app/tools/tool_123")
  })

  it("resolves exact app index routes to addressable profile tabs", () => {
    expect(resolveAppTabRedirect("/app/events")).toBe("/app/profile?tab=events")
    expect(resolveAppTabRedirect("/app/techniques")).toBe("/app/profile?tab=techniques")
    expect(resolveAppTabRedirect("/app/events/new")).toBe(null)
    expect(resolveAppTabRedirect("/app/techniques/new")).toBe(null)
  })
})
