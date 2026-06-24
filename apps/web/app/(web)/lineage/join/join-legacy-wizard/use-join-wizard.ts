import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { createJoinLegacyInterest } from "~/server/web/lead/public-actions"
import { joinLegacyFormSchema, STEP_FIELDS, type JoinLegacyFormValues } from "./schema"
import { STEP_META } from "./constants"

export type ClaimableTree = {
  id: string
  name: string
  members: Array<{ nodeId: string; displayName: string }>
} | null

export function useJoinWizard({
  claimableTree,
  initialNodeId,
}: {
  claimableTree?: ClaimableTree
  initialNodeId?: string
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [isFounder, setIsFounder] = useState(false)
  const router = useRouter()
  const form = useForm<JoinLegacyFormValues>({
    resolver: zodResolver(joinLegacyFormSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      preferredName: "",
      email: "",
      phoneE164: "",
      currentRank: "",
      currentRankId: "",
      role: "STUDENT",
      schoolName: "",
      schoolOrgId: "",
      location: "",
      trainedUnder: "",
      trainedUnderNodeId: "",
      represent: "",
      representTreeId: "",
      evidenceUrl: "",
      bio: "",
      profileUrl: "",
      instagramUrl: "",
      martialArtsExperience: "",
      primaryGoal: initialNodeId ? "CLAIM_PROFILE" : "PRESERVE_LINEAGE",
      discoverySource: "INSTRUCTOR",
      discoverySourceOther: "",
      shareConsent: false,
      membershipPath: "FREE",
      treeId: claimableTree?.id,
      nodeId: initialNodeId ?? "",
    },
  })

  const { execute, isExecuting } = useAction(createJoinLegacyInterest, {
    onSuccess: ({ data }) => {
      if (!data) return
      // Paid tiers (Premium/Elite) continue to the lineage-membership Stripe checkout.
      // Free intake (incl. guest claims) shows an in-place success state — the
      // confirmation email (verification pending) is sent server-side. No sign-in
      // bounce that loops back into this same form; the steward links a guest's claim
      // during review (or via a future emailed magic-link).
      const path = form.getValues("membershipPath")
      if (path === "PREMIUM" || path === "ELITE") {
        // Guest paid submission: a checkout magic link was emailed — show the success
        // ("check your email") state so they sign in and finish checkout from the picker.
        // Signed-in users continue straight to the membership checkout.
        if (data.checkoutEmailSent) {
          setSubmitted(true)
          return
        }
        router.push(data.checkoutUrl)
        return
      }
      // The founder (Bob Bass) claiming his own profile gets the celebratory welcome
      // instead of the generic success state.
      setIsFounder(Boolean(data.isFounder))
      setSubmitted(true)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Unable to submit your legacy information.")
    },
  })

  const goNext = async () => {
    const fields = STEP_FIELDS[currentStep] ?? []
    const ok = await form.trigger(fields as Array<keyof JoinLegacyFormValues>, {
      shouldFocus: true,
    })
    if (ok) setCurrentStep(step => Math.min(step + 1, STEP_META.length - 1))
  }

  const goBack = () => setCurrentStep(step => Math.max(step - 1, 0))

  return {
    currentStep,
    form,
    goBack,
    goNext,
    isExecuting,
    submitted,
    isFounder,
    firstName: form.getValues("firstName"),
    isLastStep: currentStep === STEP_META.length - 1,
    submit: form.handleSubmit(values => execute(values)),
  }
}
