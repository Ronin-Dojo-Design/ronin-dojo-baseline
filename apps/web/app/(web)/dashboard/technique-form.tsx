"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { z } from "zod"
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

type FormValues = z.infer<typeof formSchema>

type Discipline = { id: string; name: string }

type TechniqueFormProps = {
  organizationId: string
  disciplines: Discipline[]
  technique?: {
    id: string
    name: string
    slug: string
    description: string | null
    disciplineId: string
    position: string | null
    category: string | null
    difficultyLevel: string | null
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

export function TechniqueForm({ organizationId, disciplines, technique }: TechniqueFormProps) {
  const router = useRouter()
  const isEdit = !!technique

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: technique?.name ?? "",
      slug: technique?.slug ?? "",
      description: technique?.description ?? "",
      disciplineId: technique?.disciplineId ?? "",
      position: technique?.position ?? "",
      category: technique?.category ?? "",
      difficultyLevel: technique?.difficultyLevel ?? "",
      isGi: technique?.isGi ?? false,
      isFoundational: technique?.isFoundational ?? false,
      requiresPartner: technique?.requiresPartner ?? false,
      requiresEquipment: technique?.requiresEquipment ?? false,
      movementPattern: technique?.movementPattern ?? "",
      rangeBand: technique?.rangeBand ?? "",
      teachingCues: technique?.teachingCues?.join("\n") ?? "",
      commonErrors: technique?.commonErrors?.join("\n") ?? "",
      safetyNotes: technique?.safetyNotes ?? "",
      isPublished: technique?.isPublished ?? false,
    },
  })

  const { execute: executeCreate, isPending: isCreating } = useAction(createTechnique, {
    onSuccess: () => router.push("/app/profile"),
  })

  const { execute: executeUpdate, isPending: isUpdating } = useAction(updateTechnique, {
    onSuccess: () => router.push("/app/profile"),
  })

  const isPending = isCreating || isUpdating

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      position: values.position || undefined,
      category: values.category || undefined,
      difficultyLevel: values.difficultyLevel || undefined,
      teachingCues: values.teachingCues?.split("\n").filter(Boolean) ?? [],
      commonErrors: values.commonErrors?.split("\n").filter(Boolean) ?? [],
    }

    if (isEdit) {
      executeUpdate({ id: technique.id, organizationId, ...payload } as any)
    } else {
      executeCreate({ organizationId, ...payload } as any)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack size="lg" direction="column">
          <H4>{isEdit ? "Edit Technique" : "New Technique"}</H4>

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
                  <FormLabel>Published</FormLabel>
                </FormItem>
              )}
            />
          </Stack>

          <Stack size="sm" direction="row">
            <Button type="submit" isPending={isPending}>
              {isEdit ? "Save Changes" : "Create Technique"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </form>
    </Form>
  )
}
