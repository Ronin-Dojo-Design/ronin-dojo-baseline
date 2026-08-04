import { SettingsIcon } from "lucide-react"
import { Stack } from "~/components/common/stack"
import { BrandTypography, bblHeadingScopeClass } from "~/components/web/ui/brand-typography"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { MemberSettingsForm } from "./member-settings-form"
import type { MemberSettingsViewProps } from "./settings-types"

/**
 * `/me/settings` — the authenticated member's account controls (BBLApp `BBLSettingsPage` parity).
 *
 * Thin orchestrator (the folder module's public barrel): it wires the neutral nav `Breadcrumbs`
 * + page header to the brand-scoped settings body. The body is wrapped in `BrandTypography` and
 * the grid in `bblHeadingScopeClass` so, under BBL, the section headings resolve the BBL type
 * tokens server-side — the client cards never import the brand-typography module. All persistence
 * flows through the client form's server action.
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */
export function MemberSettingsView({ brand, settings }: MemberSettingsViewProps) {
  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/me", title: "My Passport" },
          { url: "/me/settings", title: "Settings" },
        ]}
      />

      <BrandTypography brand={brand}>
        <Stack direction="column" size="lg" className="w-full">
          <Intro>
            <Stack size="md" wrap={false} className="items-center">
              <div className="rounded-xl border bg-card p-2 text-primary">
                <SettingsIcon className="size-6" />
              </div>
              <Stack direction="column" size="xs">
                <IntroTitle>Settings</IntroTitle>
                <IntroDescription>
                  Keep your profile, privacy, and notifications aligned across the dojo.
                </IntroDescription>
              </Stack>
            </Stack>
          </Intro>

          <div className={bblHeadingScopeClass}>
            <MemberSettingsForm initialSettings={settings} />
          </div>
        </Stack>
      </BrandTypography>
    </>
  )
}
