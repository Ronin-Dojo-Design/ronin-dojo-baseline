"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AwardIcon, CheckCircle2Icon, ShieldCheckIcon, SparklesIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Badge } from "~/components/common/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { createJoinLegacyInterest } from "~/server/web/lead/public-actions"
import { cx } from "~/lib/utils"

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
  evidenceUrl: z.string().trim().url("Use a valid URL").optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  profileUrl: z.string().trim().url("Use a valid URL").optional().or(z.literal("")),
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
    title: "Premium listing",
    eyebrow: "Most popular",
    description: "Add a richer public listing and checkout after the same intake is saved.",
  },
  {
    value: "ELITE",
    title: "Elite legacy listing",
    eyebrow: "Schools & leaders",
    description: "Best for instructors, academies, and multi-generation legacy profiles.",
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

export function JoinLegacyForm({ claimableTree }: JoinLegacyFormProps) {
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
      nodeId: "",
    },
  })

  const selectedPath = form.watch("membershipPath")

  const { execute, isExecuting } = useAction(createJoinLegacyInterest, {
    onSuccess: ({ data }) => {
      if (!data) return
      toast.success("Your legacy information was received.")
      if (data.claimRequiresSignIn) {
        toast.info("Sign in to finish claiming the selected lineage profile.")
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
        <Card
          hover={false}
          className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary/5 p-0!"
        >
          <div className="grid gap-5 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center">
            <div className="space-y-3">
              <Badge variant="outline" prefix={<SparklesIcon />}>
                Black Belt Legacy registration
              </Badge>
              <div className="space-y-2">
                <H3 className="text-2xl md:text-3xl">Reserve your verified legacy profile</H3>
                <Note>
                  Tell us who you are, where you trained, and how your lineage should connect. A
                  steward reviews every claim before anything becomes verified.
                </Note>
              </div>
            </div>
            <div className="rounded-2xl border bg-background/70 p-4 text-sm shadow-sm">
              <ul className="space-y-2.5">
                {["Lead intake saved", "Draft listing created", "Claim intent captured"].map(
                  item => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2Icon className="size-4 text-primary" aria-hidden="true" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </Card>

        <Card hover={false} className="space-y-5 p-5 md:p-6">
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
                  <div className="grid gap-3 md:grid-cols-3">
                    {pathCards.map(path => (
                      <button
                        key={path.value}
                        type="button"
                        onClick={() => field.onChange(path.value)}
                        className={cx(
                          "group rounded-2xl border bg-background/70 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md active:scale-[0.99] motion-reduce:transform-none",
                          selectedPath === path.value &&
                            "border-primary bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.25)]",
                        )}
                      >
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                          {path.eyebrow}
                        </span>
                        <span className="mt-2 block font-semibold">{path.title}</span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {path.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Card hover={false} className="space-y-5 p-5 md:p-6">
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

        <Card hover={false} className="space-y-5 p-5 md:p-6">
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

        <Card hover={false} className="border-primary/20 bg-primary/5 p-5 md:p-6">
          <Stack className="items-center justify-between gap-4" wrap>
            <Note className="max-w-2xl text-sm">
              Your submission stays private until reviewed. Premium and Elite selections create the
              same intake record, then route you to paid directory listing checkout.
            </Note>
            <Button type="submit" variant="primary" size="lg" isPending={isExecuting}>
              Submit registration
            </Button>
          </Stack>
        </Card>
      </form>
    </Form>
  )
}
