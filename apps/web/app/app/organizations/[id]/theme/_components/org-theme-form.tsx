"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { z } from "zod/v4"
import { Button } from "~/components/common/button"
import { Form } from "~/components/common/form"
import { Stack } from "~/components/common/stack"
import { ThemeFieldset } from "~/components/web/forms/theme-fieldset"
import { updateOrgTheme } from "~/server/admin/org-settings/actions"
import type { findOrgSettings } from "~/server/admin/org-settings/queries"

const orgThemeFormSchema = z.object({
  organizationId: z.string().min(1),
  primaryColor: z.string().default(""),
  primaryFgColor: z.string().default(""),
  accentColor: z.string().default(""),
  accentFgColor: z.string().default(""),
  logoUrl: z.string().default(""),
  faviconUrl: z.string().default(""),
  ogImageUrl: z.string().default(""),
})

type OrgThemeFormProps = ComponentProps<"form"> & {
  organizationId: string
  organizationName: string
  settings: Awaited<ReturnType<typeof findOrgSettings>>
}

export function OrgThemeForm({
  organizationId,
  organizationName,
  settings,
  className,
  ...props
}: OrgThemeFormProps) {
  const resolver = zodResolver(orgThemeFormSchema)

  const { form, handleSubmitWithAction } = useHookFormAction(updateOrgTheme, resolver, {
    formProps: {
      defaultValues: {
        organizationId,
        primaryColor: settings?.primaryColor ?? "",
        primaryFgColor: settings?.primaryFgColor ?? "",
        accentColor: settings?.accentColor ?? "",
        accentFgColor: settings?.accentFgColor ?? "",
        logoUrl: settings?.logoUrl ?? "",
        faviconUrl: settings?.faviconUrl ?? "",
        ogImageUrl: settings?.ogImageUrl ?? "",
      },
    },
    actionProps: {
      onSuccess: () => {
        toast.success(`${organizationName} theme saved`)
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Failed to save theme")
      },
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className={className} {...props}>
        <div className="space-y-6">
          {/* Color preview */}
          <div className="flex items-center gap-3">
            {form.watch("primaryColor") && (
              <div
                className="size-8 rounded-md border"
                style={{ backgroundColor: `hsl(${form.watch("primaryColor")})` }}
                title="Primary"
              />
            )}
            {form.watch("accentColor") && (
              <div
                className="size-8 rounded-md border"
                style={{ backgroundColor: `hsl(${form.watch("accentColor")})` }}
                title="Accent"
              />
            )}
          </div>

          <ThemeFieldset
            placeholders={{
              primaryColor: "234 98% 61% (inherits from brand if empty)",
              primaryFgColor: "0 0% 98% (inherits from brand if empty)",
              accentColor: "0 0% 96% (inherits from brand if empty)",
              accentFgColor: "0 0% 9% (inherits from brand if empty)",
              logoUrl: "/images/orgs/... (inherits if empty)",
              faviconUrl: "/images/orgs/... (inherits if empty)",
              ogImageUrl: "/images/orgs/... (inherits if empty)",
            }}
            accentColorDescription="Secondary highlight color"
            imageGridCols="3"
          />

          <Stack>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : "Save Theme"}
            </Button>
          </Stack>
        </div>
      </form>
    </Form>
  )
}
