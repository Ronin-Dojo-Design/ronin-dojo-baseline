"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { Switch } from "~/components/common/switch"
import { haptics } from "~/lib/haptics"
import { readMabEnabled, writeMabEnabled } from "~/lib/mab-preferences"

/**
 * MabToggle — the re-enable/disable control for the MAB (SESSION_0500), lives in the "More"
 * drawer (`NavSheet`). When an admin turns the MAB off (via its own disable affordance or
 * here), this is the way back on: the write fires the same-tab `MAB_ENABLED_EVENT` that the
 * mounted `Mab` listens for, so it appears/disappears immediately.
 *
 * Admin-only: rendered inside `NavSheet` only when `isAdmin(user)` (the MAB is admin-only
 * today). Per-device (`localStorage`) — the promotion path to per-account lives in
 * `lib/mab-preferences.ts`.
 */
export const MabToggle = () => {
  const t = useTranslations("mobileShell")
  const [mounted, setMounted] = useState(false)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    setMounted(true)
    setEnabled(readMabEnabled())
  }, [])

  const handleChange = (next: boolean) => {
    haptics.select()
    setEnabled(next)
    writeMabEnabled(next)
  }

  // Stable pre-hydration node (matches the header/MAB mounted-guard idiom).
  if (!mounted) return null

  return (
    <label className="flex items-center justify-between gap-3 md:hidden">
      <span className="text-sm text-muted-foreground">{t("mab_setting_label")}</span>
      <Switch
        checked={enabled}
        onCheckedChange={handleChange}
        aria-label={t("mab_setting_label")}
      />
    </label>
  )
}
