"use client"

import { HeartIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { type ComponentProps, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Tooltip } from "~/components/common/tooltip"
import { useSession } from "~/lib/auth-client"
import { cx } from "~/lib/utils"
import { checkBookmark, setBookmark } from "~/server/web/bookmarks/actions"

type ListingBookmarkButtonProps = Omit<ComponentProps<typeof Button>, "prefix"> & {
  toolId: string
  label?: string
  showLabel?: boolean
}

export const ListingBookmarkButton = ({
  toolId,
  label = "Save",
  showLabel = true,
  className,
  size = "sm",
  variant = "secondary",
  ...props
}: ListingBookmarkButtonProps) => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [bookmarked, setBookmarked] = useState(false)

  const checkAction = useAction(checkBookmark, {
    onSuccess: ({ data }) => {
      if (data) {
        setBookmarked(data.bookmarked)
      }
    },
  })

  const setAction = useAction(setBookmark, {
    onSuccess: ({ data }) => {
      if (data) {
        setBookmarked(data.bookmarked)
      }
    },
  })

  const executeCheck = checkAction.execute

  useEffect(() => {
    if (session?.user) {
      executeCheck({ toolId })
    }
  }, [executeCheck, session?.user, toolId])

  if (!session?.user) {
    const next = encodeURIComponent(pathname)

    return (
      <Tooltip tooltip="Sign in to save this listing">
        <Button
          size={size}
          variant={variant}
          prefix={<HeartIcon />}
          className={className}
          asChild
          {...props}
        >
          <Link href={`/auth/login?next=${next}`}>
            <span className={cx(!showLabel && "sr-only")}>{label}</span>
          </Link>
        </Button>
      </Tooltip>
    )
  }

  const handleClick = () => {
    const nextBookmarked = !bookmarked

    toast.promise(
      async () => {
        const result = await setAction.executeAsync({ toolId, bookmarked: nextBookmarked })

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
    <Tooltip tooltip={bookmarked ? "Remove saved listing" : "Save this listing"}>
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
    </Tooltip>
  )
}
