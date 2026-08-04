"use client"

import { Stack } from "~/components/common/stack"
import type { MemberSettings } from "~/server/web/settings/member-settings"
import { SettingsCard } from "./settings-card"
import { NOTIFICATION_FIELDS, SECTION_META } from "./settings-fields"
import { ToggleRow } from "./toggle-row"

type NotificationsSectionProps = {
  values: MemberSettings["notifications"]
  onChange: (key: keyof MemberSettings["notifications"], value: boolean) => void
  disabled?: boolean
}

/** "Notifications" — inbox opt-ins for approvals, events, and lineage posts (BBLApp parity). */
export function NotificationsSection({ values, onChange, disabled }: NotificationsSectionProps) {
  const meta = SECTION_META.notifications

  return (
    <SettingsCard icon={meta.icon} title={meta.title} description={meta.description}>
      <Stack direction="column" size="md" className="w-full">
        {NOTIFICATION_FIELDS.map(field => (
          <ToggleRow
            key={field.key}
            id={`settings-notifications-${field.key}`}
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
