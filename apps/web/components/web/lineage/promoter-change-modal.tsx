"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { type ReactElement, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/common/dialog"
import { Label } from "~/components/common/label"
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
import { updateLineagePromotionRelationship } from "~/server/web/lineage/editor-actions"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"

export type PromoterCandidate = {
  memberId: string
  label: string
}

export type PromoterChangeContext = {
  treeId: string
  memberId: string
  currentRankAwardId: string | null
  rankAwards: NonNullable<LineageNodeProfile["passport"]>["rankAwardsEarned"]
  candidates: PromoterCandidate[]
}

type PromoterChangeModalProps = {
  context: PromoterChangeContext
  memberName: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactElement | null
}

const CLEAR_PROMOTER = "__clear_promoter__"
const VERIFICATION_STATUSES = new Set(["PENDING", "VERIFIED", "DISPUTED"])

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Unknown date"
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return "Unknown date"
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export function PromoterChangeModal({
  context,
  memberName,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: PromoterChangeModalProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const [rankAwardId, setRankAwardId] = useState(
    context.currentRankAwardId ?? context.rankAwards[0]?.id ?? "",
  )
  const [promoterMemberId, setPromoterMemberId] = useState(context.candidates[0]?.memberId ?? "")
  const [verificationStatus, setVerificationStatus] = useState<"PENDING" | "VERIFIED" | "DISPUTED">(
    "PENDING",
  )
  const [auditNote, setAuditNote] = useState("")
  const [clientError, setClientError] = useState<string | null>(null)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const rankOptions = useMemo(
    () =>
      context.rankAwards.map(award => ({
        id: award.id,
        label: `${award.rank.name} (${formatDate(award.awardedAt)})`,
      })),
    [context.rankAwards],
  )

  const { execute, isExecuting } = useAction(updateLineagePromotionRelationship, {
    onSuccess: () => {
      toast.success("Promoter relationship updated.")
      setOpen(false)
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to update promoter relationship.")
    },
  })

  function submit() {
    setClientError(null)
    if (!rankAwardId) {
      setClientError("Select the rank award this promoter change verifies.")
      return
    }
    if (!promoterMemberId) {
      setClientError("Select a promoter or clear the existing promoter.")
      return
    }
    if (auditNote.trim().length < 10) {
      setClientError("Audit note must be at least 10 characters.")
      return
    }

    execute({
      treeId: context.treeId,
      memberId: context.memberId,
      promoterMemberId: promoterMemberId === CLEAR_PROMOTER ? null : promoterMemberId,
      rankAwardId,
      verificationStatus,
      auditNote,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger
          render={
            trigger ?? (
              <Button type="button" variant="secondary" size="sm">
                Change promoter...
              </Button>
            )
          }
        />
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change promoter</DialogTitle>
          <DialogDescription>
            Update the promotion relationship for {memberName}. This action writes an audit entry.
          </DialogDescription>
        </DialogHeader>

        <Stack direction="column" size="md">
          <Stack direction="column" size="xs">
            <Label htmlFor="promoter-rank-award">Rank award</Label>
            <Select
              value={rankAwardId}
              onValueChange={value => setRankAwardId(String(value))}
              items={Object.fromEntries(rankOptions.map(option => [option.id, option.label]))}
            >
              <SelectTrigger id="promoter-rank-award">
                <SelectValue placeholder="Select a rank award" />
              </SelectTrigger>
              <SelectContent>
                {rankOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Stack>

          <Stack direction="column" size="xs">
            <Label htmlFor="promoter-member">Promoter</Label>
            <Select
              value={promoterMemberId}
              onValueChange={value => setPromoterMemberId(String(value))}
              items={{
                [CLEAR_PROMOTER]: "Clear promoter",
                ...Object.fromEntries(
                  context.candidates.map(candidate => [candidate.memberId, candidate.label]),
                ),
              }}
            >
              <SelectTrigger id="promoter-member">
                <SelectValue placeholder="Select a promoter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CLEAR_PROMOTER}>Clear promoter</SelectItem>
                {context.candidates.map(candidate => (
                  <SelectItem key={candidate.memberId} value={candidate.memberId}>
                    {candidate.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Stack>

          <Stack direction="column" size="xs">
            <Label htmlFor="promoter-verification-status">Verification status</Label>
            <Select
              value={verificationStatus}
              onValueChange={value => {
                const next = String(value)
                if (VERIFICATION_STATUSES.has(next)) {
                  setVerificationStatus(next as "PENDING" | "VERIFIED" | "DISPUTED")
                }
              }}
              items={{ PENDING: "Pending", VERIFIED: "Verified", DISPUTED: "Disputed" }}
            >
              <SelectTrigger id="promoter-verification-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="DISPUTED">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </Stack>

          <Stack direction="column" size="xs">
            <Label htmlFor="promoter-audit-note">Audit note</Label>
            <TextArea
              id="promoter-audit-note"
              rows={4}
              value={auditNote}
              onChange={event => setAuditNote(event.target.value)}
              placeholder="Why is this promoter relationship being changed?"
            />
          </Stack>

          {clientError && <Note className="text-destructive text-sm">{clientError}</Note>}
        </Stack>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} isPending={isExecuting}>
            Save promoter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
