import { notFound } from "next/navigation"
import { getRequestBrand } from "~/lib/brand-context"
import { getOrganizationBySlug } from "~/server/web/organization/queries"

/** Regex guard: only allow HSL-safe characters (digits, spaces, dots, commas, %, /) */
const isHslSafe = (v: string) => /^[\d.\s,/%]+$/.test(v)

interface Props {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export default async function OrganizationLayout({ params, children }: Props) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const org = await getOrganizationBySlug(brand, slug)

  if (!org) notFound()

  const settings = org.orgSettings

  // Build CSS overrides from OrgSettings (null = inherit from BrandSettings)
  const cssOverrides: string[] = []
  if (settings?.primaryColor && isHslSafe(settings.primaryColor))
    cssOverrides.push(`--color-primary: hsl(${settings.primaryColor});`)
  if (settings?.primaryFgColor && isHslSafe(settings.primaryFgColor))
    cssOverrides.push(`--color-primary-foreground: hsl(${settings.primaryFgColor});`)
  if (settings?.accentColor && isHslSafe(settings.accentColor))
    cssOverrides.push(`--color-accent: hsl(${settings.accentColor});`)
  if (settings?.accentFgColor && isHslSafe(settings.accentFgColor))
    cssOverrides.push(`--color-accent-foreground: hsl(${settings.accentFgColor});`)

  const orgCss = cssOverrides.length ? `[data-org="${org.id}"] { ${cssOverrides.join(" ")} }` : ""

  return (
    <>
      {orgCss && <style dangerouslySetInnerHTML={{ __html: orgCss }} />}
      <div data-org={org.id}>{children}</div>
    </>
  )
}
