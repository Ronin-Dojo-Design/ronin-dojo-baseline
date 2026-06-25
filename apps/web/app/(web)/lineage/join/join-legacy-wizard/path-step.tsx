import { CheckIcon, SparklesIcon } from "lucide-react"
import { FormControl, FormField, FormItem, FormMessage } from "~/components/common/form"
import { RadioGroup, RadioGroupItem } from "~/components/common/radio-group"
import { cx } from "~/lib/utils"
import { CompTierCard } from "./comp-tier-card"
import { goalLabels, pathCards } from "./constants"
import type { JoinLegacyFormValues } from "./schema"
import { StepShell } from "./step-shell"
import type { UseFormReturn } from "react-hook-form"

export function PathStep({
  active,
  form,
  compClaim = false,
  compIsLifetime = false,
  claimProfileName,
}: {
  active: boolean
  form: UseFormReturn<JoinLegacyFormValues>
  /** Claim-link arrival → lock to the complimentary-Elite card (no tier picker). */
  compClaim?: boolean
  /** Dirty Dozen → lifetime Elite; otherwise the first year is complimentary. */
  compIsLifetime?: boolean
  /** Display name of the profile being claimed (for the comp card copy). */
  claimProfileName?: string
}) {
  const selectedPath = form.watch("membershipPath")
  const selectedGoal = form.watch("primaryGoal")

  // Granted-comp claim path (?node=): swap the Free/Premium/Elite picker for a locked
  // complimentary-Elite card. `membershipPath` stays at its FREE default under the hood
  // so the server routes them to the claim magic link, never Stripe checkout.
  if (compClaim) {
    return (
      <CompTierCard
        active={active}
        compIsLifetime={compIsLifetime}
        claimProfileName={claimProfileName}
      />
    )
  }

  return (
    <StepShell
      active={active}
      icon={SparklesIcon}
      eyebrow="Step 1"
      title="Choose your path"
      description="The promo intake starts with what you want Black Belt Legacy to protect: a profile, a school, a lineage, or a community connection."
    >
      <FormField
        control={form.control}
        name="membershipPath"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={value =>
                  field.onChange(value as JoinLegacyFormValues["membershipPath"])
                }
                aria-label="Join Legacy membership path"
                className="grid gap-3"
              >
                {pathCards.map(path => (
                  <label
                    key={path.value}
                    className={cx(
                      "group flex min-h-40 cursor-pointer flex-col rounded-3xl border bg-background/80 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500/50 hover:shadow-lg has-[[data-slot=radio-group-item]:focus-visible]:ring-[3px] has-[[data-slot=radio-group-item]:focus-visible]:ring-red-500/30 active:scale-[0.99] motion-reduce:transform-none",
                      selectedPath === path.value &&
                        "border-red-500 bg-red-500/10 shadow-[0_0_0_1px_rgb(239_68_68_/_0.25)]",
                    )}
                  >
                    <span className="flex items-start gap-3">
                      <RadioGroupItem
                        value={path.value}
                        aria-label={path.title}
                        className="mt-1 shrink-0"
                      />
                      <span>
                        <span className="text-xs font-black uppercase tracking-[0.16em] text-red-500">
                          {path.eyebrow}
                        </span>
                        <span className="mt-2 block font-bold">{path.title}</span>
                        <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                          {path.description}
                        </span>
                      </span>
                    </span>
                    <span className="mt-4 grid gap-2 text-xs text-muted-foreground">
                      {path.bullets.map(bullet => (
                        <span key={bullet} className="flex items-center gap-2">
                          <CheckIcon className="size-3.5 text-red-500" aria-hidden="true" />
                          {bullet}
                        </span>
                      ))}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="primaryGoal"
        render={({ field }) => (
          <FormItem>
            <p className="text-sm font-bold">What brings you here first?</p>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={value =>
                  field.onChange(value as JoinLegacyFormValues["primaryGoal"])
                }
                aria-label="Primary registration goal"
                className="grid gap-2 sm:grid-cols-2"
              >
                {Object.entries(goalLabels).map(([value, label]) => (
                  <label
                    key={value}
                    className={cx(
                      "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border bg-background px-3 py-2 text-sm font-medium transition hover:border-red-500/50",
                      selectedGoal === value && "border-red-500 bg-red-500/10 text-foreground",
                    )}
                  >
                    <RadioGroupItem value={value} aria-label={label} />
                    {label}
                  </label>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </StepShell>
  )
}
