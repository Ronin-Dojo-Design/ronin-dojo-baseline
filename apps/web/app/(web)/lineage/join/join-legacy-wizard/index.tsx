"use client"

import { AlertCircleIcon, CheckCircle2Icon, LockKeyholeIcon, MailIcon } from "lucide-react"
import { Button } from "~/components/common/button"
import { Form } from "~/components/common/form"
import { Note } from "~/components/common/note"
import { cx } from "~/lib/utils"
import { bblHeadingClass, bblPortalFontClass } from "./constants"
import { IdentityStep } from "./identity-step"
import { LineageStep } from "./lineage-step"
import { PathStep } from "./path-step"
import { StepProgress } from "./step-progress"
import { useJoinWizard, type ClaimableTree } from "./use-join-wizard"

export function JoinLegacyWizard({
  claimableTree,
  initialNodeId,
}: {
  claimableTree?: ClaimableTree
  initialNodeId?: string
}) {
  const wizard = useJoinWizard({ claimableTree, initialNodeId })
  const errorCount = Object.keys(wizard.form.formState.errors).length

  // Success state — shown after a successful submit instead of bouncing guests to a
  // sign-in modal. The confirmation email (with next steps) is sent server-side.
  if (wizard.submitted) {
    return (
      <div
        className={cx(
          "flex flex-col items-center gap-4 px-4 py-12 text-center",
          bblPortalFontClass,
        )}
      >
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-500">
          <CheckCircle2Icon className="size-9" aria-hidden="true" />
        </span>
        <h3 className={cx("text-2xl uppercase italic", bblHeadingClass)}>Success!</h3>
        <p className="max-w-sm text-sm leading-7 text-muted-foreground">
          Your information was received.{" "}
          <strong className="text-foreground">Check your email</strong> for the next steps —
          we&apos;ll walk you through confirming your profile and lineage.
        </p>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <MailIcon className="size-4 shrink-0 text-red-500" aria-hidden="true" />
          Didn&apos;t get it? Check spam, or reach us at welcome@blackbeltlegacy.com.
        </p>
      </div>
    )
  }

  return (
    <Form {...wizard.form}>
      <form
        className={cx(
          "w-full min-w-0 max-w-full space-y-4 overflow-x-hidden pb-28 sm:pb-0",
          // 16px inputs on mobile so iOS Safari doesn't auto-zoom on focus; smaller on desktop.
          "[&_input]:text-base [&_textarea]:text-base sm:[&_input]:text-sm sm:[&_textarea]:text-sm",
          bblPortalFontClass,
        )}
        onSubmit={wizard.submit}
        data-testid="bbl-register-form"
      >
        <div className="sticky top-0 z-10 bg-background/95 pb-3 pt-1 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:bg-transparent sm:p-0">
          <StepProgress current={wizard.currentStep} />
        </div>

        <div aria-live="polite" className="min-h-0">
          {errorCount > 0 && (
            <div className="flex items-start gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Please fix {errorCount === 1 ? "the highlighted field" : "the highlighted fields"}{" "}
                before continuing.
              </span>
            </div>
          )}
        </div>

        <PathStep active={wizard.currentStep === 0} form={wizard.form} />
        <IdentityStep active={wizard.currentStep === 1} form={wizard.form} />
        <LineageStep
          active={wizard.currentStep === 2}
          claimableTree={claimableTree}
          form={wizard.form}
        />

        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 shadow-2xl backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            {wizard.currentStep > 0 ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="min-h-12 flex-1 sm:flex-none"
                onClick={wizard.goBack}
              >
                Back
              </Button>
            ) : (
              <span className="hidden sm:block" />
            )}

            {wizard.isLastStep ? (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="min-h-12 flex-[2] sm:flex-none"
                isPending={wizard.isExecuting}
              >
                Submit registration
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="min-h-12 flex-[2] sm:flex-none"
                onClick={wizard.goNext}
              >
                Continue
              </Button>
            )}
          </div>
          {wizard.isLastStep && (
            <Note className="mx-auto mt-2 flex max-w-3xl items-start justify-center gap-1 text-center text-xs">
              <LockKeyholeIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>Your submission stays private until reviewed by a steward.</span>
            </Note>
          )}
        </div>
      </form>
    </Form>
  )
}
