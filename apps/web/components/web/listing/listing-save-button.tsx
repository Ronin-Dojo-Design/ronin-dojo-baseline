"use client"

import { HeartIcon } from "lucide-react"
import { usePathname } from "next/navigation"
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
  label?: string
  showLabel?: boolean
}

export const ListingSaveButton = ({
  subjectType,
  subjectId,
  label = "Save",
  showLabel = true,
  className,
  size = "sm",
  variant = "secondary",
  ...props
}: ListingSaveButtonProps) => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [bookmarked, setBookmarked] = useState(false)

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
    if (session?.user) {
      executeCheck({ subjectType, subjectId })
    }
  }, [executeCheck, session?.user, subjectType, subjectId])

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
              <span className={cx(!showLabel && "sr-only")}>{label}</span>
            </Button>
          }
        />
        <TooltipContent>Sign in to save this listing</TooltipContent>
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
        loading: nextBookmarked ? "Saving listing..." : "Removing saved listing...",
        success: nextBookmarked ? "Listing saved" : "Listing removed from saved items",
        error: err => err.message,
      },
    )
  }

  const text = bookmarked ? "Saved" : label

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
      <TooltipContent>{bookmarked ? "Remove saved listing" : "Save this listing"}</TooltipContent>
    </Tooltip>
  )
}
