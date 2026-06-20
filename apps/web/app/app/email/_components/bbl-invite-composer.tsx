"use client"

import { GiftIcon, MailIcon, SendIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { sendBblClaimInvite } from "~/server/admin/email/invite-actions"

const DEFAULT_CLAIM_URL = "https://blackbeltlegacy.com/lineage/join?node="

export function BblInviteComposer({ isSenderConfigured }: { isSenderConfigured: boolean }) {
  const [toEmail, setToEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [profileName, setProfileName] = useState("")
  const [claimUrl, setClaimUrl] = useState(DEFAULT_CLAIM_URL)
  const [isLifetime, setIsLifetime] = useState(false)
  const [lastSentTo, setLastSentTo] = useState<string | null>(null)

  const send = useAction(sendBblClaimInvite, {
    onSuccess: ({ data }) => {
      if (!data) return
      setLastSentTo(data.to)
      toast.success(`Claim invite sent to ${data.to}`)
      setToEmail("")
      setFirstName("")
      setProfileName("")
      setClaimUrl(DEFAULT_CLAIM_URL)
      setIsLifetime(false)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Unable to send claim invite.")
    },
  })

  return (
    <Card hover={false} className="p-4">
      <Stack direction="column" className="w-full gap-4">
        <Stack className="items-start justify-between gap-4" wrap>
          <Stack direction="column" size="xs" className="min-w-0">
            <Stack size="xs" className="items-center">
              <MailIcon className="size-4 text-muted-foreground" />
              <Badge variant="outline">Black Belt Legacy</Badge>
            </Stack>
            <H3>Compose a claim invite</H3>
            <Note className="text-sm">
              Send the BBL profile claim email directly to a specific person. They receive a branded
              email with step-by-step instructions and their complimentary Elite membership. The
              preview updates live as you type.
            </Note>
          </Stack>
          <Badge variant={isSenderConfigured ? "success" : "warning"} size="sm">
            {isSenderConfigured ? "Sender configured" : "Sender env pending"}
          </Badge>
        </Stack>

        {lastSentTo && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 text-sm">
            Invite sent to <strong>{lastSentTo}</strong>. Fill in the form again to send another.
          </div>
        )}

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <form
            className="min-w-0 space-y-3"
            onSubmit={event => {
              event.preventDefault()
              setLastSentTo(null)
              send.execute({ toEmail, firstName, profileName, claimUrl, isLifetime })
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0 space-y-1">
                <label
                  className="font-medium text-muted-foreground text-xs"
                  htmlFor="composer-email"
                >
                  Recipient email
                </label>
                <Input
                  id="composer-email"
                  type="email"
                  value={toEmail}
                  onChange={event => setToEmail(event.target.value)}
                  placeholder="chris@example.com"
                  required
                />
              </div>
              <div className="min-w-0 space-y-1">
                <label
                  className="font-medium text-muted-foreground text-xs"
                  htmlFor="composer-firstname"
                >
                  First name (for greeting)
                </label>
                <Input
                  id="composer-firstname"
                  value={firstName}
                  onChange={event => setFirstName(event.target.value)}
                  placeholder="Chris"
                />
              </div>
            </div>

            <div className="min-w-0 space-y-1">
              <label
                className="font-medium text-muted-foreground text-xs"
                htmlFor="composer-profilename"
              >
                Profile name shown in email
              </label>
              <Input
                id="composer-profilename"
                value={profileName}
                onChange={event => setProfileName(event.target.value)}
                placeholder="Chris Haueter"
                required
              />
            </div>

            <div className="min-w-0 space-y-1">
              <label
                className="font-medium text-muted-foreground text-xs"
                htmlFor="composer-claimurl"
              >
                Claim URL
              </label>
              <Input
                id="composer-claimurl"
                value={claimUrl}
                onChange={event => setClaimUrl(event.target.value)}
                placeholder="https://blackbeltlegacy.com/lineage/join?node=..."
                required
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isLifetime}
                onChange={event => setIsLifetime(event.target.checked)}
                className="rounded border-border"
              />
              Lifetime membership (Dirty Dozen / founding member)
            </label>

            <Button
              type="submit"
              size="sm"
              isPending={send.isPending}
              disabled={!toEmail || !profileName || !claimUrl || send.isPending}
              prefix={<SendIcon />}
            >
              Send claim invite
            </Button>
          </form>

          <BblInvitePreview
            firstName={firstName}
            profileName={profileName}
            claimUrl={claimUrl}
            isLifetime={isLifetime}
          />
        </div>
      </Stack>
    </Card>
  )
}

type BblInvitePreviewProps = {
  firstName: string
  profileName: string
  claimUrl: string
  isLifetime: boolean
}

function BblInvitePreview({ firstName, profileName, claimUrl, isLifetime }: BblInvitePreviewProps) {
  const greetingName = firstName.trim() || "there"
  const displayProfile = profileName.trim() || "your profile"
  const compLine = isLifetime
    ? "lifetime Elite membership — on us, for good"
    : "one year of Elite membership — on us"

  return (
    <div className="min-w-0 space-y-2">
      <p className="font-semibold text-[0.7rem] text-muted-foreground uppercase tracking-[0.18em]">
        Live email preview
      </p>
      <div className="overflow-hidden rounded-lg border bg-white text-neutral-900 shadow-sm">
        <div className="border-neutral-100 border-b bg-neutral-50 px-5 py-3">
          <span className="font-bold text-[0.65rem] text-red-700 uppercase tracking-[0.2em]">
            Black Belt Legacy
          </span>
        </div>
        <div className="space-y-3 px-5 py-5 text-[0.8125rem] leading-6">
          <p className="font-bold text-base text-neutral-900">
            Your place in the lineage is waiting
          </p>
          <p>Hey {greetingName},</p>
          <p>
            Black Belt Legacy is now live at <strong>blackbeltlegacy.com</strong> — a permanent home
            for the lineage and the people who built it.
          </p>
          <p>
            We created a profile for <strong className="break-words">{displayProfile}</strong> from
            the records we carried over from the old site. <strong>Your information is safe</strong>{" "}
            — nothing was lost.
          </p>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
            <p className="font-bold text-[0.6rem] text-neutral-500 uppercase tracking-[0.18em]">
              How to claim your profile — 3 steps
            </p>
            <p className="mt-2 text-[0.8125rem] text-neutral-800 leading-6">
              <strong>1.</strong> Click the button below to open your profile page.
              <br />
              <strong>2.</strong> Create your password — takes about 60 seconds.
              <br />
              <strong>3.</strong> Confirm your details, add a photo, and you&apos;re done.
            </p>
          </div>

          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
            <p className="flex items-center gap-1.5 font-bold text-[0.6rem] text-red-700 uppercase tracking-[0.18em]">
              <GiftIcon className="size-3" />A gift, founder to founder
            </p>
            <p className="mt-1 text-[0.8125rem] text-neutral-800">
              When you claim your profile, you get <strong>{compLine}</strong>. No card required.
            </p>
          </div>

          <span className="inline-flex items-center rounded-md bg-red-700 px-4 py-2 font-semibold text-white text-xs">
            Claim your profile
          </span>

          <p className="text-[0.7rem] text-neutral-500">
            If the button doesn&apos;t work, paste this link into your browser:
            <br />
            <span className="break-all text-neutral-700">{claimUrl || DEFAULT_CLAIM_URL}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
