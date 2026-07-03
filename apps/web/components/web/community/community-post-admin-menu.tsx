"use client"

import { EyeIcon, EyeOffIcon, ShieldIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { setCommunityPostStatus } from "~/server/web/community/actions"

/**
 * CommunityPostAdminMenu — the post-moderation affordance (SESSION_0493 MVP). Rendered ONLY when
 * the server page resolved the viewer as admin (the action itself re-enforces admin via
 * `adminActionClient` — this component is presentation, not the gate). One item: hide/unhide.
 */
type CommunityPostAdminMenuProps = {
  postId: string
  isHidden: boolean
}

export const CommunityPostAdminMenu = ({ postId, isHidden }: CommunityPostAdminMenuProps) => {
  const t = useTranslations("community")
  const router = useRouter()

  const { execute, isPending } = useAction(setCommunityPostStatus, {
    onSuccess: ({ data }) => {
      toast.success(data?.status === "HIDDEN" ? t("admin_hidden_toast") : t("admin_unhidden_toast"))
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? t("admin_toggle_failed"))
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            prefix={<ShieldIcon />}
            aria-label={t("admin_menu_label")}
            isPending={isPending}
          />
        }
      />

      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuItem
          variant={isHidden ? "default" : "destructive"}
          onClick={() => execute({ id: postId, hidden: !isHidden })}
        >
          {isHidden ? (
            <>
              <EyeIcon /> {t("admin_unhide_post")}
            </>
          ) : (
            <>
              <EyeOffIcon /> {t("admin_hide_post")}
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
