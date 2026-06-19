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
      role: "STUDENT",
      schoolName: "",
      location: "",
      trainedUnder: "",
      represent: "",
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
      toast.success("Your legacy information was received.")
      if (data.claimRequiresSignIn) {
        const nodeId = form.getValues("nodeId")
        const returnTo = nodeId ? `/lineage/join?node=${nodeId}` : "/lineage/join"
        toast.info("One more step — sign in to claim your profile.")
        router.push(`/auth/login?next=${encodeURIComponent(returnTo)}`)
        return
      }
      router.push(data.checkoutUrl)
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
    isLastStep: currentStep === STEP_META.length - 1,
    submit: form.handleSubmit(values => execute(values)),
  }
}
