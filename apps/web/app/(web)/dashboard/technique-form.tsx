"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { slugify } from "~/lib/slug"
import { Button } from "~/components/common/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { H4 } from "~/components/common/heading"
import { Hint } from "~/components/common/hint"
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
import { createTechnique, updateTechnique } from "~/server/web/techniques/crud-actions"

const categoryOptions = [
  "STRIKE",
  "KICK",
  "THROW",
  "SUBMISSION",
  "SWEEP",
  "ESCAPE",
  "BLOCK",
  "FORM",
  "DRILL",
  "CONDITIONING",
  "TRANSITION",
  "TAKEDOWN",
] as const

const positionOptions = [
  "STANDING",
  "GUARD",
  "HALF_GUARD",
  "MOUNT",
  "SIDE_CONTROL",
  "BACK",
  "TURTLE",
  "CLINCH",
  "OPEN",
] as const

const difficultyOptions = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Lowercase alphanumeric with dashes"),
  description: z.string().max(5000).optional(),
  disciplineId: z.string().min(1, "Discipline is required"),
  position: z.string().optional(),
  category: z.string().optional(),
  difficultyLevel: z.string().optional(),
  beltLevelMinId: z.string().optional(),
  isGi: z.boolean().optional(),
  isFoundational: z.boolean().optional(),
  requiresPartner: z.boolean().optional(),
  requiresEquipment: z.boolean().optional(),
  movementPattern: z.string().max(200).optional(),
  rangeBand: z.string().max(200).optional(),
  teachingCues: z.string().optional(),
  commonErrors: z.string().optional(),
  safetyNotes: z.string().max(2000).optional(),
  isPublished: z.boolean().optional(),
})

// Authored mode auto-derives + HIDES the slug (a member shouldn't hand-edit a URL slug), so a name
// that slugifies to "" (e.g. all-non-ASCII: 巴投 / армбар / गार्ड) would fail the hidden slug field's
// regex → `handleSubmit` never fires → a silent no-op (WL-P2-52 regression, same class as the
// SESSION_0529 P1). Surface it on the VISIBLE Name field instead. Org/admin mode shows the slug
// field, so its own regex already gives visible feedback there — this refine is authored-only.
// (i18n follow-up: a server-side fallback slug so non-Latin names can be authored — ledgered, not here.)
const authoredFormSchema = formSchema.extend({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200)
    .refine(value => slugify(value).length > 0, "Name must include at least one letter or number"),
})

type FormValues = z.infer<typeof formSchema>

type Discipline = { id: string; name: string }
type Belt = { id: string; name: string; shortName: string | null }

type TechniqueFormProps = {
  /** Org-canonical mode (`/app/techniques/new` + `[id]`) — OWNER/INSTRUCTOR school library rows. */
  organizationId?: string
  /**
   * Authored mode (SESSION_0529 Slice 3B, ADR 0046 D5): submits `authored: true` and NO
   * `organizationId` — the capability-gated action sets `authorPassportId` from the session's own
   * Passport and derives the school from the caller's current Affiliation server-side.
   */
  authored?: boolean
  /** Overrides the default post-create redirect (the sheet advances to its media step). */
  onSuccess?: (technique: { id: string; name: string; slug: string }) => void
  /** Overrides the default Cancel behavior (`router.back()`) — the sheet closes itself. */
  onCancel?: () => void
  disciplines: Discipline[]
  belts: Belt[]
  technique?: {
    id: string
    name: string
    slug: string
    description: string | null
    disciplineId: string
    position: string | null
    category: string | null
    difficultyLevel: string | null
    beltLevelMinId: string | null
    isGi: boolean | null
    isFoundational: boolean
    requiresPartner: boolean
    requiresEquipment: boolean
    movementPattern: string | null
    rangeBand: string | null
    teachingCues: string[]
    commonErrors: string[]
    safetyNotes: string | null
    isPublished: boolean
  }
}

export function TechniqueForm({
  organizationId,
  authored,
  onSuccess,
  onCancel,
  disciplines,
  belts,
  technique,
}: TechniqueFormProps) {
  const router = useRouter()
  const isEdit = !!technique

  const form = useForm<FormValues>({
    resolver: zodResolver(authored ? authoredFormSchema : formSchema),
    defaultValues: {
      name: technique?.name ?? "",
      slug: technique?.slug ?? "",
      description: technique?.description ?? "",
      disciplineId: technique?.disciplineId ?? "",
      position: technique?.position ?? "",
      category: technique?.category ?? "",
      difficultyLevel: technique?.difficultyLevel ?? "",
      beltLevelMinId: technique?.beltLevelMinId ?? "",
      isGi: technique?.isGi ?? false,
      isFoundational: technique?.isFoundational ?? false,
      requiresPartner: technique?.requiresPartner ?? false,
      requiresEquipment: technique?.requiresEquipment ?? false,
      movementPattern: technique?.movementPattern ?? "",
      rangeBand: technique?.rangeBand ?? "",
      teachingCues: technique?.teachingCues?.join("\n") ?? "",
      commonErrors: technique?.commonErrors?.join("\n") ?? "",
      safetyNotes: technique?.safetyNotes ?? "",
      // SESSION_0529 Desi P1 — AUTHORED creates publish by default: the flagship member flow
      // otherwise stranded a draft behind a 404 link (the profile watch read is published-only and
      // no author-facing publish UI exists yet). Org-canonical mode keeps its draft-first default.
      isPublished: technique?.isPublished ?? (authored ? true : false),
    },
  })

  // Authored mode (the profile create sheet) hides the raw slug field — a member shouldn't
  // hand-edit a URL slug — and derives it from the name. Create-only: authored edit isn't reachable
  // (the `[id]` editor renders org mode), and gating on `!isEdit` also guards against silently
  // re-slugging an existing row's URL if that ever changes. Org/admin mode keeps the editable slug.
  const nameValue = form.watch("name")
  useEffect(() => {
    if (!authored || isEdit) return
    form.setValue("slug", slugify(nameValue))
  }, [authored, isEdit, nameValue, form])

  // Surface server errors (e.g. the friendly authored duplicate-slug P2002 message,
  // SESSION_0529 Slice 3B) — previously failures were silent.
  const onError = ({ error }: { error: { serverError?: string } }) => {
    toast.error(error.serverError ?? "Failed to save the technique.")
  }

  const { execute: executeCreate, isPending: isCreating } = useAction(createTechnique, {
    onSuccess: ({ data }) => {
      // The sheet flow (authored mode) advances in place instead of navigating away.
      if (onSuccess && data) {
        onSuccess({ id: data.id, name: data.name, slug: data.slug })
        return
      }
      router.push("/app/profile")
    },
    onError,
  })

  const { execute: executeUpdate, isPending: isUpdating } = useAction(updateTechnique, {
    onSuccess: () => router.push("/app/profile"),
    onError,
  })

  const isPending = isCreating || isUpdating

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      position: values.position || undefined,
      category: values.category || undefined,
      difficultyLevel: values.difficultyLevel || undefined,
      beltLevelMinId: values.beltLevelMinId || undefined,
      teachingCues: values.teachingCues?.split("\n").filter(Boolean) ?? [],
      commonErrors: values.commonErrors?.split("\n").filter(Boolean) ?? [],
    }

    if (isEdit) {
      executeUpdate({ id: technique.id, organizationId, ...payload } as any)
    } else if (authored) {
      // Authored path: `authored: true`, NO organizationId — the server derives the school.
      executeCreate({ authored: true, ...payload } as any)
    } else {
      executeCreate({ organizationId, ...payload } as any)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack size="lg" direction="column">
          {/* Authored mode is embedded in the create sheet, which supplies its own DrawerTitle —
              rendering this H4 too stacked two headings (WL-P2-52). Org/admin mode keeps it. */}
          {!authored && <H4>{isEdit ? "Edit Technique" : "New Technique"}</H4>}

          <Stack size="md" direction="column">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Arm Bar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Authored mode derives the slug from the name (see the effect above) and hides this
                field — a member shouldn't hand-edit a URL slug. Org/admin mode keeps it editable. */}
            {!authored && (
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="arm-bar" {...field} />
                    </FormControl>
                    <Hint>URL-friendly identifier (lowercase, dashes)</Hint>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <TextArea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="disciplineId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discipline</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    items={Object.fromEntries(disciplines.map(d => [d.id, d.name]))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select discipline" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {disciplines.map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Stack size="md" direction="row" className="flex-wrap">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-40">
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={Object.fromEntries(
                        categoryOptions.map(v => [v, v.replace(/_/g, " ")]),
                      )}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map(v => (
                          <SelectItem key={v} value={v}>
                            {v.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-40">
                    <FormLabel>Position</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={Object.fromEntries(
                        positionOptions.map(v => [v, v.replace(/_/g, " ")]),
                      )}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positionOptions.map(v => (
                          <SelectItem key={v} value={v}>
                            {v.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficultyLevel"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-40">
                    <FormLabel>Difficulty</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {difficultyOptions.map(v => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="beltLevelMinId"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-40">
                    <FormLabel>Belt</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={Object.fromEntries(belts.map(b => [b.id, b.name]))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select belt" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {belts.map(b => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </Stack>

            <Stack size="md" direction="row" className="flex-wrap">
              <FormField
                control={form.control}
                name="isGi"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Gi technique</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFoundational"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Foundational</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiresPartner"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Requires partner</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiresEquipment"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Requires equipment</FormLabel>
                  </FormItem>
                )}
              />
            </Stack>

            <FormField
              control={form.control}
              name="teachingCues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teaching Cues</FormLabel>
                  <FormControl>
                    <TextArea rows={3} placeholder="One cue per line" {...field} />
                  </FormControl>
                  <Hint>Enter one teaching cue per line</Hint>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commonErrors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Errors</FormLabel>
                  <FormControl>
                    <TextArea rows={3} placeholder="One error per line" {...field} />
                  </FormControl>
                  <Hint>Enter one common error per line</Hint>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="safetyNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Safety Notes</FormLabel>
                  <FormControl>
                    <TextArea rows={2} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  {/* Authored mode speaks member language (Desi P1) — the flag drives the public
                      profile curriculum + watch page, not an org "publish" workflow. */}
                  <FormLabel>{authored ? "Show on my public profile" : "Published"}</FormLabel>
                </FormItem>
              )}
            />
          </Stack>

          <Stack size="sm" direction="row">
            <Button type="submit" isPending={isPending}>
              {isEdit ? "Save Changes" : "Create Technique"}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel ?? (() => router.back())}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </form>
    </Form>
  )
}
