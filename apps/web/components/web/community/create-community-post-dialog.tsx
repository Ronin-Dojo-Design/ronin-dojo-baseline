"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { ImageUpIcon, LockKeyholeIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { type Dispatch, type SetStateAction, useRef } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { DataSelect } from "~/components/common/data-select"
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
import { Hint } from "~/components/common/hint"
import { Input } from "~/components/common/input"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { LoginDialog } from "~/components/web/auth/login-dialog"
import { COMMUNITY_POST_TYPES } from "~/components/web/community/post-type"
import { useSession } from "~/lib/auth-client"
import { createCommunityPost, uploadCommunityPostImage } from "~/server/web/community/actions"
import { communityPostImageSchema, createCommunityPostSchema } from "~/server/web/community/schema"

/**
 * CreateCommunityPostDialog — the member "New post" modal (SESSION_0493). Follows the
 * `ToolReportDialog` idiom exactly: signed-out viewers get the `LoginDialog` (funnel-first), signed-in
 * members get the gold-standard `useHookFormAction` + `Form`/`FormField` dialog form. Optional image
 * goes through the member-safe `uploadCommunityPostImage` action (rate-limited + byte-sniffed) —
 * NOT the entitlement-gated admin media seam.
 *
 * FI-028 (participation ladder: Free = READ · Premium = CREATE): the dialog now has THREE states —
 * signed-out → `LoginDialog` (funnel-first); signed-in but not CREATE-capable → an upgrade CTA (the
 * server-resolved `canCreate` prop is false); CREATE-capable → the full form. The dialog is a client
 * component and cannot resolve entitlement itself, so `canCreate` MUST be threaded in as a prop
 * (mirrors the logged-out→`LoginDialog` swap). The entry points (button / FAB / MAB) stay VISIBLE
 * for free members — only the dialog body swaps to the upgrade CTA.
 */

/** Title input cap — mirrored into the remaining-characters hint (C1-7). */
const TITLE_MAX_LENGTH = 100

/** The paid-tier upgrade funnel — the same route the profile/technique upgrade CTAs link to. */
const UPGRADE_HREF = "/lineage/join"

type CreateCommunityPostDialogProps = {
  styles: { id: string; name: string }[]
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  /**
   * FI-028 server-resolved CREATE gate (`canCreateCommunityPostForUser`). A signed-in member who
   * FAILS it gets the upgrade CTA instead of the form. Required — the client can't resolve it.
   */
  canCreate: boolean
}

export const CreateCommunityPostDialog = ({
  styles,
  isOpen,
  setIsOpen,
  canCreate,
}: CreateCommunityPostDialogProps) => {
  const t = useTranslations("community")
  const router = useRouter()
  const { data: session } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    createCommunityPost,
    zodResolver(createCommunityPostSchema),
    {
      formProps: {
        defaultValues: {
          type: "TECHNIQUE",
          title: "",
          content: "",
          videoUrl: "",
          imageUrl: "",
          styleId: "",
        },
      },

      actionProps: {
        onSuccess: ({ data }) => {
          toast.success(t("create_success"))
          setIsOpen(false)
          form.reset()
          if (data?.slug) {
            router.push(`/posts/${data.slug}`)
          }
        },

        onError: ({ error }) => {
          toast.error(error.serverError ?? t("create_failed"))
        },
      },
    },
  )

  const upload = useAction(uploadCommunityPostImage, {
    onSuccess: ({ data }) => {
      if (data?.url) {
        form.setValue("imageUrl", data.url)
        form.clearErrors("imageUrl")
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? t("image_upload_failed"))
    },
  })

  const handlePickImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const parsed = communityPostImageSchema.safeParse({ file })
    if (parsed.error) {
      form.setError("imageUrl", {
        message: parsed.error.issues[0]?.message ?? t("image_upload_failed"),
      })
      return
    }

    form.clearErrors("imageUrl")
    upload.execute({ file: parsed.data.file })
  }

  const clearImage = () => {
    form.setValue("imageUrl", "")
    form.clearErrors("imageUrl")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const imageUrl = form.watch("imageUrl")
  const title = form.watch("title")

  if (!session?.user) {
    return <LoginDialog isOpen={isOpen} setIsOpen={setIsOpen} />
  }

  // FI-028: signed in, but not CREATE-capable (a free member) → swap the form for an upgrade CTA.
  // The entry point that opened this dialog stays visible; only the body changes (mirrors the
  // logged-out→LoginDialog swap above).
  if (!canCreate) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("upgrade_title")}</DialogTitle>
            <DialogDescription>{t("upgrade_description")}</DialogDescription>
          </DialogHeader>

          <Note>{t("upgrade_body")}</Note>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
              {t("cancel_button")}
            </Button>
            <Button prefix={<LockKeyholeIcon />} render={<Link href={UPGRADE_HREF} />}>
              {t("upgrade_cta")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const typeOptions = COMMUNITY_POST_TYPES.map(meta => ({
    value: meta.type,
    label: t(meta.labelKey),
  }))

  const styleOptions = [
    { value: "", label: t("style_none") },
    ...styles.map(style => ({ value: style.id, label: style.name })),
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("create_title")}</DialogTitle>
          <DialogDescription>{t("create_description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmitWithAction} className="grid gap-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel isRequired>{t("type_label")}</FormLabel>
                    <FormControl>
                      <DataSelect
                        options={typeOptions}
                        value={value}
                        onValueChange={onChange}
                        placeholder={t("type_placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="styleId"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel>{t("style_label")}</FormLabel>
                    <FormControl>
                      <DataSelect
                        options={styleOptions}
                        value={value ?? ""}
                        onValueChange={onChange}
                        placeholder={t("style_none")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{t("title_label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("title_placeholder")}
                      maxLength={TITLE_MAX_LENGTH}
                      {...field}
                    />
                  </FormControl>
                  {/* C1-7: `maxLength` silently swallowed keystrokes at the cap — surface how many
                      characters remain so it's a visible limit, not a mystery. */}
                  <Hint>
                    {t("title_hint", { remaining: TITLE_MAX_LENGTH - (title?.length ?? 0) })}
                  </Hint>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{t("content_label")}</FormLabel>
                  <FormControl>
                    <TextArea
                      placeholder={t("content_placeholder")}
                      className="min-h-32"
                      maxLength={2000}
                      {...field}
                    />
                  </FormControl>
                  <Hint>{t("content_hint")}</Hint>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("video_label")}</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      inputMode="url"
                      placeholder={t("video_placeholder")}
                      {...field}
                    />
                  </FormControl>
                  {/* C1-6: only YouTube/Vimeo embed inline (`toVideoEmbedUrl`); everything else
                      degrades to a link out — set that expectation, like content/image do. */}
                  <Hint>{t("video_hint")}</Hint>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={() => (
                <FormItem>
                  <FormLabel>{t("image_label")}</FormLabel>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handlePickImage}
                    className="hidden"
                    aria-label={t("image_label")}
                  />

                  {imageUrl ? (
                    <Stack size="sm" wrap={false} className="w-full">
                      {/* Fresh-upload preview. Plain img (the evidence-uploader precedent): the
                          just-uploaded URL may be local MinIO in dev, outside next/image's
                          remotePatterns. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={t("image_preview_alt")}
                        className="aspect-video w-24 shrink-0 rounded-md object-cover"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        prefix={<XIcon />}
                        onClick={clearImage}
                      >
                        {t("image_remove")}
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      prefix={<ImageUpIcon />}
                      isPending={upload.isPending}
                      onClick={() => fileInputRef.current?.click()}
                      className="self-start"
                    >
                      {t("image_upload")}
                    </Button>
                  )}

                  <Hint>{t("image_hint")}</Hint>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                {t("cancel_button")}
              </Button>

              <Button
                type="submit"
                className="min-w-28"
                isPending={action.isPending || upload.isPending}
              >
                {t("post_button")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
