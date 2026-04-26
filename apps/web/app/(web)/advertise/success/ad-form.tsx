"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { Input } from "~/components/common/input"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { cx } from "~/lib/utils"
import { createAdFromCheckout } from "~/server/web/ads/actions"
import type { AdOne } from "~/server/web/ads/payloads"
import { createAdDetailsSchema } from "~/server/web/shared/schema"

type AdFormProps = ComponentProps<"form"> & {
  sessionId: string
  ad?: AdOne | null
}

export const AdForm = ({ className, sessionId, ad, ...props }: AdFormProps) => {
  const t = useTranslations("forms.ad_details")
  const tSchema = useTranslations("schema")

  const formAction = createAdFromCheckout
  const schema = createAdDetailsSchema(tSchema)
  const resolver = zodResolver(schema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(formAction, resolver, {
    formProps: {
      defaultValues: {
        sessionId,
        name: ad?.name ?? "",
        websiteUrl: ad?.websiteUrl ?? "",
        description: ad?.description ?? "",
        buttonLabel: ad?.buttonLabel ?? "",
      },
    },

    actionProps: {
      onSuccess: () => {
        toast.success(t(`${ad ? "update" : "create"}.success_message`))
      },

      onError: ({ error }) => {
        toast.error(error.serverError)
      },
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmitWithAction}
        className={cx("grid w-full gap-5 @md:grid-cols-2", className)}
        noValidate
        {...props}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{t("name_label")}</FormLabel>
              <FormControl>
                <Input type="text" size="lg" placeholder={t("name_placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{t("website_url_label")}</FormLabel>
              <FormControl>
                <Input type="url" size="lg" placeholder={t("website_url_placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <Stack className="w-full justify-between">
                <FormLabel isRequired>{t("description_label")}</FormLabel>
                <Note className="text-xs">{t("description_note")}</Note>
              </Stack>
              <FormControl>
                <TextArea size="lg" placeholder={t("description_placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="buttonLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("button_label")}</FormLabel>
              <FormControl>
                <Input type="text" size="lg" placeholder={t("button_placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="col-span-full" isPending={action.isPending}>
          {t(`${ad ? "update" : "create"}.button_label`)}
        </Button>
      </form>
    </Form>
  )
}
