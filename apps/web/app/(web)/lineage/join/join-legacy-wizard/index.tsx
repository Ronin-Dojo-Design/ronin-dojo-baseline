"use client"

import { AlertCircleIcon, LockKeyholeIcon } from "lucide-react"
import { Button } from "~/components/common/button"
import { Form } from "~/components/common/form"
import { Note } from "~/components/common/note"
import { cx } from "~/lib/utils"
import { bblPortalFontClass } from "./constants"
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

  return (
    <Form {...wizard.form}>
      <form
        className={cx("space-y-4 pb-28 sm:pb-0", bblPortalFontClass)}
        onSubmit={wizard.submit}
        data-testid="bbl-register-form"
      >
        <div className="sticky top-0 z-10 -mx-1 bg-background/95 px-1 pb-3 pt-1 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:bg-transparent sm:p-0">
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
              <span>
                Your submission stays private until reviewed. Premium and Elite selections create
                the same intake record, then return you to lineage membership checkout.
              </span>
            </Note>
          )}
        </div>
      </form>
    </Form>
  )
}
