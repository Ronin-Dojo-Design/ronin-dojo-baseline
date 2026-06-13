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
    ])
  })

  it("does not claim 2c blanket parity for unmigrated admin areas", () => {
    const sources = buildMigratedAdminAppRedirects().map(route => route.source)

    expect(sources).not.toContain("/admin/:path*")
    expect(sources).not.toContain("/admin/certificates/:path*")
    expect(sources).not.toContain("/admin/pricing-plans/:path*")
    expect(sources).not.toContain("/admin/content/:path*")
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
    expect(resolveMigratedAppRedirect("/admin/certificates")).toBe(null)
  })

  it("resolves exact app index routes to addressable profile tabs", () => {
    expect(resolveAppTabRedirect("/app/events")).toBe("/app/profile?tab=events")
    expect(resolveAppTabRedirect("/app/techniques")).toBe("/app/profile?tab=techniques")
    expect(resolveAppTabRedirect("/app/events/new")).toBe(null)
    expect(resolveAppTabRedirect("/app/techniques/new")).toBe(null)
  })
})
