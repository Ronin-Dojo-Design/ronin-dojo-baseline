"use client"

import { SparklesIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Button } from "~/components/common/button"
import { ProfileEnhancementWizard } from "./profile-enhancement-wizard"
import type { BeltRankOption } from "~/server/web/onboarding/ranks"

/** localStorage marker so a completed/skipped wizard never auto-reopens. */
const STORAGE_KEY = "bbl:onboarding:profile:v1"

type ProfileEnhancementLauncherProps = {
  ranks: BeltRankOption[]
  userId: string
  initialAvatarUrl?: string | null
  /** True when the Passport is missing an avatar and/or a rank — auto-opens once. */
  incomplete: boolean
}

/**
 * Mounts the profile-enhancement wizard and decides when it opens: auto-open
 * once for an incomplete Passport (post-registration), always via the
 * `?complete=1` deep-link, and a manual "Complete your profile" button so a
 * member who skipped can reopen it. Completion is remembered in localStorage —
 * no migration.
 */
export function ProfileEnhancementLauncher({
  ranks,
  userId,
  initialAvatarUrl,
  incomplete,
}: ProfileEnhancementLauncherProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isDeepLink = searchParams.get("complete") === "1"

  useEffect(() => {
    if (isDeepLink) {
      setOpen(true)
      return
    }
    if (!incomplete) return
    let alreadyDone = false
    try {
      alreadyDone = window.localStorage.getItem(STORAGE_KEY) === "done"
    } catch {
      alreadyDone = false
    }
    if (!alreadyDone) setOpen(true)
  }, [isDeepLink, incomplete])

  const clearDeepLink = useCallback(() => {
    if (!isDeepLink) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete("complete")
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [isDeepLink, pathname, router, searchParams])

  const handleClose = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "done")
    } catch {
      // Ignore storage failures.
    }
    clearDeepLink()
    setOpen(false)
  }, [clearDeepLink])

  return (
    <>
      {incomplete && (
        <Button
          variant="secondary"
          size="sm"
          prefix={<SparklesIcon />}
          onClick={() => setOpen(true)}
        >
          Complete your profile
        </Button>
      )}
      <ProfileEnhancementWizard
        open={open}
        onOpenChange={setOpen}
        onComplete={handleClose}
        onSkip={handleClose}
        ranks={ranks}
        userId={userId}
        initialAvatarUrl={initialAvatarUrl}
      />
    </>
  )
}
