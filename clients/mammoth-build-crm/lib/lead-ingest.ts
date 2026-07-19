/**
 * Lead-sheet ingestion — pure parse + dedupe rules (SESSION_0577, G-021 tracer).
 *
 * Turns a pasted/uploaded CSV or JSON lead sheet into normalized preview rows
 * and a dedupe report. Pure by design: nothing here writes the DB — the import
 * COMMIT (SESSION_0582) re-runs these same rules server-side via
 * lib/lead-commit.ts and writes behind an explicit confirm. No parsing
 * dependency: the CSV state machine below covers quoted fields, escaped
 * quotes, and CRLF — all a lead sheet export needs.
 *
 * Dedupe is CRM-GLOBAL on purpose, same SCOPE as `findOrCreateContact`'s global
 * dedupe in lib/actions.ts — and since SESSION_0582 the same MATCHING too:
 * preview and write path (`findOrCreateContact` / `commitLeadSheet`) both
 * consume the ONE matcher in lib/contact-match.ts (case-insensitive email +
 * normalized last-10-digit phone). Doug SESSION_0577 finding #1 resolved by
 * widening the write path (operator ratification 2026-07-19).
 */

import { emailKey, phoneKey } from "./contact-match";
import { normalizeLeadSource, type LeadSourceValue } from "./lead-source";

export type LeadSheetFormat = "csv" | "json";

/** One normalized data row of the sheet (rowNumber is 1-based, header excluded). */
export type LeadSheetRow = {
  companyName: string;
  email: string;
  issues: string[];
  name: string;
  notes: string;
  phone: string;
  rowNumber: number;
  source: LeadSourceValue;
  /** The sheet's original source spelling (shown when it didn't map cleanly). */
  sourceRaw: string;
};

export type LeadSheetParseResult = {
  /** Sheet-level problems (bad JSON, no recognizable columns…). Rows may still be partial. */
  errors: string[];
  format: LeadSheetFormat;
  rows: LeadSheetRow[];
};

export type DedupeStatus = "new" | "duplicate_in_sheet" | "existing_contact";

/** The minimal contact projection the dedupe pass needs — never full CRM bodies. */
export type ExistingContact = {
  email: string;
  id: string;
  name: string;
  phone: string | null;
};

export type DedupeMatch =
  | { kind: "contact"; contactId: string; contactName: string }
  | { kind: "sheet"; rowNumber: number };

export type DedupedLeadRow = LeadSheetRow & {
  match: DedupeMatch | null;
  status: DedupeStatus;
};

export type LeadDedupeReport = {
  counts: Record<DedupeStatus, number>;
  rows: DedupedLeadRow[];
};

/** Cap a pasted sheet at a tracer-sane size; larger sheets truncate with an error. */
export const MAX_SHEET_ROWS = 500;

// ---------------------------------------------------------------------------
// Column mapping
// ---------------------------------------------------------------------------

type ColumnKey = "companyName" | "email" | "name" | "notes" | "phone" | "source";

/** Header/key spellings a sheet may use, normalized to [a-z0-9] runs. */
const COLUMN_ALIASES: Record<ColumnKey, string[]> = {
  companyName: ["company", "companyname", "business", "organization", "account"],
  email: ["email", "emailaddress", "mail"],
  name: ["name", "fullname", "contact", "contactname", "lead", "leadname"],
  notes: ["notes", "note", "comments", "comment", "message", "details"],
  phone: ["phone", "phonenumber", "tel", "telephone", "mobile", "cell"],
  source: ["source", "leadsource", "channel", "origin"],
};

const ALIAS_TO_COLUMN: ReadonlyMap<string, ColumnKey> = new Map(
  (Object.keys(COLUMN_ALIASES) as ColumnKey[]).flatMap((key) =>
    COLUMN_ALIASES[key].map((alias) => [alias, key] as const),
  ),
);

function normalizeKey(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function matchColumn(rawKey: string): ColumnKey | null {
  return ALIAS_TO_COLUMN.get(normalizeKey(rawKey)) ?? null;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/** Auto-detects JSON (leading `[` / `{`) vs CSV and parses accordingly. */
export function parseLeadSheet(text: string): LeadSheetParseResult {
  const trimmed = text.trim();
  if (!trimmed) return { errors: ["The sheet is empty."], format: "csv", rows: [] };
  return trimmed.startsWith("[") || trimmed.startsWith("{")
    ? parseJsonSheet(trimmed)
    : parseCsvSheet(trimmed);
}

function parseJsonSheet(text: string): LeadSheetParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return { errors: [`Not valid JSON: ${detail}`], format: "json", rows: [] };
  }
  const records = Array.isArray(parsed) ? parsed : null;
  if (!records) {
    return { errors: ["JSON sheets must be an array of lead objects."], format: "json", rows: [] };
  }

  const errors: string[] = [];
  const rows: LeadSheetRow[] = [];
  for (const [index, record] of capRows(records, errors).entries()) {
    if (typeof record !== "object" || record === null || Array.isArray(record)) {
      errors.push(`Entry ${index + 1} is not an object — skipped.`);
      continue;
    }
    rows.push(buildRow(jsonRecordFields(record), index + 1));
  }
  if (rows.length === 0 && errors.length === 0) errors.push("The sheet has no lead entries.");
  return { errors, format: "json", rows };
}

/** Map a JSON lead object's keys onto known columns (first alias match wins). */
function jsonRecordFields(record: object): Partial<Record<ColumnKey, string>> {
  const fields: Partial<Record<ColumnKey, string>> = {};
  for (const [key, value] of Object.entries(record)) {
    const column = matchColumn(key);
    if (column && fields[column] === undefined && value !== null && value !== undefined) {
      fields[column] = String(value);
    }
  }
  return fields;
}

function parseCsvSheet(text: string): LeadSheetParseResult {
  const table = parseCsv(text);
  const errors: string[] = [];
  const [header, ...dataRows] = table;
  if (!header) return { errors: ["The sheet is empty."], format: "csv", rows: [] };

  const columns = header.map(matchColumn);
  if (!columns.some((column) => column !== null)) {
    return {
      errors: [
        "No recognizable columns. Expected headers like: Name, Email, Phone, Company, Lead Source, Notes.",
      ],
      format: "csv",
      rows: [],
    };
  }

  const rows = capRows(dataRows, errors)
    .filter((cells) => cells.some((cell) => cell.trim() !== ""))
    .map((cells, index) => {
      const fields: Partial<Record<ColumnKey, string>> = {};
      columns.forEach((column, cellIndex) => {
        if (column && fields[column] === undefined) fields[column] = cells[cellIndex] ?? "";
      });
      return buildRow(fields, index + 1);
    });
  if (rows.length === 0) errors.push("The sheet has a header but no lead rows.");
  return { errors, format: "csv", rows };
}

function capRows<T>(records: T[], errors: string[]): T[] {
  if (records.length <= MAX_SHEET_ROWS) return records;
  errors.push(
    `Sheet has ${records.length} rows — previewing the first ${MAX_SHEET_ROWS}. Split larger sheets.`,
  );
  return records.slice(0, MAX_SHEET_ROWS);
}

/** Minimal CSV state machine: quoted fields, `""` escapes, CRLF/LF, skips blank lines. */
function parseCsv(text: string): string[][] {
  const table: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
  };
  const pushRow = () => {
    pushCell();
    if (row.length > 1 || row[0]?.trim() !== "") table.push(row);
    row = [];
  };

  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      pushCell();
    } else if (char === "\n") {
      pushRow();
    } else if (char !== "\r") {
      cell += char;
    }
  }
  if (cell !== "" || row.length > 0) pushRow();
  return table;
}

function rowIssues(
  row: Pick<LeadSheetRow, "email" | "name" | "phone" | "sourceRaw">,
  sourceMatched: boolean,
): string[] {
  const issues: string[] = [];
  if (!row.name) issues.push("Missing name.");
  if (!row.email && !row.phone) issues.push("No email or phone — can't be contacted or deduped.");
  if (row.email && !row.email.includes("@")) issues.push("Email looks invalid.");
  if (!sourceMatched) issues.push(`Unrecognized Lead Source "${row.sourceRaw}" — mapped to Other.`);
  return issues;
}

function buildRow(fields: Partial<Record<ColumnKey, string>>, rowNumber: number): LeadSheetRow {
  const name = (fields.name ?? "").trim();
  const email = (fields.email ?? "").trim();
  const phone = (fields.phone ?? "").trim();
  const sourceRaw = (fields.source ?? "").trim();
  const source = normalizeLeadSource(sourceRaw);

  return {
    companyName: (fields.companyName ?? "").trim(),
    email,
    issues: rowIssues({ email, name, phone, sourceRaw }, source.matched),
    name,
    notes: (fields.notes ?? "").trim(),
    phone,
    rowNumber,
    source: source.value,
    sourceRaw,
  };
}

// ---------------------------------------------------------------------------
// Dedupe (matching keys live in lib/contact-match.ts — shared with the write path)
// ---------------------------------------------------------------------------

/** Lookup state for one dedupe pass: the CRM index plus keys seen in the sheet. */
type DedupeIndex = {
  contactByEmail: Map<string, ExistingContact>;
  contactByPhone: Map<string, ExistingContact>;
  sheetByKey: Map<string, number>;
};

function buildContactIndex(existingContacts: ExistingContact[]): DedupeIndex {
  const index: DedupeIndex = {
    contactByEmail: new Map(),
    contactByPhone: new Map(),
    sheetByKey: new Map(),
  };
  for (const contact of existingContacts) {
    const byEmail = emailKey(contact.email);
    const byPhone = phoneKey(contact.phone);
    if (byEmail && !index.contactByEmail.has(byEmail)) index.contactByEmail.set(byEmail, contact);
    if (byPhone && !index.contactByPhone.has(byPhone)) index.contactByPhone.set(byPhone, contact);
  }
  return index;
}

/**
 * Classify one row. Precedence: existing CRM contact (email, then phone) beats
 * duplicate-in-sheet beats new. Only NEW rows register their keys in
 * `sheetByKey`, so every later duplicate points at the first importable
 * occurrence.
 */
function findContactMatch(
  index: DedupeIndex,
  byEmail: string | null,
  byPhone: string | null,
): ExistingContact | null {
  return (
    (byEmail && index.contactByEmail.get(byEmail)) ||
    (byPhone && index.contactByPhone.get(byPhone)) ||
    null
  );
}

function findPriorSheetRow(
  index: DedupeIndex,
  byEmail: string | null,
  byPhone: string | null,
): number | undefined {
  return (
    (byEmail !== null ? index.sheetByKey.get(`e:${byEmail}`) : undefined) ??
    (byPhone !== null ? index.sheetByKey.get(`p:${byPhone}`) : undefined)
  );
}

function classifyRow(row: LeadSheetRow, index: DedupeIndex): DedupedLeadRow {
  const byEmail = emailKey(row.email);
  const byPhone = phoneKey(row.phone);

  const contact = findContactMatch(index, byEmail, byPhone);
  if (contact) {
    return {
      ...row,
      match: { contactId: contact.id, contactName: contact.name, kind: "contact" },
      status: "existing_contact",
    };
  }

  const priorRowNumber = findPriorSheetRow(index, byEmail, byPhone);
  if (priorRowNumber !== undefined) {
    return { ...row, match: { kind: "sheet", rowNumber: priorRowNumber }, status: "duplicate_in_sheet" };
  }

  if (byEmail) index.sheetByKey.set(`e:${byEmail}`, row.rowNumber);
  if (byPhone) index.sheetByKey.set(`p:${byPhone}`, row.rowNumber);
  return { ...row, match: null, status: "new" };
}

/** Classify each sheet row against the CRM contact index and the sheet itself. */
export function dedupeLeadRows(
  rows: LeadSheetRow[],
  existingContacts: ExistingContact[],
): LeadDedupeReport {
  const index = buildContactIndex(existingContacts);
  const counts: Record<DedupeStatus, number> = {
    duplicate_in_sheet: 0,
    existing_contact: 0,
    new: 0,
  };
  const deduped = rows.map((row) => {
    const classified = classifyRow(row, index);
    counts[classified.status]++;
    return classified;
  });
  return { counts, rows: deduped };
}
