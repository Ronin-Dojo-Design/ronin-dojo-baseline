"use client"

import { HeartIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { type ComponentProps, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
import { useSession } from "~/lib/auth-client"
import { cx } from "~/lib/utils"
import { checkBookmarkSubject, setBookmarkSubject } from "~/server/web/bookmarks/actions"
import type { BookmarkSubjectTypeInput } from "~/server/web/bookmarks/schema"

/**
 * ListingSaveButton — SESSION_0397. The generic, persisted Save affordance for ANY listing subject
 * (person/Passport, school/Organization, Technique, Post, LineageTree). Mirrors the L1 tool
 * `ListingBookmarkButton` behaviour exactly — sign-in-gated when logged out, optimistic heart-fill +
 * toast when logged in — but keyed on the polymorphic `{ subjectType, subjectId }` Bookmark contract
 * (SESSION_0397) instead of the tool-only `toolId`. (Pre-0397 this was a sign-in-only stub.)
 */

type ListingSaveButtonProps = Omit<ComponentProps<typeof Button>, "prefix"> & {
  subjectType: BookmarkSubjectTypeInput
  subjectId: string
  /** Override the "Save" label (i18n `components.listing.save` by default). */
  label?: string
  showLabel?: boolean
  /**
   * Server-hydrated initial saved-state (SESSION_0495 C2-2). When the parent already knows whether
   * the viewer saved this subject — a listing page can batch ONE query for the whole grid — pass it
   * here to skip the per-mount `checkBookmarkSubject` action. Omit it (the default) and the button
   * self-checks on mount, as before. `undefined` = "unknown, self-check"; a boolean = "authoritative".
   */
  initialSaved?: boolean
}

export const ListingSaveButton = ({
  subjectType,
  subjectId,
  label,
  showLabel = true,
  initialSaved,
  className,
  size = "sm",
  variant = "secondary",
  ...props
}: ListingSaveButtonProps) => {
  const t = useTranslations("components.listing")
  const saveLabel = label ?? t("save")
  const pathname = usePathname()
  const { data: session } = useSession()
  const [bookmarked, setBookmarked] = useState(initialSaved ?? false)

  const checkAction = useAction(checkBookmarkSubject, {
    onSuccess: ({ data }) => {
      if (data) {
        setBookmarked(data.bookmarked)
      }
    },
  })

  const setAction = useAction(setBookmarkSubject, {
    onSuccess: ({ data }) => {
      if (data) {
        setBookmarked(data.bookmarked)
      }
    },
  })

  const executeCheck = checkAction.execute

  useEffect(() => {
    // Skip the per-mount round-trip when the parent hydrated an authoritative saved-state — a grid of
    // N cards then costs ONE batched query instead of N per-card actions (the 30-action mount storm).
    if (session?.user && initialSaved === undefined) {
      executeCheck({ subjectType, subjectId })
    }
  }, [executeCheck, session?.user, subjectType, subjectId, initialSaved])

  if (!session?.user) {
    const next = encodeURIComponent(pathname)

    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size={size}
              variant={variant}
              prefix={<HeartIcon />}
              className={className}
              render={<Link href={`/auth/login?next=${next}`} />}
              {...props}
            >
              <span className={cx(!showLabel && "sr-only")}>{saveLabel}</span>
            </Button>
          }
        />
        <TooltipContent>{t("sign_in_tooltip")}</TooltipContent>
      </Tooltip>
    )
  }

  const handleClick = () => {
    const nextBookmarked = !bookmarked

    toast.promise(
      async () => {
        const result = await setAction.executeAsync({
          subjectType,
          subjectId,
          bookmarked: nextBookmarked,
        })

        if (result?.serverError) {
          throw new Error(result.serverError)
        }
      },
      {
        loading: nextBookmarked ? t("saving") : t("removing"),
        success: nextBookmarked ? t("save_success") : t("remove_success"),
        error: err => err.message,
      },
    )
  }

  const text = bookmarked ? t("saved") : saveLabel

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size={size}
            variant={variant}
            prefix={<HeartIcon className={cx(bookmarked && "fill-current text-primary")} />}
            className={className}
            isPending={setAction.isPending || checkAction.isPending}
            onClick={handleClick}
            {...props}
          >
            <span className={cx(!showLabel && "sr-only")}>{text}</span>
          </Button>
        }
      />
      <TooltipContent>{bookmarked ? t("remove_tooltip") : t("save_tooltip")}</TooltipContent>
    </Tooltip>
  )
}
