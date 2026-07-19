"use client";

/**
 * Lead intake — CSV/JSON lead-sheet ingestion PREVIEW + dedupe (SESSION_0577,
 * G-021 tracer slice A/B). Deliberately read-only: it parses a pasted or
 * uploaded sheet with the pure lib, dedupes against the CRM contact index, and
 * reports — it never imports. The import commit is a later loop slice, after
 * the operator reacts to this tracer.
 */

import { useEffect, useMemo, useState } from "react";
import { listLeadDedupeIndex } from "@/lib/actions";
import {
  dedupeLeadRows,
  parseLeadSheet,
  type DedupedLeadRow,
  type ExistingContact,
  type LeadDedupeReport,
  type LeadSheetParseResult,
} from "@/lib/lead-ingest";
import {
  SANITIZED_LEAD_SHEET_CSV,
  SANITIZED_LEAD_SHEET_JSON,
} from "@/lib/lead-ingest.fixtures";
import { leadSourceLabel } from "@/lib/lead-source";

const fieldClass =
  "w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs text-ink outline-none transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30";

const STATUS_LABELS: Record<DedupedLeadRow["status"], string> = {
  duplicate_in_sheet: "Duplicate in sheet",
  existing_contact: "Already in CRM",
  new: "New",
};

const STATUS_CLASSES: Record<DedupedLeadRow["status"], string> = {
  duplicate_in_sheet: "border-primary/60 text-primary",
  existing_contact: "border-border text-muted",
  new: "border-primary text-ink",
};

type PreviewState = {
  parse: LeadSheetParseResult;
  report: LeadDedupeReport;
};

export default function LeadIntakePage() {
  const [sheetText, setSheetText] = useState("");
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [existing, setExisting] = useState<ExistingContact[] | null>(null);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listLeadDedupeIndex()
      .then((contacts) => {
        if (!cancelled) setExisting(contacts);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setIndexError(
            error instanceof Error
              ? error.message
              : "The CRM contact index could not be loaded.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const contactIndexNote = useMemo(() => {
    if (existing) return `Deduping against ${existing.length} CRM contacts.`;
    if (indexError) return `CRM contact index unavailable — deduping within the sheet only. (${indexError})`;
    return "Loading the CRM contact index…";
  }, [existing, indexError]);

  // If a preview ran before the CRM index resolved, re-dedupe it once the index
  // arrives — otherwise CRM-known rows silently read "New" (Doug 0577 #2).
  useEffect(() => {
    if (!existing) return;
    setPreview((current) =>
      current ? { ...current, report: dedupeLeadRows(current.parse.rows, existing) } : current,
    );
  }, [existing]);

  function runPreview(text: string) {
    const parse = parseLeadSheet(text);
    setPreview({ parse, report: dedupeLeadRows(parse.rows, existing ?? []) });
  }

  function loadSample(sample: string) {
    setFileError(null);
    setSheetText(sample);
    runPreview(sample);
  }

  async function onFileChosen(file: File | undefined) {
    if (!file) return;
    setFileError(null);
    try {
      const text = await file.text();
      setSheetText(text);
      runPreview(text);
    } catch {
      setFileError(`Could not read ${file.name}.`);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Manual tracer</p>
      <h1 className="font-display text-2xl font-bold">Lead intake — preview + dedupe</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Paste or upload a CSV/JSON lead sheet to preview how it would land: column mapping, Lead
        Source, and duplicates (within the sheet and against the CRM). Nothing is imported —
        sanitized data only.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <section aria-labelledby="lead-sheet-input-heading">
          <h2 id="lead-sheet-input-heading" className="font-display text-lg font-bold">
            Lead sheet
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadSample(SANITIZED_LEAD_SHEET_CSV)}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:border-primary hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Load sanitized CSV sample
            </button>
            <button
              type="button"
              onClick={() => loadSample(SANITIZED_LEAD_SHEET_JSON)}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:border-primary hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Load sanitized JSON sample
            </button>
            <label className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:border-primary hover:text-ink">
              Upload .csv / .json
              <input
                type="file"
                accept=".csv,.json,text/csv,application/json"
                className="sr-only"
                onChange={(event) => void onFileChosen(event.target.files?.[0])}
              />
            </label>
          </div>
          {fileError ? (
            <p role="alert" className="mt-2 text-sm text-primary-hover">
              {fileError}
            </p>
          ) : null}
          <textarea
            value={sheetText}
            onChange={(event) => setSheetText(event.target.value)}
            rows={14}
            spellCheck={false}
            placeholder={"Name,Email,Phone,Company,Lead Source,Notes\n…"}
            aria-label="Lead sheet text"
            className={`mt-3 ${fieldClass}`}
          />
          <button
            type="button"
            onClick={() => runPreview(sheetText)}
            disabled={!sheetText.trim()}
            className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Preview + dedupe
          </button>
          <p className="mt-2 text-xs text-muted">{contactIndexNote}</p>
        </section>

        <section aria-labelledby="lead-preview-heading">
          <h2 id="lead-preview-heading" className="font-display text-lg font-bold">
            Preview
          </h2>
          {preview ? (
            <PreviewReport preview={preview} />
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-border p-5 text-sm text-muted">
              Load a sample or paste a sheet, then run the preview.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function PreviewReport({ preview }: { preview: PreviewState }) {
  const { parse, report } = preview;
  return (
    <div className="mt-3 space-y-4">
      {parse.errors.length > 0 ? (
        <ul role="alert" className="space-y-1 rounded-md border border-primary/60 bg-surface p-3 text-sm">
          {parse.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}

      {report.rows.length > 0 ? (
        <>
          <dl className="flex flex-wrap gap-2 text-sm">
            <CountChip label="New" value={report.counts.new} />
            <CountChip label="Duplicates in sheet" value={report.counts.duplicate_in_sheet} />
            <CountChip label="Already in CRM" value={report.counts.existing_contact} />
          </dl>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-3 py-2">#</th>
                  <th scope="col" className="px-3 py-2">Name</th>
                  <th scope="col" className="px-3 py-2">Email</th>
                  <th scope="col" className="px-3 py-2">Phone</th>
                  <th scope="col" className="px-3 py-2">Company</th>
                  <th scope="col" className="px-3 py-2">Lead Source</th>
                  <th scope="col" className="px-3 py-2">Status</th>
                  <th scope="col" className="px-3 py-2">Issues</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <PreviewRow key={row.rowNumber} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      <p className="text-xs text-muted">
        Preview only — nothing was imported. The import step is deliberately not built yet
        (G-021 boundary: no real lead data).
      </p>
    </div>
  );
}

function PreviewRow({ row }: { row: DedupedLeadRow }) {
  return (
    <tr className="border-t border-border align-top">
      <td className="px-3 py-2 text-muted">{row.rowNumber}</td>
      <td className="px-3 py-2">{row.name || <Missing />}</td>
      <td className="px-3 py-2">{row.email || <Missing />}</td>
      <td className="px-3 py-2">{row.phone || <Missing />}</td>
      <td className="px-3 py-2">{row.companyName || <Missing />}</td>
      <td className="px-3 py-2">{leadSourceLabel(row.source)}</td>
      <td className="px-3 py-2">
        <span
          className={`inline-block rounded-full border px-2 py-0.5 text-xs ${STATUS_CLASSES[row.status]}`}
        >
          {STATUS_LABELS[row.status]}
        </span>
        {row.match?.kind === "sheet" ? (
          <span className="mt-1 block text-xs text-muted">of row {row.match.rowNumber}</span>
        ) : null}
        {row.match?.kind === "contact" ? (
          <span className="mt-1 block text-xs text-muted">matches {row.match.contactName}</span>
        ) : null}
      </td>
      <td className="px-3 py-2 text-xs text-muted">
        {row.issues.length > 0 ? row.issues.join(" ") : "—"}
      </td>
    </tr>
  );
}

function CountChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function Missing() {
  return <span className="text-xs text-muted">—</span>;
}
