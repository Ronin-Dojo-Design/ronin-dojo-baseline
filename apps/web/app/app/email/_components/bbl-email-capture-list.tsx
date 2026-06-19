import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { type BblJoinLegacyCapture, readLeadMetaString } from "~/server/admin/email/queries"

type BblEmailCaptureListProps = {
  captures: BblJoinLegacyCapture[]
}

const formatCaptureName = (capture: BblJoinLegacyCapture) => {
  return [capture.firstName, capture.lastName].filter(Boolean).join(" ") || "Unknown"
}

const buildMailto = (email: string, subject: string, body: string) => {
  const params = new URLSearchParams({ subject, body })
  return `mailto:${encodeURIComponent(email)}?${params.toString()}`
}

export function BblEmailCaptureList({ captures }: BblEmailCaptureListProps) {
  return (
    <Card hover={false} className="p-4">
      <Stack direction="column" className="gap-4">
        <Stack className="items-start justify-between gap-4" wrap>
          <Stack direction="column" size="xs">
            <H3>Recent Join Legacy captures</H3>
            <Note className="text-sm">
              Leads from <code>/lineage/join</code>. Quick-action links open your email client with
              a pre-filled draft — send from the configured BBL mailbox.
            </Note>
          </Stack>
          <Badge variant="outline" size="sm">
            {captures.length} recent
          </Badge>
        </Stack>

        {captures.length === 0 ? (
          <Note className="text-sm">No Join Legacy captures yet.</Note>
        ) : (
          <div className="overflow-hidden rounded-md border">
            <div className="grid gap-3 border-b bg-muted/30 px-4 py-2 font-medium text-muted-foreground text-xs md:grid-cols-[1.1fr_1.2fr_0.7fr_0.7fr_auto]">
              <span>Name</span>
              <span>Email</span>
              <span>Path</span>
              <span>Submitted</span>
              <span>Actions</span>
            </div>
            <div className="divide-y">
              {captures.map(capture => {
                const name = formatCaptureName(capture)
                const membershipPath = readLeadMetaString(capture.meta, "membershipPath") ?? "FREE"

                return (
                  <div
                    key={capture.id}
                    className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1.1fr_1.2fr_0.7fr_0.7fr_auto]"
                  >
                    <span className="font-medium">{name}</span>
                    <span className="break-words font-mono text-xs">{capture.email}</span>
                    <span>{membershipPath}</span>
                    <span>{capture.createdAt.toLocaleDateString()}</span>
                    <Stack size="xs" wrap>
                      {capture.email && (
                        <>
                          <Button
                            size="xs"
                            variant="secondary"
                            render={
                              <a
                                href={buildMailto(
                                  capture.email,
                                  "Welcome to Black Belt Legacy",
                                  `Osss ${name},\n\nWelcome to Black Belt Legacy — we're excited to have you here.\n\nReply to this email if you have any questions.\n\nOsss,\nThe Black Belt Legacy Team`,
                                )}
                              />
                            }
                          >
                            Welcome
                          </Button>
                          <Button
                            size="xs"
                            variant="secondary"
                            render={<Link href={`/app/leads/${capture.id}`} />}
                          >
                            Open lead
                          </Button>
                        </>
                      )}
                    </Stack>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Stack>
    </Card>
  )
}
