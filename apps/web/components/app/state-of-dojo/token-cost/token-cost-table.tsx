/**
 * Token-cost accessible tables (SESSION_0608) — mirrors the kernel's `GoalLadderTable` raw-`<table>`
 * pattern (`../_kernel/projection.tsx`): a small, plain, screen-reader-friendly table is the right
 * weight here, not the heavier `components/common/table.tsx` grid-column primitive built for the
 * full data-table/AdminCollection system. Server-renderable (no client boundary needed).
 */
import type { ModelCostSummary, SessionCostDetail } from "~/lib/state-of-dojo/token-cost-parse"

/** Per-session totals — the chart's plain-table twin (visual chart, accessible table, same law as
 * `GoalLadders`/`GoalLadderTable`). */
export function TokenCostSessionTable({ sessions }: { sessions: SessionCostDetail[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-xs">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="border-b p-1.5">Session</th>
            <th className="border-b p-1.5">Input tok</th>
            <th className="border-b p-1.5">Output tok</th>
            <th className="border-b p-1.5">Cost</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.number}>
              <td className="border-b p-1.5 font-medium">
                #{s.number} <span className="text-muted-foreground">{s.title}</span>
              </td>
              <td className="border-b p-1.5">{s.totalInput.toLocaleString()}</td>
              <td className="border-b p-1.5">{s.totalOutput.toLocaleString()}</td>
              <td className="border-b p-1.5">${s.totalCostUsd.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Roll-up by model — the "$/token" reference facet (rates documented in
 * `docs/protocols/state-of-dojo-telemetry-schema.md`). */
export function TokenCostModelTable({ models }: { models: ModelCostSummary[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-xs">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="border-b p-1.5">Model</th>
            <th className="border-b p-1.5">Input tok</th>
            <th className="border-b p-1.5">Output tok</th>
            <th className="border-b p-1.5">Cost</th>
          </tr>
        </thead>
        <tbody>
          {models.map(m => (
            <tr key={m.model}>
              <td className="border-b p-1.5 font-medium">{m.model}</td>
              <td className="border-b p-1.5">{m.input.toLocaleString()}</td>
              <td className="border-b p-1.5">{m.output.toLocaleString()}</td>
              <td className="border-b p-1.5">${m.costUsd.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
