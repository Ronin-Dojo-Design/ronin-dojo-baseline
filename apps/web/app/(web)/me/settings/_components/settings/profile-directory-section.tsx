"use client"

import { Stack } from "~/components/common/stack"
import type { MemberSettings } from "~/server/web/settings/member-settings"
import { SettingsCard } from "./settings-card"
import { PROFILE_FIELDS, SECTION_META } from "./settings-fields"
import { ToggleRow } from "./toggle-row"

type ProfileDirectorySectionProps = {
  values: MemberSettings["profile"]
  onChange: (key: keyof MemberSettings["profile"], value: boolean) => void
  disabled?: boolean
}

/** "Profile & Directory" — public presence + lineage visibility toggles (BBLApp parity). */
export function ProfileDirectorySection({
  values,
  onChange,
  disabled,
}: ProfileDirectorySectionProps) {
  const meta = SECTION_META.profile

  return (
    <SettingsCard icon={meta.icon} title={meta.title} description={meta.description}>
      <Stack direction="column" size="md" className="w-full">
        {PROFILE_FIELDS.map(field => (
          <ToggleRow
            key={field.key}
            id={`settings-profile-${field.key}`}
            label={field.label}
            checked={values[field.key]}
            onCheckedChange={value => onChange(field.key, value)}
            disabled={disabled}
          />
        ))}
      </Stack>
    </SettingsCard>
  )
}
