"use client"

import { ClipboardList } from "lucide-react"
import { Input } from "~/components/common/input"
import { Label } from "~/components/common/label"
import { Stack } from "~/components/common/stack"
import type { MemberSettings } from "~/server/web/settings/member-settings"
import { SettingsCard } from "./settings-card"

type ReadinessSectionProps = {
  values: MemberSettings["readiness"]
  onChange: (key: keyof MemberSettings["readiness"], value: string) => void
  disabled?: boolean
}

/**
 * "Readiness Snapshot" — the competition profile text inputs (primary division + coach) that keep
 * event registration and coach routing clean. BBLApp parity; uses the repo's `Input` primitive.
 */
export function ReadinessSection({ values, onChange, disabled }: ReadinessSectionProps) {
  return (
    <SettingsCard
      icon={ClipboardList}
      title="Readiness Snapshot"
      description="Keep your competition profile clean for event registration and coach routing."
    >
      <Stack direction="column" size="md" className="w-full">
        <Stack direction="column" size="xs" className="w-full">
          <Label htmlFor="settings-readiness-division">Primary division</Label>
          <Input
            id="settings-readiness-division"
            value={values.primaryDivision}
            onChange={event => onChange("primaryDivision", event.target.value)}
            placeholder="e.g. Adult / Blue / Lightweight"
            maxLength={120}
            disabled={disabled}
          />
        </Stack>
        <Stack direction="column" size="xs" className="w-full">
          <Label htmlFor="settings-readiness-coach">Primary coach</Label>
          <Input
            id="settings-readiness-coach"
            value={values.primaryCoach}
            onChange={event => onChange("primaryCoach", event.target.value)}
            placeholder="e.g. Professor Helena Ribeiro"
            maxLength={120}
            disabled={disabled}
          />
        </Stack>
      </Stack>
    </SettingsCard>
  )
}
