"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { z } from "zod/v4"
import { Button } from "~/components/common/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { H3 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import { Stack } from "~/components/common/stack"
import { upsertBrandSettings } from "~/server/admin/brand-settings/actions"
import type { findBrandSettings } from "~/server/admin/brand-settings/queries"

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
  brand: string
  brandLabel: string
  settings: Awaited<ReturnType<typeof findBrandSettings>>
}

export function BrandSettingsForm({
  brand,
  brandLabel,
  settings,
  className,
  ...props
}: BrandSettingsFormProps) {
  const resolver = zodResolver(brandSettingsFormSchema)

  const { form, handleSubmitWithAction } = useHookFormAction(upsertBrandSettings, resolver, {
    formProps: {
      defaultValues: {
        brand: brand as any,
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
        toast.success(`${brandLabel} settings saved`)
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
          <H3>{brandLabel}</H3>

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

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Color</FormLabel>
                  <FormControl>
                    <Input placeholder="234 98% 61%" {...field} />
                  </FormControl>
                  <FormDescription>HSL values without hsl() wrapper</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primaryFgColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Foreground</FormLabel>
                  <FormControl>
                    <Input placeholder="0 0% 98%" {...field} />
                  </FormControl>
                  <FormDescription>Text color on primary background</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accentColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accent Color</FormLabel>
                  <FormControl>
                    <Input placeholder="0 0% 96%" {...field} />
                  </FormControl>
                  <FormDescription>Secondary highlight color</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accentFgColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accent Foreground</FormLabel>
                  <FormControl>
                    <Input placeholder="0 0% 9%" {...field} />
                  </FormControl>
                  <FormDescription>Text color on accent background</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="/images/brands/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="faviconUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favicon URL</FormLabel>
                  <FormControl>
                    <Input placeholder="/images/brands/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ogImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OG Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="/images/brands/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
