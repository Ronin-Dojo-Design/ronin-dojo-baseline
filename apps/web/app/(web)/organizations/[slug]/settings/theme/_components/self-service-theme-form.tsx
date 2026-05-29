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
import { Input } from "~/components/common/input"
import { Stack } from "~/components/common/stack"
import type { findOrgSettings } from "~/server/admin/org-settings/queries"
import { updateOrgThemeSelfService } from "~/server/web/organization/theme-actions"

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

type SelfServiceThemeFormProps = ComponentProps<"form"> & {
  organizationId: string
  organizationName: string
  settings: Awaited<ReturnType<typeof findOrgSettings>>
}

export function SelfServiceThemeForm({
  organizationId,
  organizationName,
  settings,
  className,
  ...props
}: SelfServiceThemeFormProps) {
  const resolver = zodResolver(orgThemeFormSchema)

  const { form, handleSubmitWithAction } = useHookFormAction(updateOrgThemeSelfService, resolver, {
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
        if (error.serverError?.includes("ACCESS_DENIED")) {
          toast.error("You don't have permission to edit this org's theme")
        } else {
          toast.error(error.serverError ?? "Failed to save theme")
        }
      },
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className={className} {...props}>
        <Stack size="lg">
          {/* Color preview */}
          <Stack direction="row" size="sm">
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
          </Stack>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Color</FormLabel>
                  <FormControl>
                    <Input placeholder="234 98% 61% (inherits from brand if empty)" {...field} />
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
                    <Input placeholder="0 0% 98% (inherits from brand if empty)" {...field} />
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
                    <Input placeholder="170 80% 40% (inherits from brand if empty)" {...field} />
                  </FormControl>
                  <FormDescription>HSL values for accent elements</FormDescription>
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
                    <Input placeholder="0 0% 98% (inherits from brand if empty)" {...field} />
                  </FormControl>
                  <FormDescription>Text color on accent background</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://... (inherits from brand if empty)" {...field} />
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
                    <Input placeholder="https://... (inherits from brand if empty)" {...field} />
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
                    <Input placeholder="https://... (inherits from brand if empty)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : "Save Theme"}
          </Button>
        </Stack>
      </form>
    </Form>
  )
}
