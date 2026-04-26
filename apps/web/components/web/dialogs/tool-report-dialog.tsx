import { zodResolver } from "@hookform/resolvers/zod"
import { useHotkeys } from "@mantine/hooks"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useTranslations } from "next-intl"
import type { Dispatch, SetStateAction } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { Input } from "~/components/common/input"
import { RadioGroup, RadioGroupItem } from "~/components/common/radio-group"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { LoginDialog } from "~/components/web/auth/login-dialog"
import { reportsConfig } from "~/config/reports"
import { useSession } from "~/lib/auth-client"
import { reportTool } from "~/server/web/actions/report"
import { createReportToolSchema } from "~/server/web/shared/schema"
import type { ToolOne } from "~/server/web/tools/payloads"

type ToolReportDialogProps = {
  tool: ToolOne
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

export const ToolReportDialog = ({ tool, isOpen, setIsOpen }: ToolReportDialogProps) => {
  const { data: session } = useSession()
  const t = useTranslations("dialogs.report")
  const tSchema = useTranslations("schema")

  const schema = createReportToolSchema(tSchema)
  const resolver = zodResolver(schema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(reportTool, resolver, {
    formProps: {
      values: {
        type: "",
        message: "",
        toolId: tool.id,
        email: session?.user.email || "",
      },
    },

    actionProps: {
      onSuccess: () => {
        toast.success(t("success_message"))
        setIsOpen(false)
        form.reset()
      },

      onError: ({ error }) => {
        toast.error(error.serverError)
      },
    },
  })

  // A hotkey to submit the form
  useHotkeys([["mod+enter", () => handleSubmitWithAction()]], [], true)

  if (!reportsConfig.enabled) {
    return null
  }

  if (reportsConfig.requireSignIn && !session?.user) {
    return <LoginDialog isOpen={isOpen} setIsOpen={setIsOpen} />
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("title", { toolName: tool.name })}</DialogTitle>
          <DialogDescription>{t("question")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmitWithAction} className="grid gap-4" noValidate>
            {!session?.user && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{t("email_label")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("email_placeholder")}
                        data-1p-ignore
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="type"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel isRequired>{t("type_label")}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={value}
                      onValueChange={onChange}
                      className="flex flex-col items-start gap-2.5"
                      {...field}
                    >
                      {reportsConfig.reportTypes.map(type => (
                        <Stack key={type} size="sm" wrap={false} asChild>
                          <FormLabel
                            htmlFor={undefined}
                            className="font-normal text-secondary-foreground overflow-visible cursor-pointer"
                          >
                            <RadioGroupItem value={type} />
                            {type}
                          </FormLabel>
                        </Stack>
                      ))}
                    </RadioGroup>
                  </FormControl>

                  <FormMessage className="mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("message_label")}</FormLabel>
                  <FormControl>
                    <TextArea
                      placeholder={t("message_placeholder")}
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                {t("cancel_button")}
              </Button>

              <Button type="submit" className="min-w-28" isPending={action.isPending}>
                {t("send_button")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
