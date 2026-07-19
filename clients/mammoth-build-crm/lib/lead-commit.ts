/**
 * Lead-sheet import COMMIT planning — pure rules (SESSION_0582, G-021 loop 2).
 *
 * Given the RAW sheet text (the server re-runs parse + dedupe itself — it never
 * trusts client-shaped rows) and the CRM contact index, produce the exact
 * writes the commit performs: one Contact + one lead-stage Project per NEW row,
 * mirroring `createProject` semantics so imported leads land on the pipeline
 * and the Today queue. Matched rows (already in CRM, or duplicate within the
 * sheet) are SKIPPED and reported — no enrichment, no overwrites (operator
 * ratification 2026-07-19 #2; enrich-blanks is a ledgered later loop).
 *
 * Rows with no dedupe key (no valid email or phone) are REFUSED with a per-row
 * error rather than imported: they could never be deduped, so committing them
 * would break the idempotency contract ("the same sheet twice = second run all
 * skipped").
 *
 * RETENTION LAW: sheet contents flow only to the CRM DB via the executing
 * action. Errors reference row numbers, not lead details, so the report is
 * safe to display anywhere.
 */

import { emailKey, phoneKey } from "./contact-match";
import {
  dedupeLeadRows,
  parseLeadSheet,
  type ExistingContact,
  type LeadSheetFormat,
  type LeadSheetRow,
} from "./lead-ingest";
import type { LeadSourceValue } from "./lead-source";

/** The standard first-touch task every new lead gets (same as `createProject`). */
export const FIRST_TOUCH_NEXT_TASK = "First-touch follow-up within 24h";

/**
 * A row the commit will actually write: it carries at least one dedupe key.
 * Shared with the confirm UI so the "Import N leads" promise counts exactly
 * what the plan will accept (Doug SESSION_0582 P3-1).
 */
export const isImportableLeadRow = (row: { email: string; phone: string }): boolean =>
  emailKey(row.email) !== null || phoneKey(row.phone) !== null;

/** One planned write: the Contact row + its lead Project (owner/contactId added by the action). */
export type PlannedLeadCreate = {
  contact: {
    email: string;
    name: string;
    phone: string | null;
    source: LeadSourceValue;
  };
  project: {
    buildingType: string;
    name: string;
    nextTask: string;
    notes: string;
    orderConfirmed: boolean;
    region: string;
    source: LeadSourceValue;
    stage: "lead";
    use: string;
  };
  rowNumber: number;
};

export type LeadCommitPlan = {
  creates: PlannedLeadCreate[];
  errors: string[];
  skippedDuplicates: number;
};

/** What the commit action returns to the confirm UI. */
export type LeadCommitReport = {
  created: number;
  errors: string[];
  skippedDuplicates: number;
};

/**
 * Re-parse + re-dedupe the raw sheet against the CRM index and plan the writes.
 * `format` is the format the operator previewed — a mismatch (edited paste,
 * forged request) refuses the whole commit rather than importing something the
 * operator never saw.
 */
export function planLeadCommit(
  text: string,
  format: LeadSheetFormat,
  existingContacts: ExistingContact[],
): LeadCommitPlan {
  const parse = parseLeadSheet(text);
  if (parse.format !== format) {
    return {
      creates: [],
      errors: [
        `The sheet parsed as ${parse.format.toUpperCase()} but the preview was ${String(
          format,
        ).toUpperCase()} — re-run the preview before importing.`,
      ],
      skippedDuplicates: 0,
    };
  }

  const report = dedupeLeadRows(parse.rows, existingContacts);
  const errors = [...parse.errors];
  const creates: PlannedLeadCreate[] = [];
  let skippedDuplicates = 0;

  for (const row of report.rows) {
    if (row.status !== "new") {
      skippedDuplicates++;
      continue;
    }
    if (!isImportableLeadRow(row)) {
      errors.push(
        `Row ${row.rowNumber}: no valid email or phone — not imported (it could never be deduped).`,
      );
      continue;
    }
    creates.push(plannedCreate(row));
  }

  return { creates, errors, skippedDuplicates };
}

function plannedCreate(row: LeadSheetRow): PlannedLeadCreate {
  const name = row.name || "Unknown";
  return {
    contact: {
      email: row.email,
      name,
      phone: row.phone || null,
      source: row.source,
    },
    project: {
      buildingType: "",
      name: row.companyName ? `${name} — ${row.companyName}` : name,
      nextTask: FIRST_TOUCH_NEXT_TASK,
      notes: row.notes,
      orderConfirmed: false,
      region: "",
      source: row.source,
      stage: "lead",
      use: "",
    },
    rowNumber: row.rowNumber,
  };
}
