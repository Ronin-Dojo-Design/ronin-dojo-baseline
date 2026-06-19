"use client"

import { MailIcon, SendIcon } from "lucide-react"
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

export function BblInviteComposer({ isSenderConfigured }: { isSenderConfigured: boolean }) {
  const [toEmail, setToEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [profileName, setProfileName] = useState("")
  const [claimUrl, setClaimUrl] = useState("https://blackbeltlegacy.com/lineage/join?node=")
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
      setClaimUrl("https://blackbeltlegacy.com/lineage/join?node=")
      setIsLifetime(false)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Unable to send claim invite.")
    },
  })

  return (
    <Card hover={false} className="p-4">
      <Stack direction="column" className="gap-4">
        <Stack className="items-start justify-between gap-4" wrap>
          <Stack direction="column" size="xs">
            <Stack size="xs" className="items-center">
              <MailIcon className="size-4 text-muted-foreground" />
              <Badge variant="outline">Black Belt Legacy</Badge>
            </Stack>
            <H3>Compose a claim invite</H3>
            <Note className="text-sm">
              Send the BBL profile claim email directly to a specific person. They receive a branded
              email with step-by-step instructions and their complimentary Elite membership.
            </Note>
          </Stack>
          <Badge variant={isSenderConfigured ? "success" : "warning"} size="sm">
            {isSenderConfigured ? "Sender configured" : "Sender env pending"}
          </Badge>
        </Stack>

        {lastSentTo && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Invite sent to <strong>{lastSentTo}</strong>. Fill in the form again to send another.
          </div>
        )}

        <form
          className="space-y-3"
          onSubmit={event => {
            event.preventDefault()
            setLastSentTo(null)
            send.execute({ toEmail, firstName, profileName, claimUrl, isLifetime })
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label
                className="text-xs font-medium text-muted-foreground"
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
            <div className="space-y-1">
              <label
                className="text-xs font-medium text-muted-foreground"
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

          <div className="space-y-1">
            <label
              className="text-xs font-medium text-muted-foreground"
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

          <div className="space-y-1">
            <label
              className="text-xs font-medium text-muted-foreground"
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
      </Stack>
    </Card>
  )
}
