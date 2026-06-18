"use client"

import { useReducedMotion } from "@mantine/hooks"
import { ArrowUpIcon, CheckIcon, ChevronRightIcon, SparklesIcon } from "lucide-react"
import { motion } from "motion/react"
import { type ReactNode, useEffect, useState } from "react"
import { Button } from "~/components/common/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import { cx } from "~/lib/utils"
import { getTierFeatures, getTierLabel, getUpgradeCta, type OnboardingTier } from "./tier-features"

type DashboardOnboardingProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Fired when the user finishes the final step (vs. closing/skipping). */
  onComplete: () => void
  /** Fired when the user closes, hits Skip, or presses Esc. */
  onSkip: () => void
  tier: OnboardingTier
}

type OnboardingStep = {
  id: string
  title: string
  body: ReactNode
  icon: typeof SparklesIcon
  accent: boolean
}

/**
 * First-run dashboard tour — baseline parity for the monorepo's
 * `DashboardOnboarding.jsx`. Three steps (welcome → tier features → get started/
 * upgrade) with progress dots, rendered through the shared Base UI `Dialog` and
 * `motion/react` step transitions that self-disable under `prefers-reduced-motion`.
 * Brand tokens (`bg-primary`/`text-primary`) carry BBL's red via `[data-brand]`,
 * not hardcoded classes.
 */
export function DashboardOnboarding({
  open,
  onOpenChange,
  onComplete,
  onSkip,
  tier,
}: DashboardOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const reduceMotion = useReducedMotion()

  // Always restart at the welcome step each time the tour is (re)opened.
  useEffect(() => {
    if (open) setCurrentStep(0)
  }, [open])

  const tierLabel = getTierLabel(tier)
  const features = getTierFeatures(tier)
  const upgrade = getUpgradeCta(tier)

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Black Belt Legacy",
      icon: SparklesIcon,
      accent: false,
      body: (
        <p className="text-muted-foreground">
          Your journey to build and honor your martial arts lineage starts here. Complete your
          Passport, explore the lineage trees, and connect with your training family.
        </p>
      ),
    },
    {
      id: "features",
      title: `As a ${tierLabel}, you can:`,
      icon: SparklesIcon,
      accent: false,
      body: (
        <ul className="grid gap-2">
          {features.map(feature => (
            <li
              key={feature}
              className="flex items-center gap-3 rounded-md border bg-card p-3 text-card-foreground"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckIcon className="size-4" />
              </span>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "get-started",
      title: upgrade ? "Upgrade to unlock more" : "Get started",
      icon: upgrade ? ArrowUpIcon : SparklesIcon,
      accent: !!upgrade,
      body: (
        <p className="text-muted-foreground">
          {upgrade
            ? upgrade.message
            : "You're all set! Explore your dashboard, browse techniques, and start building your legacy."}
        </p>
      ),
    },
  ]

  const isLastStep = currentStep === steps.length - 1
  const step = steps[currentStep]
  if (!step) return null
  const StepIcon = step.icon

  const actionLabel = isLastStep
    ? upgrade
      ? `Upgrade to ${upgrade.targetTierLabel}`
      : "Get Started"
    : "Next"

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(s => s + 1)
    }
  }

  // Closing via Esc / backdrop / the built-in X all funnel to Skip.
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) onSkip()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        {/* Progress dots */}
        <div className="flex justify-center gap-2" aria-hidden="true">
          {steps.map((s, index) => (
            <span
              key={s.id}
              className={cx(
                "h-2 rounded-full transition-all",
                index === currentStep ? "w-8 bg-primary" : "w-2",
                index < currentStep && "bg-primary/40",
                index > currentStep && "bg-muted",
              )}
            />
          ))}
        </div>

        <DialogHeader className="items-center text-center">
          <span
            className={cx(
              "flex size-14 items-center justify-center rounded-full border",
              step.accent
                ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                : "border-primary/30 bg-primary/10 text-primary",
            )}
          >
            <StepIcon className="size-7" />
          </span>
          <DialogTitle className="text-center">{step.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Black Belt Legacy onboarding tour
          </DialogDescription>
        </DialogHeader>

        <StepTransition stepKey={step.id} reduceMotion={!!reduceMotion}>
          {step.body}
        </StepTransition>

        <DialogFooter>
          <Button variant="ghost" onClick={onSkip}>
            {currentStep === 0 ? "Skip tour" : "Skip"}
          </Button>
          <Button onClick={handleNext} suffix={isLastStep ? <CheckIcon /> : <ChevronRightIcon />}>
            {actionLabel}
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
