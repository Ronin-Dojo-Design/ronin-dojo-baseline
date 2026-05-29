import { PaletteIcon } from "lucide-react"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { H2 } from "~/components/common/heading"
import { Wrapper } from "~/components/common/wrapper"
import { findAllBrandSettings } from "~/server/admin/brand-settings/queries"
import { BrandSettingsForm } from "./_components/brand-settings-form"

const brandLabels: Record<string, string> = {
  BASELINE_MARTIAL_ARTS: "Baseline Martial Arts",
  RONIN_DOJO_DESIGN: "Ronin Dojo Design",
  BBL: "Black Belt Legacy",
  WEKAF: "WEKAF USA",
}

const allBrands = ["BASELINE_MARTIAL_ARTS", "RONIN_DOJO_DESIGN", "BBL", "WEKAF"] as const

export default withAdminPage(async () => {
  const existingSettings = await findAllBrandSettings()
  const settingsMap = new Map(existingSettings.map(s => [s.brand, s]))

  return (
    <Wrapper size="lg" gap="sm">
      <div className="flex items-center gap-3">
        <PaletteIcon className="size-6" />
        <div>
          <H2>Brand Settings</H2>
          <p className="text-sm text-muted-foreground">
            Theme colors and asset URLs per brand. Changes take effect on next page load.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {allBrands.map(brand => (
          <div key={brand} className="rounded-lg border p-6">
            <BrandSettingsForm
              brand={brand}
              brandLabel={brandLabels[brand] ?? brand}
              settings={settingsMap.get(brand) ?? null}
            />
          </div>
        ))}
      </div>
    </Wrapper>
  )
})
