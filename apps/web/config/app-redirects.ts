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
