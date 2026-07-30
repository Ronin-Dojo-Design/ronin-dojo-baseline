"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { updateMemberSettings } from "~/server/web/settings/actions"
import type { MemberSettings } from "~/server/web/settings/member-settings"
import { NotificationsSection } from "./notifications-section"
import { ProfileDirectorySection } from "./profile-directory-section"
import { ReadinessSection } from "./readiness-section"
import { SecuritySection } from "./security-section"

type MemberSettingsFormProps = {
  /** Server-resolved settings (defaults already layered in) that seed the form. */
  initialSettings: MemberSettings
}

/**
 * Client orchestrator for the member settings page: owns the working copy of every section's
 * values, tracks dirtiness against the server snapshot, and persists the whole blob through the
 * `updateMemberSettings` server action. On success it re-syncs to the saved values and refreshes
 * so the page reflects the persisted state across reloads.
 */
export function MemberSettingsForm({ initialSettings }: MemberSettingsFormProps) {
  const router = useRouter()
  const [settings, setSettings] = useState<MemberSettings>(initialSettings)
  const [savedSettings, setSavedSettings] = useState<MemberSettings>(initialSettings)

  // Re-seed when the server snapshot changes (e.g. after router.refresh()).
  useEffect(() => {
    setSettings(initialSettings)
    setSavedSettings(initialSettings)
  }, [initialSettings])

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings],
  )

  const { execute, isExecuting } = useAction(updateMemberSettings, {
    onSuccess: ({ data }) => {
      if (data) {
        setSavedSettings(data)
      }
      toast.success("Settings saved.")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to save settings.")
    },
  })

  function updateGroup<G extends keyof MemberSettings>(
    group: G,
    value: Partial<MemberSettings[G]>,
  ) {
    setSettings(current => ({ ...current, [group]: { ...current[group], ...value } }))
  }

  return (
    <Stack direction="column" size="lg" className="w-full">
      <div className="grid w-full gap-4 md:grid-cols-2">
        <ProfileDirectorySection
          values={settings.profile}
          onChange={(key, value) => updateGroup("profile", { [key]: value })}
          disabled={isExecuting}
        />
        <NotificationsSection
          values={settings.notifications}
          onChange={(key, value) => updateGroup("notifications", { [key]: value })}
          disabled={isExecuting}
        />
        <SecuritySection
          values={settings.security}
          onChange={(key, value) => updateGroup("security", { [key]: value })}
          disabled={isExecuting}
        />
        <ReadinessSection
          values={settings.readiness}
          onChange={(key, value) => updateGroup("readiness", { [key]: value })}
          disabled={isExecuting}
        />
      </div>

      <Stack
        size="md"
        className="sticky bottom-4 w-full items-center justify-between rounded-lg border bg-card/95 px-4 py-3 shadow-sm backdrop-blur"
        wrap={false}
      >
        <Note>{isDirty ? "You have unsaved changes." : "All changes saved."}</Note>
        <Button
          type="button"
          variant="primary"
          onClick={() => execute(settings)}
          disabled={!isDirty}
          isPending={isExecuting}
        >
          Save changes
        </Button>
      </Stack>
    </Stack>
  )
}
