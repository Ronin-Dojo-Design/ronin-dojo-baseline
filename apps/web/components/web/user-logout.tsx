"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { signOut } from "~/lib/auth-client"

export const UserLogout = ({ ...props }: ComponentProps<"button">) => {
  const t = useTranslations()
  const router = useRouter()

  const handleSignOut = async () => {
    signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh()
          toast.success(t("forms.sign_out.success_message"))
        },
      },
    })
  }

  return <button type="button" onMouseUp={handleSignOut} {...props} />
}
