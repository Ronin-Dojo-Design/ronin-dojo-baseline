"use client"

import { useReducedMotion } from "@mantine/hooks"
import {
  AwardIcon,
  CalendarDaysIcon,
  CameraIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { motion } from "motion/react"
import { useAction } from "next-safe-action/hooks"
import { type ReactNode, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Button } from "~/components/common/button"
import { DataSelect, type DataSelectOption } from "~/components/common/data-select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import { Form } from "~/components/common/form"
import { Input } from "~/components/common/input"
import { Label } from "~/components/common/label"
import { AvatarUploader } from "~/components/web/uploader"
import { cx } from "~/lib/utils"
import { setPassportRank } from "~/server/web/onboarding/actions"
import type { BeltRankOption } from "~/server/web/onboarding/ranks"

type WizardForm = {
  rankId: string
  awardedAt: string
  promotedBy: string
  schoolName: string
}

const STEPS = [
  { id: "avatar", label: "Profile Photo", icon: CameraIcon },
  { id: "belt", label: "Current Belt", icon: AwardIcon },
  { id: "history", label: "Belt History", icon: CalendarDaysIcon },
] as const

type ProfileEnhancementWizardProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
  onSkip: () => void
  /** Belt ranks for the Step 2 picker (data-driven from `Rank`). */
  ranks: BeltRankOption[]
  /** Kept for caller compatibility — no longer used inside the wizard. */
  userId?: string
  initialAvatarUrl?: string | null
}

/**
 * Post-registration profile completion — baseline parity for the monorepo's
 * `ProfileEnhancementWizard.jsx`. Step rail with icons: Profile Photo (optional,
 * reuses the shared `AvatarField`/R2 seam) → Current Belt (data-driven from
 * `Rank`, with `<BeltSwatch>`) → Belt History (optional). The final step
 * persists to the account's Passport: avatar via `updatePassport`, belt via the
 * `setPassportRank` seam (a `RankAward`). Base UI `Dialog` + `motion/react` with
 * a `prefers-reduced-motion` fallback; brand tokens, not hardcoded classes.
 */
export function ProfileEnhancementWizard({
  open,
  onOpenChange,
  onComplete,
  onSkip,
  ranks,
  initialAvatarUrl,
}: ProfileEnhancementWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null)
  const reduceMotion = useReducedMotion()
  const form = useForm<WizardForm>({
    defaultValues: {
      rankId: "",
      awardedAt: "",
      promotedBy: "",
      schoolName: "",
    },
  })

  const rankAction = useAction(setPassportRank)
  const saving = rankAction.isExecuting

  useEffect(() => {
    if (open) setCurrentStep(0)
  }, [open])

  const rankId = form.watch("rankId")

  const rankOptions: DataSelectOption[] = ranks.map(rank => {
    const label = rank.shortName ? `${rank.name} (${rank.shortName})` : rank.name
    return {
      value: rank.id,
      label,
      content: (
        <span className="flex min-w-0 items-center gap-2">
          <BeltSwatch colorHex={rank.colorHex} />
          <span className="truncate">{label}</span>
        </span>
      ),
    }
  })

  const isLastStep = currentStep === STEPS.length - 1
  const step = STEPS[currentStep]
  if (!step) return null
  const StepIcon = step.icon

  const handleNext = async () => {
    if (!isLastStep) {
      setCurrentStep(s => s + 1)
      return
    }

    const values = form.getValues()

    // Belt (optional but the wizard's primary purpose): file a pending RANK_PROMOTION claim (B1,
    // petey-plan-0477) — an instructor verifies it before it becomes the member's awarded rank.
    // Avatar is already saved directly by AvatarUploader → uploadAndPromotePassportAvatar.
    if (values.rankId) {
      const res = await rankAction.executeAsync({
        rankId: values.rankId,
        awardedAt: values.awardedAt ? new Date(values.awardedAt) : null,
        promotedBy: values.promotedBy || undefined,
        schoolName: values.schoolName || undefined,
      })
      if (res?.serverError) {
        toast.error(res.serverError)
        return
      }
      toast.success("Belt submitted — pending verification by your instructor.")
      onComplete()
      return
    }

    toast.success("Profile updated.")
    onComplete()
  }

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) onSkip()
  }

  let nextLabel = "Next"
  if (saving) {
    nextLabel = "Saving…"
  } else if (isLastStep) {
    nextLabel = "Complete"
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        {/* Step rail with icons */}
        <nav aria-label="Profile steps" className="flex items-center justify-center gap-2">
          {STEPS.map((s, index) => {
            const RailIcon = s.icon
            const active = index === currentStep
            const done = index < currentStep
            return (
              <div key={s.id} className="flex items-center gap-2">
                <span
                  className={cx(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
                    active && "border-primary/40 bg-primary/10 text-primary",
                    done && "border-primary/30 text-primary/70",
                    !active && !done && "border-border text-muted-foreground",
                  )}
                >
                  {done ? <CheckIcon className="size-4" /> : <RailIcon className="size-4" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </span>
                {index < STEPS.length - 1 && (
                  <span className={cx("h-px w-4", done ? "bg-primary/40" : "bg-border")} />
                )}
              </div>
            )
          })}
        </nav>

        <DialogHeader className="items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
            <StepIcon className="size-7" />
          </span>
          <DialogTitle className="text-center">{step.label}</DialogTitle>
          <DialogDescription className="sr-only">
            Complete your Black Belt Legacy profile
          </DialogDescription>
        </DialogHeader>

        <StepTransition stepKey={step.id} reduceMotion={!!reduceMotion}>
          <Form {...form}>
            <div className="grid gap-4">
              {currentStep === 0 && (
                <div className="flex flex-col items-center gap-2">
                  <AvatarUploader
                    initialAvatarUrl={savedAvatarUrl}
                    rankColorHex={null}
                    onAvatarUrl={url => setSavedAvatarUrl(url)}
                    size="lg"
                  />
                  <p className="text-center text-sm text-muted-foreground">
                    Optional — you can add this later.
                  </p>
                </div>
              )}

              {currentStep === 1 && (
                <div className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="onboarding-belt">Current belt rank</Label>
                    <DataSelect
                      id="onboarding-belt"
                      value={rankId}
                      onValueChange={next => form.setValue("rankId", String(next))}
                      options={rankOptions}
                      placeholder={
                        rankOptions.length ? "Select your belt" : "No ranks configured yet"
                      }
                      disabled={!rankOptions.length}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="onboarding-belt-date">Promotion date</Label>
                    <Input id="onboarding-belt-date" type="date" {...form.register("awardedAt")} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="onboarding-promoted-by">Promoted by</Label>
                    <Input
                      id="onboarding-promoted-by"
                      placeholder="Professor's name"
                      {...form.register("promotedBy")}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="onboarding-school">School name</Label>
                    <Input
                      id="onboarding-school"
                      placeholder="Where you were promoted"
                      {...form.register("schoolName")}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid gap-3 text-center">
                  <p className="text-muted-foreground">
                    Want to add previous belt promotions? If you earned belts at different schools,
                    you can add them now or later from your Passport.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You can always add more belt history from your dashboard.
                  </p>
                </div>
              )}
            </div>
          </Form>
        </StepTransition>

        <DialogFooter>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="secondary"
                prefix={<ChevronLeftIcon />}
                onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                disabled={saving}
              >
                Back
              </Button>
            )}
            <Button variant="ghost" onClick={onSkip} disabled={saving}>
              Skip
            </Button>
          </div>
          <Button
            onClick={handleNext}
            isPending={saving}
            disabled={saving || (currentStep === 1 && rankOptions.length > 0 && !rankId)}
            suffix={isLastStep ? <CheckIcon /> : <ChevronRightIcon />}
          >
            {nextLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Fade/slide a step body in; render plain (no motion) under reduced-motion. */
function StepTransition({
  stepKey,
  reduceMotion,
  children,
}: {
  stepKey: string
  reduceMotion: boolean
  children: ReactNode
}) {
  if (reduceMotion) return <div>{children}</div>
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
