"use client"

import { Stack } from "~/components/common/stack"
import type { MemberSettings } from "~/server/web/settings/member-settings"
import { SettingsCard } from "./settings-card"
import { SECTION_META, SECURITY_FIELDS } from "./settings-fields"
import { ToggleRow } from "./toggle-row"

type SecuritySectionProps = {
  values: MemberSettings["security"]
  onChange: (key: keyof MemberSettings["security"], value: boolean) => void
  disabled?: boolean
}

/** "Security & Access" — login-activity + recovery alert toggles (BBLApp parity). */
export function SecuritySection({ values, onChange, disabled }: SecuritySectionProps) {
  const meta = SECTION_META.security

  return (
    <SettingsCard icon={meta.icon} title={meta.title} description={meta.description}>
      <Stack direction="column" size="md" className="w-full">
        {SECURITY_FIELDS.map(field => (
          <ToggleRow
            key={field.key}
            id={`settings-security-${field.key}`}
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
