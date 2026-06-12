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

export function BblEmailCaptureList({ captures }: BblEmailCaptureListProps) {
  return (
    <Card hover={false} className="p-4">
      <Stack direction="column" className="gap-4">
        <Stack className="items-start justify-between gap-4" wrap>
          <Stack direction="column" size="xs">
            <H3>Recent Join Legacy captures</H3>
            <Note className="text-sm">
              Current-app replacement for the legacy WordPress EmailCaptureList. These are private
              leads from `/lineage/join`, not inbound email threads.
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
            <div className="grid gap-3 border-b bg-muted/30 px-4 py-2 font-medium text-muted-foreground text-xs md:grid-cols-[1.1fr_1.2fr_0.8fr_0.8fr_7rem]">
              <span>Name</span>
              <span>Email</span>
              <span>Path</span>
              <span>Submitted</span>
              <span>Action</span>
            </div>
            <div className="divide-y">
              {captures.map(capture => (
                <div
                  key={capture.id}
                  className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1.1fr_1.2fr_0.8fr_0.8fr_7rem]"
                >
                  <span className="font-medium">{formatCaptureName(capture)}</span>
                  <span className="break-words font-mono text-xs">{capture.email}</span>
                  <span>{readLeadMetaString(capture.meta, "membershipPath") ?? "FREE"}</span>
                  <span>{capture.createdAt.toLocaleDateString()}</span>
                  <Button
                    size="xs"
                    variant="secondary"
                    render={<Link href={`/admin/leads/${capture.id}`} />}
                  >
                    Open lead
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Stack>
    </Card>
  )
}
