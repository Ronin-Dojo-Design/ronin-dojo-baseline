"use client"

import { useTranslations } from "next-intl"
import { type Dispatch, type SetStateAction } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/common/drawer"
import { Link } from "~/components/common/link"
import { MediaUploader } from "~/app/app/media/_components/media-uploader"

/**
 * MabUploadSheet — the B2 bottom-sheet host for the MAB "Upload photo/media" action
 * (SESSION_0500). Composes the shared `Drawer` bottom-sheet primitive (mobile: slides up
 * from bottom, drag handle + swipe-to-dismiss, reduced-motion fallback — no new primitive)
 * and hosts the shipped admin `MediaUploader` (the `uploadMediaToLibrary` action, no attach
 * target needed) in-context, BBLApp-style.
 *
 * Reuse note (SESSION_0500 fork): Create Post keeps its shipped `CreateCommunityPostDialog`
 * (login-gated + image upload, already tested on `/posts`) rather than being re-hosted here
 * — re-wrapping a Dialog-based tested surface as a Drawer was a worse tradeoff than reusing
 * it. Upload is the genuinely-light action and gets the bottom-sheet. This is the ONE
 * bottom-sheet host in the MAB; both light actions open in-context (Upload here, Create Post
 * via its dialog).
 *
 * Gated upstream: the MAB only mounts for admins, and the Upload action is additionally
 * `can(user, "media.manage")`-gated, so this sheet is only reachable by media managers.
 */
type MabUploadSheetProps = {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

export const MabUploadSheet = ({ isOpen, setIsOpen }: MabUploadSheetProps) => {
  const t = useTranslations("mobileShell")

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="max-w-lg">
        <DrawerHeader>
          <DrawerTitle>{t("upload_title")}</DrawerTitle>
          <DrawerDescription>{t("upload_description")}</DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col items-start gap-3 pb-2">
          <MediaUploader />

          <Link
            href="/app/media"
            className="text-sm text-primary underline-offset-2 hover:underline"
          >
            {t("upload_manage_link")}
          </Link>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
