"use client";

import Link from "next/link";
import { useProjects } from "@/lib/store";
import { ACTIVE_STAGES, getStage, nextStage } from "@/lib/stages";
import type { Project } from "@/lib/types";

function isAtRisk(p: Project): boolean {
  return p.stage !== "complete" && p.stage !== "lost" && p.nextTask.trim() === "";
}

export default function PipelinePage() {
  const { projects, hydrated, advance } = useProjects();

  if (!hydrated) {
    return <p className="text-muted">Loading pipeline…</p>;
  }

  const orders = projects.filter((p) => p.orderConfirmed).length;
  const atRisk = projects.filter(isAtRisk).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Pipeline</h1>
          <p className="text-sm text-muted">Lead → order. Nothing dropped.</p>
        </div>
        <Link
          href="/app/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg transition-colors hover:bg-primary-hover"
        >
          + New Job Order
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat label="Projects" value={projects.length} />
        <Stat label="Confirmed orders" value={orders} accent />
        <Stat label="At risk" value={atRisk} warn={atRisk > 0} />
      </div>

      <div className="mt-7 flex gap-4 overflow-x-auto pb-4">
        {ACTIVE_STAGES.map((stage) => {
          const inStage = projects.filter((p) => p.stage === stage.id);
          return (
            <div key={stage.id} className="w-72 shrink-0">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide">
                  {stage.label}
                </h2>
                <span className="text-xs text-muted">{inStage.length}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted">{stage.gate}</p>
              <div className="mt-3 space-y-3">
                {inStage.map((p) => {
                  const next = nextStage(p.stage);
                  return (
                    <div
                      key={p.id}
                      className="rounded-lg border border-border bg-surface p-3 transition-colors hover:border-primary"
                    >
                      <Link href={`/app/project/${p.id}`} className="font-medium hover:text-primary-hover">
                        {p.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">
                        {p.buildingType} · {p.region}
                      </p>
                      {p.orderNumber && (
                        <span className="mt-2 inline-block rounded bg-primary/15 px-1.5 py-0.5 text-[11px] font-medium text-primary-hover">
                          Order {p.orderNumber}
                        </span>
                      )}
                      <p
                        className={`mt-2 text-xs ${
                          isAtRisk(p) ? "font-medium text-primary-hover" : "text-muted"
                        }`}
                      >
                        {isAtRisk(p) ? "⚠ No next step — at risk" : `Next: ${p.nextTask}`}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <Link
                          href={`/app/project/${p.id}`}
                          className="text-xs text-muted underline hover:text-ink"
                        >
                          Open
                        </Link>
                        {next && (
                          <button
                            type="button"
                            onClick={() => advance(p.id)}
                            className="rounded border border-border px-2 py-1 text-xs transition-colors hover:border-primary hover:text-primary-hover"
                            title={`Advance to ${getStage(next).label}`}
                          >
                            Advance →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {inStage.length === 0 && (
                  <p className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted">
                    —
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: number;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p
        className={`font-display text-2xl font-bold ${
          accent ? "text-primary" : warn ? "text-primary-hover" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
