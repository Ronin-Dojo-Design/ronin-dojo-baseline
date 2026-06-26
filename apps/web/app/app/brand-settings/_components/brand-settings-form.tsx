"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { z } from "zod/v4"
import { Button } from "~/components/common/button"
import { Form } from "~/components/common/form"
import { H3 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { ThemeFieldset } from "~/components/web/forms/theme-fieldset"
import { upsertBrandSettings } from "~/server/admin/brand-settings/actions"
import type { findBrandSettings } from "~/server/admin/brand-settings/queries"

// Single-brand collapse (SESSION_0447): BBL is the only brand. The `brand` field
// keeps the action's enum contract (narrowed at Stage-2 with the schema drop) but
// is fixed to BBL — the editor only ever writes the one row.
const BBL_LABEL = "Black Belt Legacy"

const brandSettingsFormSchema = z.object({
  brand: z.enum(["BASELINE_MARTIAL_ARTS", "RONIN_DOJO_DESIGN", "BBL", "WEKAF"]),
  primaryColor: z.string().default(""),
  primaryFgColor: z.string().default(""),
  accentColor: z.string().default(""),
  accentFgColor: z.string().default(""),
  logoUrl: z.string().default(""),
  faviconUrl: z.string().default(""),
  ogImageUrl: z.string().default(""),
})

type BrandSettingsFormProps = ComponentProps<"form"> & {
  settings: Awaited<ReturnType<typeof findBrandSettings>>
}

export function BrandSettingsForm({ settings, className, ...props }: BrandSettingsFormProps) {
  const resolver = zodResolver(brandSettingsFormSchema)

  const { form, handleSubmitWithAction } = useHookFormAction(upsertBrandSettings, resolver, {
    formProps: {
      defaultValues: {
        brand: "BBL",
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
        toast.success(`${BBL_LABEL} settings saved`)
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Failed to save settings")
      },
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className={className} {...props}>
        <div className="space-y-6">
          <H3>{BBL_LABEL}</H3>

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
              primaryColor: "234 98% 61%",
              primaryFgColor: "0 0% 98%",
              accentColor: "0 0% 96%",
              accentFgColor: "0 0% 9%",
              logoUrl: "/images/brands/...",
              faviconUrl: "/images/brands/...",
              ogImageUrl: "/images/brands/...",
            }}
            accentColorDescription="Secondary highlight color"
            imageGridCols="3"
          />

          <Stack>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : "Save Settings"}
            </Button>
          </Stack>
        </div>
      </form>
    </Form>
  )
}
