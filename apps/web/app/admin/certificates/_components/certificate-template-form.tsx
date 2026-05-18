"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { Brand, CertificateDeliveryMethod, CertificationType } from "~/.generated/prisma/browser"
import { Button } from "~/components/common/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { H3 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { Switch } from "~/components/common/switch"
import { TextArea } from "~/components/common/textarea"
import { upsertCertificateTemplate } from "~/server/admin/certificates/actions"
import type { findCertificateTemplateById } from "~/server/admin/certificates/queries"
import { certificateTemplateSchema } from "~/server/admin/certificates/schema"

type CertificateTemplateFormProps = ComponentProps<"form"> & {
  template?: NonNullable<Awaited<ReturnType<typeof findCertificateTemplateById>>>
  title?: string
}

export function CertificateTemplateForm({
  children,
  className,
  title,
  template,
  ...props
}: CertificateTemplateFormProps) {
  const router = useRouter()
  const resolver = zodResolver(certificateTemplateSchema)

  const { form, action } = useHookFormAction(upsertCertificateTemplate, resolver, {
    formProps: {
      defaultValues: {
        id: template?.id ?? "",
        brand: template?.brand ?? Brand.BASELINE_MARTIAL_ARTS,
        name: template?.name ?? "",
        type: template?.type ?? CertificationType.BELT_RANK,
        deliveryMethod: template?.deliveryMethod ?? CertificateDeliveryMethod.DIGITAL,
        description: template?.description ?? "",
        backgroundUrl: template?.backgroundUrl ?? "",
        priceCents: template?.priceCents ?? 0,
        currency: template?.currency ?? "USD",
        isActive: template?.isActive ?? true,
        organizationId: template?.organizationId ?? "",
      },
    },
    actionProps: {
      onSuccess: ({ data }) => {
        if (data) {
          toast.success(template ? "Template updated" : "Template created")
          router.push(`/admin/certificates/${data.id}`)
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Something went wrong")
      },
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(action.execute)} className="space-y-6" {...props}>
        <Stack direction="column" size="md">
          {title && <H3>{title}</H3>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Blue Belt Certificate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(Brand).map(b => (
                        <SelectItem key={b} value={b}>
                          {b.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certification Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CertificationType).map(ct => (
                        <SelectItem key={ct} value={ct}>
                          {ct.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CertificateDeliveryMethod).map(dm => (
                        <SelectItem key={dm} value={dm}>
                          {dm.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priceCents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (cents)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <TextArea placeholder="Template description..." rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="backgroundUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization ID (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Organization ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>Active</FormLabel>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="primary"
            className="self-start"
            isPending={action.isPending}
          >
            {template ? "Update template" : "Create template"}
          </Button>
        </Stack>
      </form>
    </Form>
  )
}
