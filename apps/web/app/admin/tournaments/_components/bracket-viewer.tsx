"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { MatchResult } from "~/.generated/prisma/browser"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardFooter, CardHeader } from "~/components/common/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/common/dialog"
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
import { Label } from "~/components/common/label"
import { RadioGroup, RadioGroupItem } from "~/components/common/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
import { scoreMatch } from "~/server/admin/tournaments/actions"
import type {
  BracketWithMatches,
  MatchWithCompetitors,
} from "~/server/admin/tournaments/bracket-queries"
import { type ScoreMatchInput, scoreMatchSchema } from "~/server/admin/tournaments/schema"
import { PointsScoreForm, TenPointMustForm } from "./score-forms"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/** Result types that use 10-point must scoring */
const TEN_POINT_MUST_RESULTS = new Set(["WIN_DECISION", "WIN_KO_TKO"])

/** Result types that use points scoring */
const POINTS_RESULTS = new Set(["WIN_POINTS"])

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getCompetitorName(c: MatchWithCompetitors["competitors"][number]) {
  return (
    c.registrationEntry.registration.user.passport?.displayName ??
    c.registrationEntry.registration.user.name ??
    "Unknown"
  )
}

function getCompetitorAvatar(c: MatchWithCompetitors["competitors"][number]) {
  return c.registrationEntry.registration.user.passport?.avatarUrl ?? undefined
}

function getCompetitorOrg(c: MatchWithCompetitors["competitors"][number]) {
  return c.registrationEntry.representingMembership?.organization?.name ?? undefined
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const STATUS_TOOLTIPS: Record<string, string> = {
  SCHEDULED: "Waiting for match to begin",
  IN_PROGRESS: "Match is currently underway",
  COMPLETED: "Match finished — winner determined",
  BYE: "Auto-advanced — no opponent",
}

// -----------------------------------------------------------------------------
// Score match dialog
// -----------------------------------------------------------------------------

function ScoreMatchDialog({
  match,
  scoringMethod,
  children,
}: {
  match: MatchWithCompetitors
  scoringMethod: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  // Default result type based on scoring method
  const defaultResult = scoringMethod === "TEN_POINT_MUST" ? "WIN_DECISION" : "WIN_POINTS"

  const form = useForm<ScoreMatchInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Zod v4 .default() output type mismatch with RHF resolver
    resolver: zodResolver(scoreMatchSchema) as any,
    defaultValues: {
      matchId: match.id,
      winnerEntryId: "",
      result: defaultResult,
      notes: "",
    },
  })

  const onSubmit = async (values: ScoreMatchInput) => {
    try {
      const res = await scoreMatch(values)
      if (res?.data) {
        toast.success(
          res.data.advancement
            ? "Match scored — winner advanced to next round"
            : "Match scored — bracket champion determined!",
        )
        setOpen(false)
        form.reset()
      } else if (res?.serverError) {
        toast.error(res.serverError)
      }
    } catch (err: any) {
      toast.error(err.message ?? "Failed to score match")
    }
  }

  const selectedResult = form.watch("result")

  const handleTkoDetected = useCallback(
    (competitorIndex: 1 | 2) => {
      if (form.getValues("result") !== "WIN_KO_TKO") {
        form.setValue("result", "WIN_KO_TKO")
        toast.info(
          `Auto-TKO detected for competitor ${competitorIndex} — result set to KO/TKO (you can override)`,
        )
      }
    },
    [form],
  )

  const competitor1Name = match.competitors[0]
    ? getCompetitorName(match.competitors[0])
    : "Competitor 1"
  const competitor2Name = match.competitors[1]
    ? getCompetitorName(match.competitors[1])
    : "Competitor 2"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Score Match {match.matchNumber}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Winner selection */}
            <FormField
              control={form.control}
              name="winnerEntryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>Winner</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      {match.competitors.map(c => (
                        <div key={c.id} className="flex items-center gap-3">
                          <RadioGroupItem value={c.registrationEntryId} id={`winner-${c.id}`} />
                          <Label
                            htmlFor={`winner-${c.id}`}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Avatar className="size-6">
                              {getCompetitorAvatar(c) ? (
                                <AvatarImage
                                  src={getCompetitorAvatar(c)!}
                                  alt={getCompetitorName(c)}
                                />
                              ) : null}
                              <AvatarFallback>{getInitials(getCompetitorName(c))}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{getCompetitorName(c)}</span>
                            {getCompetitorOrg(c) && (
                              <Badge variant="soft" size="sm">
                                {getCompetitorOrg(c)}
                              </Badge>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Result type */}
            <FormField
              control={form.control}
              name="result"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Result</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select result type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(MatchResult).map(r => (
                        <SelectItem key={r} value={r}>
                          {r.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional score forms */}
            {TEN_POINT_MUST_RESULTS.has(selectedResult) && (
              <TenPointMustForm
                competitor1Name={competitor1Name}
                competitor2Name={competitor2Name}
                onTkoDetected={handleTkoDetected}
              />
            )}

            {POINTS_RESULTS.has(selectedResult) && (
              <PointsScoreForm
                competitor1Name={competitor1Name}
                competitor2Name={competitor2Name}
              />
            )}

            {/* Custom label for WIN_OTHER */}
            {selectedResult === "WIN_OTHER" && (
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>Custom result label</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Walkover, Technical Draw, etc."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes (hidden when WIN_OTHER since notes field is used for custom label) */}
            {selectedResult !== "WIN_OTHER" && (
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional match notes..."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving…" : "Save Score"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// -----------------------------------------------------------------------------
// Competitor row
// -----------------------------------------------------------------------------

function CompetitorRow({
  competitor,
  isWinner,
}: {
  competitor: MatchWithCompetitors["competitors"][number]
  isWinner: boolean
}) {
  const name = getCompetitorName(competitor)
  const avatarUrl = getCompetitorAvatar(competitor)
  const orgName = getCompetitorOrg(competitor)

  return (
    <div className={`flex items-center gap-2 ${isWinner ? "font-semibold" : ""}`}>
      <Avatar className="size-7">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
        <AvatarFallback className="text-[10px]">{getInitials(name)}</AvatarFallback>
      </Avatar>

      {name ? (
        <Tooltip>
          <TooltipTrigger render={<span className="text-sm truncate max-w-30">{name}</span>} />
          <TooltipContent>{name}</TooltipContent>
        </Tooltip>
      ) : (
        <span className="text-sm truncate max-w-30">{name}</span>
      )}

      {isWinner && <span className="text-green-600 text-xs">✓</span>}

      {orgName && (
        <Badge variant="soft" size="sm" className="ml-auto">
          {orgName}
        </Badge>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Match card
// -----------------------------------------------------------------------------

function MatchCard({
  match,
  scoringMethod,
}: {
  match: MatchWithCompetitors
  scoringMethod: string
}) {
  const canScore = match.status === "SCHEDULED" || match.status === "IN_PROGRESS"
  const isBye = match.status === "BYE"
  const isCompleted = match.status === "COMPLETED"

  const statusVariant = isCompleted ? "success" : isBye ? "warning" : ("soft" as const)

  return (
    <Card
      hover={false}
      className={
        isCompleted
          ? "border-green-500/40 bg-green-50 dark:bg-green-950/20"
          : isBye
            ? "border-amber-500/40 bg-amber-50 dark:bg-amber-950/20"
            : undefined
      }
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-xs text-muted-foreground">Match {match.matchNumber}</span>
          <Tooltip>
            <TooltipTrigger
              render={
                <Badge variant={statusVariant} size="sm">
                  {match.status}
                </Badge>
              }
            />
            <TooltipContent>{STATUS_TOOLTIPS[match.status] ?? match.status}</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <div className="space-y-1.5">
        {match.competitors.map(c => (
          <CompetitorRow
            key={c.id}
            competitor={c}
            isWinner={match.winnerEntryId === c.registrationEntryId}
          />
        ))}

        {isBye && match.competitors.length === 1 && (
          <Badge variant="warning" size="sm">
            BYE — auto-advanced
          </Badge>
        )}
      </div>

      <CardFooter>
        {isCompleted && match.result && (
          <Badge variant="outline" size="sm">
            {match.result.replace(/_/g, " ")}
          </Badge>
        )}

        {canScore && match.competitors.length === 2 && (
          <ScoreMatchDialog match={match} scoringMethod={scoringMethod}>
            <Button variant="secondary" size="sm">
              Score
            </Button>
          </ScoreMatchDialog>
        )}
      </CardFooter>
    </Card>
  )
}

// -----------------------------------------------------------------------------
// Bracket viewer (round-by-round columns)
// -----------------------------------------------------------------------------

export function BracketViewer({
  bracket,
  scoringMethod = "POINTS",
}: {
  bracket: BracketWithMatches
  scoringMethod?: string
}) {
  // Group matches by round
  const matchesByRound = new Map<number, MatchWithCompetitors[]>()
  for (const match of bracket.matches) {
    const existing = matchesByRound.get(match.roundNumber) ?? []
    existing.push(match)
    matchesByRound.set(match.roundNumber, existing)
  }

  const rounds = Array.from(matchesByRound.entries()).sort(([a], [b]) => a - b)
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
            {matches.map(match => (
              <MatchCard key={match.id} match={match} scoringMethod={scoringMethod} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
