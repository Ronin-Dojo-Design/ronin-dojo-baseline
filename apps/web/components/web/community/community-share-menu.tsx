"use client"

import { LinkIcon, MailIcon, Share2Icon } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"

/**
 * CommunityShareMenu — client-only share affordance for a community post (SESSION_0493 MVP: no
 * share schema). Harvested from the approved legacy `ShareDrawer` flows (copy link / native share
 * with copy fallback / email) but composed on OUR `DropdownMenu` + tokens instead of a bespoke
 * bottom sheet. The absolute URL is built at click time from `window.location.origin`.
 */
type CommunityShareMenuProps = {
  slug: string
  title: string
  /** Short plain-text teaser included in native-share / email bodies. */
  text?: string
}

export const CommunityShareMenu = ({ slug, title, text }: CommunityShareMenuProps) => {
  const t = useTranslations("community")

  const shareUrl = () => `${window.location.origin}/posts/${slug}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl())
      toast.success(t("share_link_copied"))
    } catch {
      toast.error(t("share_copy_failed"))
    }
  }

  const nativeShare = async () => {
    if (!navigator.share) {
      await copyLink()
      return
    }

    try {
      await navigator.share({ title, text, url: shareUrl() })
    } catch (error) {
      // Abort = the member closed the sheet; anything else falls back to copy.
      if ((error as Error | null)?.name !== "AbortError") {
        await copyLink()
      }
    }
  }

  const emailShare = () => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent([text, shareUrl()].filter(Boolean).join("\n\n"))
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            prefix={<Share2Icon />}
            aria-label={t("share")}
          />
        }
      />

      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuItem onClick={copyLink}>
          <LinkIcon /> {t("share_copy_link")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={nativeShare}>
          <Share2Icon /> {t("share_native")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={emailShare}>
          <MailIcon /> {t("share_email")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
