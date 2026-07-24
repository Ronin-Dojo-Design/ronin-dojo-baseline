"use client";

import { useState } from "react";
import { SEED_PROJECTS } from "@/lib/content";

/**
 * Ported from the recovered prod mock (SESSION_0638, G-019): the CRM-preview section that shows
 * the pipeline as marketing copy (verbatim mock chip labels — distinct from the internal
 * `lib/stages.ts` STAGES taxonomy, which uses longer product labels like "New Lead").
 */
const STAGE_CHIPS = [
  "Lead",
  "Qualified",
  "Design & Quote",
  "Contract",
  "Deposit · order confirmed",
  "Engineering",
  "Fabrication",
  "Delivery",
  "Complete",
];
const HIGHLIGHTED_CHIP = "Deposit · order confirmed";

// The mock's sample record is the same project seeded in `lib/content.ts` — reuse it instead of
// duplicating the numbers.
const sampleProject = SEED_PROJECTS[0];

function BeforeAfterSlider() {
  const [value, setValue] = useState(50);

  return (
    <div className="relative mx-auto mt-4 max-w-xl select-none overflow-hidden rounded-xl border border-border">
      {/* BEFORE: empty lot */}
      <svg viewBox="0 0 640 360" className="block w-full" role="img" aria-label="Empty site, day zero">
        <rect width="640" height="360" fill="#1a1d21" />
        <rect y="250" width="640" height="110" fill="#23272d" />
        <rect y="250" width="640" height="4" fill="#2a2e33" />
        <circle cx="540" cy="70" r="30" fill="#2a2e33" />
        <text x="24" y="300" fontFamily="sans-serif" fontSize="13" fill="#7b828b">
          Empty site · day 0
        </text>
      </svg>

      {/* AFTER: finished building, revealed left-to-right by the slider */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${value}%)` }}>
        <svg
          viewBox="0 0 640 360"
          className="block w-full"
          role="img"
          aria-label="Finished build, delivered"
        >
          <rect width="640" height="360" fill="#16181b" />
          <rect y="250" width="640" height="110" fill="#23272d" />
          <polygon points="120,150 320,70 520,150 520,170 320,92 120,170" fill="var(--primary)" />
          <rect x="120" y="166" width="400" height="92" fill="#2b3036" />
          <rect x="300" y="200" width="60" height="58" fill="#15171a" stroke="var(--primary)" strokeWidth="2" />
          <text x="24" y="300" fontFamily="sans-serif" fontSize="13" fill="#f4f5f6">
            Finished build · delivered
          </text>
        </svg>
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-primary"
        style={{ left: `${value}%` }}
      />
      <span className="pointer-events-none absolute bottom-2.5 left-2.5 rounded-md bg-black/55 px-2 py-1 text-[11px] font-bold uppercase tracking-wider">
        Before
      </span>
      <span className="pointer-events-none absolute bottom-2.5 right-2.5 rounded-md bg-black/55 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
        After
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label="Before and after slider"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

export function CrmPreview() {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STAGE_CHIPS.map((chip) => (
          <span
            key={chip}
            className={
              chip === HIGHLIGHTED_CHIP
                ? "rounded-full border border-primary bg-primary px-2.5 py-1 text-xs font-bold text-bg"
                : "rounded-full border border-border px-2.5 py-1 text-xs text-muted"
            }
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="mt-5 max-w-xl rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <strong className="font-semibold">{sampleProject.name}</strong>
          <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary-hover">
            ✓ Order {sampleProject.orderNumber}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-muted">
          {sampleProject.buildingType} · {sampleProject.region} · {sampleProject.width}×
          {sampleProject.length} · {sampleProject.eaveHeight}ft eave
        </p>
        <p className="mt-2 text-sm">
          <span className="text-muted">Next:</span> {sampleProject.nextTask}
        </p>
      </div>

      <h3 className="mt-9 font-display text-xl font-semibold">
        Before &amp; after proof — drag the slider
      </h3>
      <BeforeAfterSlider />
      <p className="mt-3 inline-block rounded-md border border-dashed border-border px-2.5 py-1 text-xs text-muted">
        Demo proof slider — in the live CRM these are the crew&apos;s real before/during/after photos on
        the project record.
      </p>
    </div>
  );
}
