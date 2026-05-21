"use client"

import { useEffect, useMemo } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/common/form"
import { Input } from "~/components/common/input"
import { Label } from "~/components/common/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/** 3 knockdowns/disarms = TKO */
export const TKO_THRESHOLD = 3

/** Eskrima/WEKAF default rounds */
export const ESKRIMA_DEFAULT_ROUNDS = 3

/** Scoring guide tooltips */
const SCORE_GUIDE = {
  "10-9": "Close round — slight edge",
  "10-8": "Dominant round — clear winner",
  "10-7": "Runaway round — maximum gap (floor)",
  "10-10": "Even round — draw",
}

// -----------------------------------------------------------------------------
// 10-Point Must scoring form
// -----------------------------------------------------------------------------

type TenPointMustFormProps = {
  /** Number of regulation rounds (default 3 for Eskrima, configurable 3-12) */
  roundCount?: number
  /** Competitor names for column headers */
  competitor1Name: string
  competitor2Name: string
  /** Called when auto-TKO is detected */
  onTkoDetected?: (competitorIndex: 1 | 2) => void
}

export function TenPointMustForm({
  roundCount = ESKRIMA_DEFAULT_ROUNDS,
  competitor1Name,
  competitor2Name,
  onTkoDetected,
}: TenPointMustFormProps) {
  const { control, setValue } = useFormContext()

  const { fields, replace } = useFieldArray({
    control,
    name: "scoreData.rounds",
  })

  // Initialize rounds if empty
  useEffect(() => {
    if (fields.length === 0) {
      const defaultRounds = Array.from({ length: roundCount }, () => ({
        competitor1Score: 10,
        competitor2Score: 10,
        competitor1Deductions: 0,
        competitor2Deductions: 0,
        competitor1Knockdowns: 0,
        competitor2Knockdowns: 0,
      }))
      replace(defaultRounds)
    }
  }, [roundCount, fields.length, replace])

  // Watch all rounds for auto-totals and TKO detection
  const rounds = useWatch({ control, name: "scoreData.rounds" }) ?? []

  // Compute totals
  const totals = useMemo(() => {
    let c1Score = 0
    let c2Score = 0
    let c1Knockdowns = 0
    let c2Knockdowns = 0

    for (const round of rounds) {
      if (!round) continue
      c1Score += (round.competitor1Score ?? 10) - (round.competitor1Deductions ?? 0)
      c2Score += (round.competitor2Score ?? 10) - (round.competitor2Deductions ?? 0)
      c1Knockdowns += round.competitor1Knockdowns ?? 0
      c2Knockdowns += round.competitor2Knockdowns ?? 0
    }

    return { c1Score, c2Score, c1Knockdowns, c2Knockdowns }
  }, [rounds])

  // Update total knockdowns on the parent form
  useEffect(() => {
    setValue("scoreData.competitor1TotalKnockdowns", totals.c1Knockdowns)
    setValue("scoreData.competitor2TotalKnockdowns", totals.c2Knockdowns)
  }, [totals.c1Knockdowns, totals.c2Knockdowns, setValue])

  // Auto-TKO detection
  useEffect(() => {
    if (totals.c1Knockdowns >= TKO_THRESHOLD) {
      onTkoDetected?.(1)
    } else if (totals.c2Knockdowns >= TKO_THRESHOLD) {
      onTkoDetected?.(2)
    }
  }, [totals.c1Knockdowns, totals.c2Knockdowns, onTkoDetected])

  const isDraw = totals.c1Score === totals.c2Score

  return (
    <div className="space-y-3">
      {/* Scoring guide */}
      <div className="flex flex-wrap gap-1">
        {Object.entries(SCORE_GUIDE).map(([score, desc]) => (
          <Tooltip key={score}>
            <TooltipTrigger
              render={
                <Badge variant="outline" size="sm" className="cursor-help">
                  {score}
                </Badge>
              }
            />
            <TooltipContent>{desc}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Round rows */}
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground text-center">
          <div>Round</div>
          <div className="truncate">{competitor1Name}</div>
          <div className="truncate">{competitor2Name}</div>
          <div>
            <Tooltip>
              <TooltipTrigger render={<span className="cursor-help">KD/D ①</span>} />
              <TooltipContent>Knockdowns (Boxing/MT) or Disarms (Eskrima)</TooltipContent>
            </Tooltip>
          </div>
          <div>
            <Tooltip>
              <TooltipTrigger render={<span className="cursor-help">KD/D ②</span>} />
              <TooltipContent>Knockdowns (Boxing/MT) or Disarms (Eskrima)</TooltipContent>
            </Tooltip>
          </div>
          <div>
            <Tooltip>
              <TooltipTrigger render={<span className="cursor-help">Ded ①</span>} />
              <TooltipContent>Foul point deductions</TooltipContent>
            </Tooltip>
          </div>
          <div>
            <Tooltip>
              <TooltipTrigger render={<span className="cursor-help">Ded ②</span>} />
              <TooltipContent>Foul point deductions</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {fields.map((field, index) => (
          <Card key={field.id} hover={false} className="p-2">
            <div className="grid grid-cols-7 gap-1 items-center">
              <Label className="text-center text-xs">
                {index === roundCount ? "OT" : index + 1}
              </Label>

              <FormField
                control={control}
                name={`scoreData.rounds.${index}.competitor1Score`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        min={7}
                        max={10}
                        size="sm"
                        className="text-center"
                        {...f}
                        onChange={e => f.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`scoreData.rounds.${index}.competitor2Score`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        min={7}
                        max={10}
                        size="sm"
                        className="text-center"
                        {...f}
                        onChange={e => f.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`scoreData.rounds.${index}.competitor1Knockdowns`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        size="sm"
                        className="text-center"
                        {...f}
                        onChange={e => f.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`scoreData.rounds.${index}.competitor2Knockdowns`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        size="sm"
                        className="text-center"
                        {...f}
                        onChange={e => f.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`scoreData.rounds.${index}.competitor1Deductions`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        size="sm"
                        className="text-center"
                        {...f}
                        onChange={e => f.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`scoreData.rounds.${index}.competitor2Deductions`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        size="sm"
                        className="text-center"
                        {...f}
                        onChange={e => f.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Totals */}
      <div className="grid grid-cols-7 gap-1 text-sm font-semibold text-center border-t pt-2">
        <div>Total</div>
        <div>{totals.c1Score}</div>
        <div>{totals.c2Score}</div>
        <div>{totals.c1Knockdowns}</div>
        <div>{totals.c2Knockdowns}</div>
        <div />
        <div />
      </div>

      {/* TKO warning */}
      {totals.c1Knockdowns >= TKO_THRESHOLD && (
        <Badge variant="danger" size="lg">
          ⚠ {competitor1Name} — {totals.c1Knockdowns} knockdowns/disarms — TKO suggested
        </Badge>
      )}
      {totals.c2Knockdowns >= TKO_THRESHOLD && (
        <Badge variant="danger" size="lg">
          ⚠ {competitor2Name} — {totals.c2Knockdowns} knockdowns/disarms — TKO suggested
        </Badge>
      )}

      {/* Draw → overtime prompt */}
      {isDraw && fields.length === roundCount && (
        <div className="space-y-2">
          <Badge variant="warning" size="lg">
            Draw on scorecard — 4th overtime round required (Eskrima/WEKAF)
          </Badge>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    replace([
                      ...rounds,
                      {
                        competitor1Score: 10,
                        competitor2Score: 10,
                        competitor1Deductions: 0,
                        competitor2Deductions: 0,
                        competitor1Knockdowns: 0,
                        competitor2Knockdowns: 0,
                      },
                    ])
                  }}
                >
                  Add Overtime Round
                </Button>
              }
            />
            <TooltipContent>
              In overtime, judges simply point to the winner of the 4th round to determine who
              advances
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Points scoring form (Karate, TKD, Fencing, BJJ, etc.)
// -----------------------------------------------------------------------------

type PointsScoreFormProps = {
  competitor1Name: string
  competitor2Name: string
}

export function PointsScoreForm({ competitor1Name, competitor2Name }: PointsScoreFormProps) {
  const { control } = useFormContext()

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={control}
          name="scoreData.competitor1Points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{competitor1Name}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="Points"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="scoreData.competitor2Points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{competitor2Name}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="Points"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
