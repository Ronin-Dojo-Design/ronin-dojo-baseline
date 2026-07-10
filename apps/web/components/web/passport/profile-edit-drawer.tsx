"use client"

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { Button, type ButtonProps } from "~/components/common/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/common/drawer"
import { Link } from "~/components/common/link"
import type { OwnerEditorData } from "~/server/web/directory/profile-view"
import { PassportEditor } from "./passport-editor"

/**
 * Inline profile-edit drawer (FI-024 H1 — one-surface law).
 *
 * Retires the separate `/app/profile` edit destination as the owner's edit surface: every edit
 * affordance on `/me` now opens the ONE canonical `PassportEditor` in-place (reusing the shared
 * `components/common/drawer` sheet the lineage drawer uses), owner AND admin via the editor's own
 * `adminPassportId` seam. The `/app/profile` 9-tab dashboard stays — only its role as the separate
 * edit route is retired.
 *
 * `ProfileEditProvider` wraps the owner profile body; scattered edit buttons call
 * `useProfileEdit().open` through context (server-component sections in between are fine — the
 * provider + `EditProfileButton` are both client nodes). When `editor` is null (unprovisioned
 * profile — the empty state), `open` is null and `EditProfileButton` degrades to a link to the
 * provisioning-aware `/app/profile`.
 *
 * @added SESSION_0521 — FI-024 H1 inline-edit port; thin context/drawer wrapper only, the
 *   editor itself is the pre-existing `PassportEditor` (no new editor — FS-0001).
 */

type ProfileEditContextValue = { open: (() => void) | null }

const ProfileEditContext = createContext<ProfileEditContextValue>({ open: null })

export function useProfileEdit() {
  return useContext(ProfileEditContext)
}

export function ProfileEditProvider({
  editor,
  children,
}: {
  editor: OwnerEditorData | null
  children: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])

  // Deep-link auto-open: the cross-page "This profile is yours →" links (directory hero + lineage
  // drawer) point to `/me#edit`, so a claimed owner lands straight in the editor. Hash-based so it
  // never forces a Suspense boundary / static-bailout the way `useSearchParams` would.
  useEffect(() => {
    if (editor && window.location.hash === "#edit") setIsOpen(true)
  }, [editor])

  const value: ProfileEditContextValue = editor ? { open } : { open: null }

  return (
    <ProfileEditContext.Provider value={value}>
      {children}

      {editor && (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="md:max-w-2xl">
            <DrawerHeader>
              <DrawerTitle>Edit your Passport</DrawerTitle>
              <DrawerDescription>
                Update your identity and directory profile. Each section saves on its own.
              </DrawerDescription>
            </DrawerHeader>

            <PassportEditor
              passport={editor.passport}
              directoryProfile={editor.directoryProfile}
              userId={editor.userId}
              canUploadVideo={editor.canUploadVideo}
            />
          </DrawerContent>
        </Drawer>
      )}
    </ProfileEditContext.Provider>
  )
}

/**
 * The edit affordance shared by every `/me` edit entry point. Opens the inline editor when the
 * profile is provisioned; otherwise links to `/app/profile` so the member can still complete
 * setup. `prefix` is opt-in per call site (some entries carry no icon).
 */
export function EditProfileButton({
  children,
  variant = "primary",
  size = "md",
  prefix,
  className,
}: {
  children: ReactNode
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
  prefix?: ReactNode
  className?: string
}) {
  const { open } = useProfileEdit()

  if (!open) {
    return (
      <Button
        variant={variant}
        size={size}
        prefix={prefix}
        className={className}
        render={<Link href="/app/profile" />}
      >
        {children}
      </Button>
    )
  }

  return (
    <Button variant={variant} size={size} prefix={prefix} className={className} onClick={open}>
      {children}
    </Button>
  )
}
