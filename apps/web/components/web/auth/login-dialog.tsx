import { useTranslations } from "next-intl"
import type { Dispatch, SetStateAction } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import { Login } from "~/components/web/auth/login"
import { useSession } from "~/lib/auth-client"

type LoginDialogProps = {
  description?: string
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

export const LoginDialog = ({ description, isOpen, setIsOpen }: LoginDialogProps) => {
  const t = useTranslations()
  const { data: session } = useSession()

  if (session?.user) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>{t("forms.sign_in.title")}</DialogTitle>

          <DialogDescription>
            <p>{description || t("forms.sign_in.description")}</p>
          </DialogDescription>
        </DialogHeader>

        <Login />
      </DialogContent>
    </Dialog>
  )
}
