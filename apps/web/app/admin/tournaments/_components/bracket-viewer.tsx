"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { H3 } from "~/components/common/heading"
import { MatchResult } from "~/.generated/prisma/browser"
import { scoreMatch } from "~/server/admin/tournaments/actions"
import type {
  BracketWithMatches,
  MatchWithCompetitors,
} from "~/server/admin/tournaments/bracket-queries"

// -----------------------------------------------------------------------------
// Score match dialog (inline form)
// -----------------------------------------------------------------------------

function ScoreMatchForm({
  match,
  onClose,
}: {
  match: MatchWithCompetitors
  onClose: () => void
}) {
  const [winnerEntryId, setWinnerEntryId] = useState("")
  const [result, setResult] = useState<string>("WIN_POINTS")
  const [notes, setNotes] = useState("")
  const [isPending, setIsPending] = useState(false)

  const competitors = match.competitors

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    try {
      const res = await scoreMatch({
        matchId: match.id,
        winnerEntryId,
        result: result as any,
        notes: notes || undefined,
      })
      if (res?.data) {
        toast.success(
          `Match scored — ${res.data.advancement ? "winner advanced to next round" : "bracket champion determined!"}`,
        )
        onClose()
      } else if (res?.serverError) {
        toast.error(res.serverError)
      }
    } catch (err: any) {
      toast.error(err.message ?? "Failed to score match")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border bg-card p-4 space-y-3 mt-2"
    >
      <div className="text-sm font-medium">Score Match</div>

      {/* Winner selection */}
      <fieldset className="space-y-1">
        <legend className="text-xs text-muted-foreground">Winner</legend>
        {competitors.map((c) => (
          <label key={c.id} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="winner"
              value={c.registrationEntryId}
              checked={winnerEntryId === c.registrationEntryId}
              onChange={() => setWinnerEntryId(c.registrationEntryId)}
            />
            <span>
              Slot {c.slot}:{" "}
              {c.registrationEntry.registration.user.name ?? "Unknown"}
            </span>
          </label>
        ))}
      </fieldset>

      {/* Result type */}
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Result</span>
        <select
          value={result}
          onChange={(e) => setResult(e.target.value)}
          className="block w-full rounded border bg-background px-2 py-1 text-sm"
        >
          {Object.values(MatchResult).map((r) => (
            <option key={r} value={r}>
              {r.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </label>

      {/* Notes */}
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Notes (optional)</span>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="block w-full rounded border bg-background px-2 py-1 text-sm"
        />
      </label>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!winnerEntryId || isPending}>
          {isPending ? "Saving…" : "Save Score"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

// -----------------------------------------------------------------------------
// Match card
// -----------------------------------------------------------------------------

function MatchCard({ match }: { match: MatchWithCompetitors }) {
  const [showScoring, setShowScoring] = useState(false)
  const canScore =
    match.status === "SCHEDULED" || match.status === "IN_PROGRESS"
  const isBye = match.status === "BYE"
  const isCompleted = match.status === "COMPLETED"

  return (
    <div
      className={`rounded-lg border p-3 space-y-1 text-sm ${
        isCompleted
          ? "border-green-500/40 bg-green-50 dark:bg-green-950/20"
          : isBye
            ? "border-amber-500/40 bg-amber-50 dark:bg-amber-950/20"
            : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          Match {match.matchNumber}
        </span>
        <Badge
          variant="soft"
          className={
            isCompleted
              ? "text-green-700"
              : isBye
                ? "text-amber-700"
                : undefined
          }
        >
          {match.status}
        </Badge>
      </div>

      {match.competitors.map((c) => {
        const isWinner = match.winnerEntryId === c.registrationEntryId
        return (
          <div
            key={c.id}
            className={`flex items-center gap-2 ${isWinner ? "font-semibold" : ""}`}
          >
            <span className="w-4 text-xs text-muted-foreground">
              {c.slot}
            </span>
            <span>
              {c.registrationEntry.registration.user.name ?? "Unknown"}
            </span>
            {isWinner && <span className="text-green-600 text-xs">✓</span>}
          </div>
        )
      })}

      {isBye && match.competitors.length === 1 && (
        <div className="text-xs text-amber-600">BYE — auto-advanced</div>
      )}

      {isCompleted && match.result && (
        <div className="text-xs text-muted-foreground">
          Result: {match.result.replace(/_/g, " ")}
        </div>
      )}

      {canScore && match.competitors.length === 2 && (
        <>
          {!showScoring ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowScoring(true)}
              className="mt-1"
            >
              Score
            </Button>
          ) : (
            <ScoreMatchForm
              match={match}
              onClose={() => setShowScoring(false)}
            />
          )}
        </>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Bracket viewer (round-by-round columns)
// -----------------------------------------------------------------------------

export function BracketViewer({ bracket }: { bracket: BracketWithMatches }) {
  // Group matches by round
  const matchesByRound = new Map<number, MatchWithCompetitors[]>()
  for (const match of bracket.matches) {
    const existing = matchesByRound.get(match.roundNumber) ?? []
    existing.push(match)
    matchesByRound.set(match.roundNumber, existing)
  }

  const rounds = Array.from(matchesByRound.entries()).sort(
    ([a], [b]) => a - b,
  )
  const totalRounds = rounds.length

  const roundLabel = (round: number) => {
    if (round === totalRounds) return "Final"
    if (round === totalRounds - 1 && totalRounds > 2) return "Semi-Finals"
    if (round === totalRounds - 2 && totalRounds > 3) return "Quarter-Finals"
    return `Round ${round}`
  }

  return (
    <div className="space-y-4">
      <H3>{bracket.name}</H3>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {rounds.map(([roundNum, matches]) => (
          <div key={roundNum} className="shrink-0 w-64 space-y-3">
            <div className="text-sm font-medium text-center border-b pb-1">
              {roundLabel(roundNum)}
            </div>
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
