import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import type { ChangeEvent } from "react"
import type { FieldPath, FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { fetchMedia, uploadMedia } from "~/server/web/actions/media"
import { createFileSchema } from "~/server/web/shared/schema"

type MediaActionConfig<T extends FieldValues> = {
  form: UseFormReturn<T>
  path: string
  fieldName: FieldPath<T>
  fetchType?: "favicon" | "screenshot"
  successMessage?: string
  errorMessage?: string
}

export const useMediaAction = <T extends FieldValues>({
  form,
  path,
  fieldName,
  fetchType,
  successMessage = "Media successfully uploaded. Please save to update.",
  errorMessage = "Failed to upload media. Please try again.",
}: MediaActionConfig<T>) => {
  const tSchema = useTranslations("schema")
  const schema = createFileSchema(tSchema)

  const fetch = useAction(fetchMedia, {
    onSuccess: ({ data }) => {
      toast.success(successMessage)
      form.setValue(fieldName, data as PathValue<T, Path<T>>)
    },

    onError: ({ error: { serverError } }) => {
      serverError && toast.error(serverError)
    },
  })

  const upload = useAction(uploadMedia, {
    onSuccess: ({ data }) => {
      form.clearErrors(fieldName)
      form.resetField(fieldName)
      form.setValue(fieldName, data as PathValue<T, Path<T>>)
      toast.success(successMessage)
    },

    onError: ({ error: { serverError, validationErrors } }) => {
      const message = validationErrors?.file?._errors?.[0] ?? errorMessage
      serverError && toast.error(serverError)
      form.setError(fieldName, { message })
    },
  })

  const handleFetch = async (url: string) => {
    fetch.execute({ url, type: fetchType, path })
  }

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const { data, error } = schema.safeParse(file)

    if (error) {
      const message = JSON.parse(error.message)[0]?.message ?? errorMessage
      form.setError(fieldName, { message })
      return
    }

    form.clearErrors(fieldName)

    upload.execute({ path, file: data })
  }

  return {
    fetch,
    upload,
    handleFetch,
    handleUpload,
    isPending: fetch.isPending || upload.isPending,
  }
}
