"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { LightbulbIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
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
  DialogTrigger,
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
import { TextArea } from "~/components/common/textarea"
import { ImageFieldUploader } from "~/components/web/uploader/image-field-uploader"
import { createPlanningIntake } from "~/server/web/actions/planning-intake"
import { createPlanningIntakeSchema, PLANNING_INTAKE_MAX_IMAGES } from "~/server/web/shared/schema"

const CATEGORY_OPTIONS = [
  { value: "FEATURE", label: "Feature" },
  { value: "BUG", label: "Bug" },
  { value: "DESIGN", label: "Design" },
  { value: "NOTE", label: "Note" },
]

const emptyImageSlots = () => Array.from({ length: PLANNING_INTAKE_MAX_IMAGES }, () => null)

/**
 * FeatureWidget — the admins-only in-app front door to the planning ledger (SESSION_0592,
 * SESSION_0589 grill). A NEW sibling of `FeedbackWidget` (different audience/trigger/payload —
 * NOT an overload): a persistent trigger (always available, not engagement-gated), admin-only
 * idea-dump (text + up to {@link PLANNING_INTAKE_MAX_IMAGES} images + category) that writes to
 * the `PlanningIntake` DB inbox. Promotion into `planning-ledger.md` PL rows stays a deliberate
 * SESSION step — see `/app/planning-intake` (the triage view), never automated from here.
 *
 * Reuses the shared R2 seam end-to-end: each image slot is the existing `ImageFieldUploader`
 * (crop → `uploadMedia`), not a forked uploader.
 *
 * Mounted ONLY when `isAdmin(user)` server-side (`app/app/layout.tsx`) — this component has no
 * internal admin check by design, mirroring `FeedbackWidget`'s self-contained, prop-free shape.
 * Prop-free + no server-side data dependency keeps it a clean extraction candidate for
 * `packages/ui-kit` later (the MMB mount is a separate fast-follow, out of scope here).
 */
export function FeatureWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [imageSlots, setImageSlots] = useState<(string | null)[]>(emptyImageSlots)
  const tSchema = useTranslations("schema")
  const schema = createPlanningIntakeSchema(tSchema)
  const resolver = zodResolver(schema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    createPlanningIntake,
    resolver,
    {
      formProps: {
        defaultValues: {
          category: "FEATURE",
          body: "",
          imageUrls: [],
        },
      },

      actionProps: {
        onSuccess: () => {
          toast.success("Idea captured — triage it from Planning Intake.")
          form.reset()
          setImageSlots(emptyImageSlots())
          setIsOpen(false)
        },

        onError: ({ error }) => {
          toast.error(error.serverError ?? "Failed to save. Please try again later.")
        },
      },
    },
  )

  const updateSlot = (index: number, url: string | null) => {
    setImageSlots(prev => {
      const next = [...prev]
      next[index] = url
      form.setValue(
        "imageUrls",
        next.filter((value): value is string => value !== null),
      )
      return next
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            size="icon"
            variant="primary"
            className="fixed bottom-20 left-4 z-40 rounded-full shadow-lg md:bottom-4"
            aria-label="Capture a planning idea"
          />
        }
      >
        <LightbulbIcon />
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Capture an idea</DialogTitle>
          <DialogDescription>
            Feature, bug, design note, or anything else — this lands in the Planning Intake queue
            for triage, not directly on the ledger.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmitWithAction} className="grid gap-4" noValidate>
            <FormField
              control={form.control}
              name="category"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel isRequired>Category</FormLabel>
                  <FormControl>
                    <DataSelect options={CATEGORY_OPTIONS} value={value} onValueChange={onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>Details</FormLabel>
                  <FormControl>
                    <TextArea
                      placeholder="What's the idea?"
                      className="min-h-32"
                      maxLength={4000}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Images (optional)</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                {imageSlots.map((url, index) => (
                  <ImageFieldUploader
                    // Fixed-length slot array (never reordered/inserted) — index is a stable key.
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    value={url}
                    onChange={next => updateSlot(index, next)}
                    uploadPathPrefix="planning-intake"
                    presets={["free"]}
                    defaultPreset="free"
                    cropTitle="Crop screenshot"
                  />
                ))}
              </div>
              <Hint>Up to {PLANNING_INTAKE_MAX_IMAGES} screenshots.</Hint>
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isPending={action.isPending}>
                Capture idea
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
