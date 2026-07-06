"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * Build the explore-view URL search params for a focused member — the single
 * URL shape shared by both "recenter" (`replaceState`) and "copy focus link".
 * Reads the live `window.location.search` so unrelated params (e.g. `?cards=v2`)
 * are preserved. Extracted so the `view=explore` + `focus=<id>` contract lives
 * in exactly ONE place (was duplicated across `focusMember` + `copyFocusLink`).
 */
export function buildFocusSearchParams(memberId: string): URLSearchParams {
  const sp = new URLSearchParams(window.location.search)
  sp.set("view", "explore")
  sp.set("focus", memberId)
  return sp
}

/**
 * Focus state for the cinematic lineage explorer: which member is centered, the
 * "recenter" + "copy focus link" actions, and the auto-dismissing interaction
 * hint. Behavior is identical to the prior inline island logic — the
 * `history.replaceState` / clipboard writes and the 1400ms "copied" timeout are
 * unchanged; only the ownership moved into this hook.
 */
export function useLineageFocus(initialMemberId: string | null) {
  const [focusMemberId, setFocusMemberId] = useState<string | null>(initialMemberId)

  // "Click to recenter" hint auto-dismisses after the first focus interaction.
  const [hasInteracted, setHasInteracted] = useState(false)

  const [copied, setCopied] = useState(false)

  const focusMember = useCallback((memberId: string) => {
    setFocusMemberId(memberId)
    setHasInteracted(true)
    window.history.replaceState(null, "", `?${buildFocusSearchParams(memberId).toString()}`)
  }, [])

  const copyFocusLink = useCallback((memberId: string) => {
    const sp = buildFocusSearchParams(memberId)
    const url = `${window.location.origin}${window.location.pathname}?${sp.toString()}`

    void navigator.clipboard?.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }, [])

  // Keep React focus in sync if the initial focus id resolves late (data load).
  useEffect(() => {
    if (!focusMemberId && initialMemberId) setFocusMemberId(initialMemberId)
  }, [focusMemberId, initialMemberId])

  return {
    focusMemberId,
    focusMember,
    copyFocusLink,
    copied,
    hasInteracted,
    setHasInteracted,
  }
}
