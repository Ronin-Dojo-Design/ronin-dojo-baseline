"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import { type ComponentProps, use, useMemo } from "react"
import { toast } from "sonner"
import { AffiliationRole } from "~/.generated/prisma/browser"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Button } from "~/components/common/button"
import { ComboboxSelector } from "~/components/common/combobox-selector"
import { DataSelect } from "~/components/common/data-select"
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
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"
import { createPerson } from "~/server/admin/users/actions"
import type { findAddPersonOptions } from "~/server/admin/users/queries"
import { createPersonSchema } from "~/server/admin/users/schema"

const AFFILIATION_ROLE_LABELS: Record<AffiliationRole, string> = {
  [AffiliationRole.TRAINS_AT]: "Trains at",
  [AffiliationRole.TEACHES_AT]: "Teaches at",
  [AffiliationRole.HEAD_INSTRUCTOR]: "Head instructor",
  [AffiliationRole.OWNER]: "Owner",
  [AffiliationRole.MEMBER]: "Member",
}

type PersonFormProps = ComponentProps<"form"> & {
  optionsPromise: ReturnType<typeof findAddPersonOptions>
}

/**
 * Admin "just add someone" form. One submit → placeholder User + Passport + stated RankAward +
 * optional Affiliation (lineage placement layered in SESSION_0358 TASK_02). Mirrors the
 * `/admin/tools/new` create idiom (react-hook-form + Zod + next-safe-action). Selects are
 * dynamically populated and id-aware (`DataSelect`) — no hardcoded ranks/orgs.
 */
export function PersonForm({ className, title, optionsPromise, ...props }: PersonFormProps) {
  const router = useRouter()
  const { disciplines, ranks, organizations, trees, treeMembers } = use(optionsPromise)
  const resolver = zodResolver(createPersonSchema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(createPerson, resolver, {
    formProps: {
      defaultValues: {
        name: "",
        displayName: "",
        email: "",
        disciplineId: "",
        rankId: "",
        organizationId: "",
        schoolName: "",
        affiliationRole: AffiliationRole.TRAINS_AT,
        treeId: "",
        parentMemberId: "",
      },
    },

    actionProps: {
      onSuccess: () => {
        toast.success("Person added")
        router.push("/admin/users")
      },

      onError: ({ error }) => {
        toast.error(error.serverError ?? "Could not add person")
      },
    },
  })

  const disciplineId = form.watch("disciplineId")

  // Discipline-scoped rank cascade (rank rows carry their disciplineId from the read-model).
  const rankOptions = useMemo(
    () =>
      ranks
        .filter(rank => rank.disciplineId === disciplineId)
        .map(rank => ({
          value: rank.id,
          label: rank.name,
          content: (
            <Stack size="sm">
              <BeltSwatch colorHex={rank.colorHex} />
              {rank.name}
            </Stack>
          ),
        })),
    [ranks, disciplineId],
  )

  // Lineage placement (optional) — parent options are scoped to the chosen tree.
  const treeId = form.watch("treeId")
  const parentOptions = useMemo(
    () =>
      treeMembers
        .filter(member => member.treeId === treeId)
        .map(member => ({ id: member.id, name: member.label })),
    [treeMembers, treeId],
  )

  return (
    <Form {...form}>
      <Stack className="justify-between">
        <H3 className="flex-1 truncate">{title}</H3>
      </Stack>

      <form
        onSubmit={handleSubmitWithAction}
        className={cx("grid gap-4 @lg:grid-cols-2", className)}
        noValidate
        {...props}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>Name</FormLabel>
              <FormControl>
                <Input data-1p-ignore {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input placeholder="Defaults to name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <Stack className="w-full justify-between">
                <FormLabel>Email</FormLabel>
                <Note className="text-xs">
                  Optional — a unique placeholder is generated for claimable people
                </Note>
              </Stack>
              <FormControl>
                <Input type="email" {...field} />
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
              <FormLabel isRequired>Discipline</FormLabel>
              <FormControl>
                <DataSelect
                  options={disciplines.map(discipline => ({
                    value: discipline.id,
                    label: discipline.name,
                  }))}
                  value={field.value}
                  onValueChange={value => {
                    field.onChange(value)
                    // Reset the rank when the discipline changes (rank list is discipline-scoped).
                    form.setValue("rankId", "")
                  }}
                  placeholder="Select discipline"
                  size="lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rankId"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>Rank</FormLabel>
              <FormControl>
                <DataSelect
                  options={rankOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={disciplineId ? "Select rank" : "Select a discipline first"}
                  disabled={!disciplineId}
                  size="lg"
                />
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
              <FormLabel>School / organization</FormLabel>
              <FormControl>
                <ComboboxSelector
                  options={organizations}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select organization"
                  searchPlaceholder="Search organizations..."
                  emptyMessage="No organizations found."
                  clearable
                  size="lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="schoolName"
          render={({ field }) => (
            <FormItem>
              <Stack className="w-full justify-between">
                <FormLabel>School name (free text)</FormLabel>
                <Note className="text-xs">If not in the list</Note>
              </Stack>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="affiliationRole"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Affiliation role</FormLabel>
              <FormControl>
                <DataSelect
                  options={Object.values(AffiliationRole).map(role => ({
                    value: role,
                    label: AFFILIATION_ROLE_LABELS[role],
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select role"
                  size="lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="col-span-full rounded-md border bg-card p-4 grid gap-4 @lg:grid-cols-2">
          <div className="col-span-full">
            <FormLabel>Lineage placement (optional)</FormLabel>
            <Note className="text-xs">
              Placing this person on a tree is what makes them appear on the lineage canvas and the
              Top Ranked rail. Leave blank to add a claimable person without placement.
            </Note>
          </div>

          <FormField
            control={form.control}
            name="treeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lineage tree</FormLabel>
                <FormControl>
                  <DataSelect
                    options={trees.map(tree => ({ value: tree.id, label: tree.name }))}
                    value={field.value}
                    onValueChange={value => {
                      field.onChange(value)
                      // Reset the parent when the tree changes (parents are tree-scoped).
                      form.setValue("parentMemberId", "")
                    }}
                    placeholder="No placement"
                    size="lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentMemberId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promoted by / under (parent)</FormLabel>
                <FormControl>
                  <ComboboxSelector
                    options={parentOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={treeId ? "Select parent (optional)" : "Select a tree first"}
                    searchPlaceholder="Search members..."
                    emptyMessage="No members in this tree."
                    clearable
                    size="lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between gap-4 col-span-full">
          <Button size="md" variant="secondary" render={<Link href="/admin/users" />}>
            Cancel
          </Button>

          <Button type="submit" size="md" isPending={action.isPending}>
            Add person
          </Button>
        </div>
      </form>
    </Form>
  )
}
