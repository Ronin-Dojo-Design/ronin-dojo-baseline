const MIGRATED_ADMIN_APP_ROUTES = [
  { source: "/admin", destination: "/app" },
  { source: "/admin/users", destination: "/app/users" },
  { source: "/admin/users/:path*", destination: "/app/users/:path*" },
  { source: "/admin/lineage", destination: "/app/lineage" },
  { source: "/admin/lineage/:path*", destination: "/app/lineage/:path*" },
  { source: "/admin/claims", destination: "/app/claims" },
  { source: "/admin/claims/:path*", destination: "/app/claims/:path*" },
  { source: "/admin/tournaments", destination: "/app/tournaments" },
  { source: "/admin/tournaments/:path*", destination: "/app/tournaments/:path*" },
  { source: "/admin/memberships", destination: "/app/memberships" },
  { source: "/admin/memberships/:path*", destination: "/app/memberships/:path*" },
  { source: "/admin/organizations", destination: "/app/organizations" },
  { source: "/admin/organizations/:path*", destination: "/app/organizations/:path*" },
  { source: "/admin/certificates", destination: "/app/certificates" },
  { source: "/admin/certificates/:path*", destination: "/app/certificates/:path*" },
  { source: "/admin/posts", destination: "/app/posts" },
  { source: "/admin/posts/:path*", destination: "/app/posts/:path*" },
  { source: "/admin/content", destination: "/app/content" },
  { source: "/admin/content/:path*", destination: "/app/content/:path*" },
  { source: "/admin/media", destination: "/app/media" },
  { source: "/admin/media/:path*", destination: "/app/media/:path*" },
  { source: "/admin/roles", destination: "/app/roles" },
  { source: "/admin/roles/:path*", destination: "/app/roles/:path*" },
  { source: "/admin/entitlements", destination: "/app/entitlements" },
  { source: "/admin/entitlements/:path*", destination: "/app/entitlements/:path*" },
  { source: "/admin/invites", destination: "/app/invites" },
  { source: "/admin/invites/:path*", destination: "/app/invites/:path*" },
  { source: "/admin/leads", destination: "/app/leads" },
  { source: "/admin/leads/:path*", destination: "/app/leads/:path*" },
  { source: "/admin/email", destination: "/app/email" },
  { source: "/admin/email/:path*", destination: "/app/email/:path*" },
  { source: "/admin/brand-settings", destination: "/app/brand-settings" },
  { source: "/admin/brand-settings/:path*", destination: "/app/brand-settings/:path*" },
  { source: "/admin/privacy", destination: "/app/privacy/requests" },
  { source: "/admin/privacy/requests", destination: "/app/privacy/requests" },
  { source: "/admin/privacy/requests/:path*", destination: "/app/privacy/requests/:path*" },
  { source: "/admin/reports", destination: "/app/reports" },
  { source: "/admin/reports/:path*", destination: "/app/reports/:path*" },
  { source: "/admin/programs", destination: "/app/programs" },
  { source: "/admin/programs/:path*", destination: "/app/programs/:path*" },
  { source: "/admin/courses", destination: "/app/courses" },
  { source: "/admin/courses/:path*", destination: "/app/courses/:path*" },
  { source: "/admin/age-groups", destination: "/app/age-groups" },
  { source: "/admin/age-groups/:path*", destination: "/app/age-groups/:path*" },
  { source: "/admin/skill-levels", destination: "/app/skill-levels" },
  { source: "/admin/skill-levels/:path*", destination: "/app/skill-levels/:path*" },
  { source: "/admin/schedule", destination: "/app/schedule" },
  { source: "/admin/schedule/:path*", destination: "/app/schedule/:path*" },
] as const

const MIGRATED_DASHBOARD_APP_ROUTES = [
  { source: "/dashboard", destination: "/app/profile" },
  { source: "/dashboard/lineage/:treeId", destination: "/app/lineage/:treeId/edit" },
  { source: "/dashboard/events", destination: "/app/events" },
  { source: "/dashboard/events/:path*", destination: "/app/events/:path*" },
  { source: "/dashboard/techniques", destination: "/app/techniques" },
  { source: "/dashboard/techniques/:path*", destination: "/app/techniques/:path*" },
  { source: "/dashboard/:path*", destination: "/app/profile" },
] as const

const APP_TAB_REDIRECTS = [
  { source: "/app/events", destination: "/app/profile?tab=events" },
  { source: "/app/techniques", destination: "/app/profile?tab=techniques" },
] as const

const matchStaticOrPath = (pathname: string, source: string, destination: string) => {
  if (!source.includes(":path*")) {
    return pathname === source ? destination : null
  }

  const sourceBase = source.replace("/:path*", "")
  if (pathname === sourceBase) return destination.replace("/:path*", "")
  if (!pathname.startsWith(`${sourceBase}/`)) return null

  const rest = pathname.slice(sourceBase.length + 1)
  return destination.replace(":path*", rest)
}

const matchLineageEditor = (pathname: string) => {
  const match = /^\/dashboard\/lineage\/([^/]+)$/.exec(pathname)
  return match?.[1] ? `/app/lineage/${match[1]}/edit` : null
}

export const resolveMigratedAppRedirect = (pathname: string): string | null => {
  for (const route of [...MIGRATED_ADMIN_APP_ROUTES, ...MIGRATED_DASHBOARD_APP_ROUTES]) {
    if (route.source === "/dashboard/lineage/:treeId") {
      const destination = matchLineageEditor(pathname)
      if (destination) return destination
      continue
    }

    const destination = matchStaticOrPath(pathname, route.source, route.destination)
    if (destination) return destination
  }

  return null
}

export const resolveAppTabRedirect = (pathname: string): string | null => {
  const route = APP_TAB_REDIRECTS.find(route => route.source === pathname)

  return route?.destination ?? null
}

export const buildMigratedAdminAppRedirects = () =>
  MIGRATED_ADMIN_APP_ROUTES.map(route => ({
    ...route,
    permanent: true,
  }))

export const buildMigratedDashboardAppRedirects = () =>
  MIGRATED_DASHBOARD_APP_ROUTES.map(route => ({
    ...route,
    permanent: true,
  }))
