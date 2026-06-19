"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AwardIcon, CheckCircle2Icon, ShieldCheckIcon, SparklesIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
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
import { Note } from "~/components/common/note"
import { RadioGroup, RadioGroupItem } from "~/components/common/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { TextArea } from "~/components/common/textarea"
import { createJoinLegacyInterest } from "~/server/web/lead/public-actions"
import { cx } from "~/lib/utils"

const httpUrlSchema = z
  .string()
  .trim()
  .url("Use a valid http or https URL")
  .refine(value => ["http:", "https:"].includes(new URL(value).protocol), {
    message: "Use a valid http or https URL",
  })

const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(120),
  lastName: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Valid email is required"),
  phoneE164: z.string().trim().max(32).optional().or(z.literal("")),
  currentRank: z.string().trim().max(200).optional().or(z.literal("")),
  role: z.enum(["STUDENT", "BLACK_BELT", "INSTRUCTOR", "SCHOOL_OWNER", "OTHER"]),
  schoolName: z.string().trim().max(160).optional().or(z.literal("")),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  trainedUnder: z.string().trim().max(500).optional().or(z.literal("")),
  represent: z.string().trim().max(500).optional().or(z.literal("")),
  evidenceUrl: httpUrlSchema.optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  profileUrl: httpUrlSchema.optional().or(z.literal("")),
  membershipPath: z.enum(["FREE", "PREMIUM", "ELITE"]),
  treeId: z.string().optional(),
  nodeId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

type JoinLegacyFormProps = {
  claimableTree?: {
    id: string
    name: string
    members: Array<{ nodeId: string; displayName: string }>
  } | null
  /** Node to preselect in the claim picker (from `?node=` — e.g. a View A card "Claim"). */
  initialNodeId?: string
}

const pathCards: Array<{
  value: FormValues["membershipPath"]
  title: string
  eyebrow: string
  description: string
}> = [
  {
    value: "FREE",
    title: "Free profile",
    eyebrow: "Start verified",
    description: "Submit your lineage, profile, and claim intent for steward review.",
  },
  {
    value: "PREMIUM",
    title: "Premium lineage membership",
    eyebrow: "Most popular",
    description: "Save the same review intake, then choose a paid lineage membership tier.",
  },
  {
    value: "ELITE",
    title: "Elite lineage support",
    eyebrow: "Schools & leaders",
    description: "For instructors, academies, and multi-generation legacy stewardship.",
  },
]

const roleLabels: Record<FormValues["role"], string> = {
  STUDENT: "Student / practitioner",
  BLACK_BELT: "Black belt",
  INSTRUCTOR: "Instructor",
  SCHOOL_OWNER: "School owner",
  OTHER: "Other / representative",
}

const StepHeader = ({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof SparklesIcon
  eyebrow: string
  title: string
  description: string
}) => (
  <div className="flex items-start gap-3">
    <span className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
      <Icon className="size-4" aria-hidden="true" />
    </span>
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <H3 className="text-xl">{title}</H3>
      <Note className="text-sm">{description}</Note>
    </div>
  </div>
)

const STEP_META = [
  { id: "path", label: "Your Path" },
  { id: "identity", label: "Identity" },
  { id: "lineage", label: "Lineage" },
] as const

// Fields validated before advancing past each step (the last step validates on submit).
const STEP_FIELDS: ReadonlyArray<ReadonlyArray<keyof FormValues>> = [
  ["membershipPath"],
  ["firstName", "lastName", "email", "phoneE164", "role", "location"],
  [],
]

function StepProgress({ current }: { current: number }) {
  return (
    <ol className="flex items-center justify-center gap-1.5">
      {STEP_META.map((step, index) => {
        const isActive = index === current
        const isDone = index < current
        return (
          <li key={step.id} className="flex items-center gap-1.5">
            <span
              className={cx(
                "flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors",
                isActive && "border-primary bg-primary text-primary-foreground",
                isDone && "border-primary/40 bg-primary/15 text-primary",
                !isActive && !isDone && "border-border bg-muted text-muted-foreground",
              )}
            >
              {isDone ? <CheckCircle2Icon className="size-5" /> : index + 1}
            </span>
            <span
              className={cx(
                "text-xs font-semibold uppercase tracking-[0.16em] max-sm:hidden",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
            {index < STEP_META.length - 1 && <span className="mx-1 h-px w-5 bg-border sm:w-8" />}
          </li>
        )
      })}
    </ol>
  )
}

export function JoinLegacyForm({ claimableTree, initialNodeId }: JoinLegacyFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const isLastStep = currentStep === STEP_META.length - 1

  const goNext = async () => {
    const ok = await form.trigger(STEP_FIELDS[currentStep] as Array<keyof FormValues>)
    if (ok) setCurrentStep(step => Math.min(step + 1, STEP_META.length - 1))
  }
  const goBack = () => setCurrentStep(step => Math.max(step - 1, 0))
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
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
      membershipPath: "FREE",
      treeId: claimableTree?.id,
      nodeId: initialNodeId ?? "",
    },
  })

  const selectedPath = form.watch("membershipPath")

  const { execute, isExecuting } = useAction(createJoinLegacyInterest, {
    onSuccess: ({ data }) => {
      if (!data) return
      toast.success("Your legacy information was received.")
      if (data.claimRequiresSignIn) {
        // The claim only persists once signed in. Hand off to the login route
        // with a `next=` that returns the user to this page with their node
        // preselected (the landing auto-opens the claim drawer for `?node=`).
        // NOTE: the form re-renders empty on return — the user re-submits while
        // signed in, which then creates the claim (no data is silently dropped,
        // but it is a re-entry). The token-invite/magic-link path (#3) removes
        // this round-trip entirely for emailed claims.
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

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(values => execute(values))}
        data-testid="bbl-register-form"
      >
        <div className="pb-2">
          <StepProgress current={currentStep} />
        </div>

        <Card hover={false} className={cx("space-y-5 p-5 md:p-6", currentStep !== 0 && "hidden")}>
          <StepHeader
            icon={SparklesIcon}
            eyebrow="Step 1"
            title="Choose your path"
            description="Free, Premium, and Elite all start with the same review-safe intake."
          />

          <FormField
            control={form.control}
            name="membershipPath"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={value => field.onChange(value as FormValues["membershipPath"])}
                    aria-label="Join Legacy membership path"
                    className="grid gap-3 md:grid-cols-3"
                  >
                    {pathCards.map(path => (
                      <label
                        key={path.value}
                        className={cx(
                          "group flex cursor-pointer items-start gap-3 rounded-2xl border bg-background/70 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md has-[[data-slot=radio-group-item]:focus-visible]:ring-[3px] has-[[data-slot=radio-group-item]:focus-visible]:ring-ring/50 active:scale-[0.99] motion-reduce:transform-none",
                          selectedPath === path.value &&
                            "border-primary bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.25)]",
                        )}
                      >
                        <RadioGroupItem
                          value={path.value}
                          aria-label={path.title}
                          className="mt-1 shrink-0"
                        />
                        <span>
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                            {path.eyebrow}
                          </span>
                          <span className="mt-2 block font-semibold">{path.title}</span>
                          <span className="mt-1 block text-sm text-muted-foreground">
                            {path.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Card hover={false} className={cx("space-y-5 p-5 md:p-6", currentStep !== 1 && "hidden")}>
          <StepHeader
            icon={ShieldCheckIcon}
            eyebrow="Step 2"
            title="Identity and contact"
            description="This private contact information gives stewards a way to verify and follow up."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>First name</FormLabel>
                  <FormControl>
                    <Input size="lg" placeholder="First name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input size="lg" placeholder="Last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>Email</FormLabel>
                  <FormControl>
                    <Input type="email" size="lg" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneE164"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input size="lg" placeholder="+1 555 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} items={roleLabels}>
                    <FormControl>
                      <SelectTrigger size="lg">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City / region</FormLabel>
                  <FormControl>
                    <Input size="lg" placeholder="Los Angeles, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Card hover={false} className={cx("space-y-5 p-5 md:p-6", currentStep !== 2 && "hidden")}>
          <StepHeader
            icon={AwardIcon}
            eyebrow="Step 3"
            title="Lineage details"
            description="Give reviewers enough context to place your Passport and lineage profile correctly."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="currentRank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rank and promotion history</FormLabel>
                  <FormControl>
                    <TextArea placeholder="Belt rank, dates, certifying instructor..." {...field} />
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
                  <FormLabel>Current school / academy</FormLabel>
                  <FormControl>
                    <TextArea placeholder="School, team, or organization name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trainedUnder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who did you train under?</FormLabel>
                  <FormControl>
                    <TextArea
                      placeholder="Instructors, schools, teams, affiliations..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="represent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who should your tree connect to?</FormLabel>
                  <FormControl>
                    <TextArea
                      placeholder="Family tree, instructor line, organization..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website or public profile</FormLabel>
                  <FormControl>
                    <Input size="lg" placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evidenceUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference / evidence URL</FormLabel>
                  <FormControl>
                    <Input
                      size="lg"
                      placeholder="Certificate, academy bio, Smoothcomp, IBJJF..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {claimableTree && claimableTree.members.length > 0 && (
              <FormField
                control={form.control}
                name="nodeId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Claim an existing lineage profile</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      items={Object.fromEntries(
                        claimableTree.members.map(member => [member.nodeId, member.displayName]),
                      )}
                    >
                      <FormControl>
                        <SelectTrigger size="lg">
                          <SelectValue
                            placeholder={`Optional: select from ${claimableTree.name}`}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {claimableTree.members.map(member => (
                          <SelectItem key={member.nodeId} value={member.nodeId}>
                            {member.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Note className="text-xs">
                      A claim is created immediately when you are signed in. Otherwise this records
                      the intent and you can finish the claim after signing in.
                    </Note>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Bio, achievements, or legacy notes</FormLabel>
                  <FormControl>
                    <TextArea
                      placeholder="Short history, achievements, teaching focus, competition highlights, context for reviewers..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <div className="flex items-center justify-between gap-3 pt-1">
          {currentStep > 0 ? (
            <Button type="button" variant="secondary" size="lg" onClick={goBack}>
              Back
            </Button>
          ) : (
            <span />
          )}

          {isLastStep ? (
            <Button type="submit" variant="primary" size="lg" isPending={isExecuting}>
              Submit registration
            </Button>
          ) : (
            <Button type="button" variant="primary" size="lg" onClick={goNext}>
              Continue
            </Button>
          )}
        </div>

        {isLastStep && (
          <Note className="text-center text-xs">
            Your submission stays private until reviewed. Premium and Elite selections create the
            same intake record, then return you to the lineage membership checkout.
          </Note>
        )}
      </form>
    </Form>
  )
}
