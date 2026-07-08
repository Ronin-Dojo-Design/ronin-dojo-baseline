import { PaletteIcon } from "lucide-react"
import { Brand } from "~/.generated/prisma/client"
import { H2 } from "~/components/common/heading"
import { Wrapper } from "~/components/common/wrapper"
import { findBrandSettings } from "~/server/admin/brand-settings/queries"
import { BrandSettingsForm } from "./_components/brand-settings-form"

// Single-brand collapse (SESSION_0447): one editable row (BBL) — the former
// per-brand list (BASELINE/RONIN/WEKAF) is gone.
export default async function AppBrandSettingsPage() {
  const settings = await findBrandSettings(Brand.BBL)

  return (
    <Wrapper size="lg" gap="sm">
      <div className="flex items-center gap-3">
        <PaletteIcon className="size-6" />
        <div>
          <H2>Appearance</H2>
          <p className="text-sm text-muted-foreground">
            Brand theme colors and asset URLs. Changes take effect on next page load.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <BrandSettingsForm settings={settings} />
      </div>
    </Wrapper>
  )
}
