import { AwardIcon } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/common/form"
import { Input } from "~/components/common/input"
import { Note } from "~/components/common/note"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { TextArea } from "~/components/common/textarea"
import { bblPortalFontClass } from "./constants"
import type { JoinLegacyFormValues } from "./schema"
import { StepShell } from "./step-shell"
import type { ClaimableTree } from "./use-join-wizard"

export function LineageStep({
  active,
  claimableTree,
  form,
}: {
  active: boolean
  claimableTree?: ClaimableTree
  form: UseFormReturn<JoinLegacyFormValues>
}) {
  return (
    <StepShell
      active={active}
      icon={AwardIcon}
      eyebrow="Step 3"
      title="Lineage details"
      description="Share enough rank, school, evidence, and story context for reviewers to place your Passport and lineage profile correctly."
    >
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="currentRank"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rank and promotion history</FormLabel>
              <FormControl>
                <TextArea
                  placeholder="Belt rank, dates, certifying instructor..."
                  className="min-h-28"
                  {...field}
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
              <FormLabel>Current school / academy</FormLabel>
              <FormControl>
                <TextArea
                  placeholder="School, team, or organization name..."
                  className="min-h-28"
                  {...field}
                />
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
                  className="min-h-28"
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
                  className="min-h-28"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="martialArtsExperience"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Martial arts experience</FormLabel>
              <FormControl>
                <TextArea
                  placeholder="Years training, disciplines, teaching history, competition highlights, major affiliations..."
                  className="min-h-28"
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
                <Input type="url" inputMode="url" size="lg" placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instagramUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram or social proof</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  inputMode="url"
                  size="lg"
                  placeholder="https://instagram.com/..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="evidenceUrl"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Reference / evidence URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  inputMode="url"
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
                    <SelectTrigger size="lg" className="min-h-12">
                      <SelectValue placeholder={`Optional: select from ${claimableTree.name}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={bblPortalFontClass}>
                    {claimableTree.members.map(member => (
                      <SelectItem key={member.nodeId} value={member.nodeId} className="min-h-10">
                        {member.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Note className="text-xs">
                  A claim is created immediately when you are signed in. Otherwise this records the
                  intent and you can finish the claim after signing in.
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
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shareConsent"
          render={({ field }) => (
            <FormItem className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 md:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={event => field.onChange(event.target.checked)}
                  className="mt-1 size-5 rounded border-border accent-red-600"
                />
                <span>
                  <span className="font-bold">I understand this is a private review intake.</span>{" "}
                  Black Belt Legacy may use these details to verify my Passport, lineage, and public
                  profile before anything is published.
                </span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </StepShell>
  )
}
