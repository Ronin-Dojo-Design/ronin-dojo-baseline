"use client"

import { CheckIcon, ShieldOffIcon } from "lucide-react"
import { Badge } from "~/components/common/badge"
import { H6 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Separator } from "~/components/common/separator"
import { Stack } from "~/components/common/stack"
import { passportDisplayName } from "~/lib/identity/passport-display"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"

function promoterName(
  rel: LineageNodeProfile["relationshipsTo"][number] | null | undefined,
): string | null {
  return passportDisplayName(rel?.fromNode.passport) ?? null
}

export function LineageTab({
  relationships,
}: {
  relationships: LineageNodeProfile["relationshipsTo"]
}) {
  // The first promoter is the primary lineage edge; any others are "also promoted
  // by" — secondary promoters. On View A these render as dashed slinks when both
  // cards are in the focal view; here they are always listed so an off-screen
  // secondary promoter stays discoverable (SESSION_0386, slice 0379-6).
  const primary = relationships[0] ?? null
  const secondaries = relationships.slice(1)
  const instructorName = promoterName(primary)

  return (
    <Stack direction="column" size="md" className="w-full">
      <section aria-label="Promotion lineage">
        <H6 className="mb-1 text-muted-foreground uppercase tracking-wide">Promotion Lineage</H6>
        {instructorName ? (
          <Stack direction="column" size="xs">
            <span className="text-sm font-medium">{instructorName}</span>
            <Stack size="xs" wrap>
              {primary?.isVerified ? (
                <Badge variant="success" size="sm" prefix={<CheckIcon />}>
                  Verified relationship
                </Badge>
              ) : (
                <Badge variant="outline" size="sm" prefix={<ShieldOffIcon />}>
                  Unverified relationship
                </Badge>
              )}
            </Stack>
            {primary?.description && <Note className="text-xs">{primary.description}</Note>}
          </Stack>
        ) : (
          <Note>No instructor relationship on record.</Note>
        )}
      </section>

      {secondaries.length > 0 && (
        <>
          <Separator />
          <section aria-label="Also promoted by">
            <H6 className="mb-1 text-muted-foreground uppercase tracking-wide">Also Promoted By</H6>
            <Stack direction="column" size="xs">
              {secondaries.map(rel => {
                const name = promoterName(rel)
                return (
                  <Stack key={rel.id} size="sm" wrap className="items-center">
                    <span className="text-sm font-medium">{name ?? "Unnamed"}</span>
                    {!rel.isVerified && (
                      <Badge variant="outline" size="sm" prefix={<ShieldOffIcon />}>
                        Unverified
                      </Badge>
                    )}
                  </Stack>
                )
              })}
            </Stack>
          </section>
        </>
      )}
    </Stack>
  )
}
