import { describe, expect, test } from "bun:test";
import {
  MAX_SHEET_ROWS,
  dedupeLeadRows,
  parseLeadSheet,
  type LeadSheetRow,
} from "./lead-ingest";
import {
  SANITIZED_EXISTING_CONTACTS,
  SANITIZED_LEAD_SHEET_CSV,
  SANITIZED_LEAD_SHEET_JSON,
} from "./lead-ingest.fixtures";
import { normalizeLeadSource } from "./lead-source";

const row = (overrides: Partial<LeadSheetRow>): LeadSheetRow => ({
  companyName: "",
  email: "",
  issues: [],
  name: "Sanitized Lead",
  notes: "",
  phone: "",
  rowNumber: 1,
  source: "other",
  sourceRaw: "",
  ...overrides,
});

describe("normalizeLeadSource", () => {
  test("maps known spellings, tolerating case and separators", () => {
    expect(normalizeLeadSource("Referral")).toEqual({ matched: true, value: "referral" });
    expect(normalizeLeadSource("Web Form")).toEqual({ matched: true, value: "web_form" });
    expect(normalizeLeadSource("trade-show")).toEqual({ matched: true, value: "trade_show" });
    expect(normalizeLeadSource("Word of mouth")).toEqual({ matched: true, value: "referral" });
  });

  test("empty is silently Other; unrecognized is Other but flagged", () => {
    expect(normalizeLeadSource("")).toEqual({ matched: true, value: "other" });
    expect(normalizeLeadSource(undefined)).toEqual({ matched: true, value: "other" });
    expect(normalizeLeadSource("Facebook")).toEqual({ matched: false, value: "other" });
  });
});

describe("parseLeadSheet — CSV", () => {
  const result = parseLeadSheet(SANITIZED_LEAD_SHEET_CSV);

  test("parses every data row with mapped columns", () => {
    expect(result.format).toBe("csv");
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(8);
    expect(result.rows[0]).toMatchObject({
      companyName: "Rivera Ag Supply",
      email: "alex.rivera@example.com",
      name: "Alex Rivera",
      rowNumber: 1,
      source: "referral",
    });
  });

  test("handles quoted fields containing commas", () => {
    const finley = result.rows[7]!;
    expect(finley.name).toBe("Finley, Harper & Co");
    expect(finley.notes).toBe("Wants a Quonset, 40x60");
    expect(finley.source).toBe("trade_show");
  });

  test("flags rows without contact details and unrecognized sources", () => {
    expect(result.rows[4]!.issues).toContain("No email or phone — can't be contacted or deduped.");
    expect(result.rows[6]!.issues).toContain('Unrecognized Lead Source "Facebook" — mapped to Other.');
    expect(result.rows[6]!.source).toBe("other");
  });

  test("rejects a sheet with no recognizable columns", () => {
    const bad = parseLeadSheet("Foo,Bar\n1,2\n");
    expect(bad.rows).toEqual([]);
    expect(bad.errors[0]).toContain("No recognizable columns");
  });

  test("caps oversized sheets and says so", () => {
    const big = `Name,Email\n${Array.from(
      { length: MAX_SHEET_ROWS + 5 },
      (_, index) => `Lead ${index},lead${index}@example.com`,
    ).join("\n")}`;
    const capped = parseLeadSheet(big);
    expect(capped.rows).toHaveLength(MAX_SHEET_ROWS);
    expect(capped.errors[0]).toContain(`first ${MAX_SHEET_ROWS}`);
  });
});

describe("parseLeadSheet — JSON", () => {
  test("parses an array of lead objects with aliased keys", () => {
    const result = parseLeadSheet(SANITIZED_LEAD_SHEET_JSON);
    expect(result.format).toBe("json");
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(3);
    expect(result.rows[0]).toMatchObject({ name: "Alex Rivera", source: "referral" });
    expect(result.rows[1]).toMatchObject({ name: "Gray Sutton", source: "web_form" });
    expect(result.rows[2]).toMatchObject({ name: "Harlow Diaz", source: "other", issues: [] });
  });

  test("reports invalid JSON and non-array shapes as sheet errors", () => {
    expect(parseLeadSheet("[not json").errors[0]).toContain("Not valid JSON");
    expect(parseLeadSheet('{"leads": []}').errors[0]).toContain("array of lead objects");
  });
});

describe("dedupeLeadRows", () => {
  test("classifies the sanitized CSV fixture end to end", () => {
    const { rows } = parseLeadSheet(SANITIZED_LEAD_SHEET_CSV);
    const report = dedupeLeadRows(rows, SANITIZED_EXISTING_CONTACTS);

    expect(report.counts).toEqual({ duplicate_in_sheet: 2, existing_contact: 2, new: 4 });
    expect(report.rows.map((entry) => entry.status)).toEqual([
      "new",
      "new",
      "existing_contact",
      "duplicate_in_sheet",
      "new",
      "duplicate_in_sheet",
      "existing_contact",
      "new",
    ]);
  });

  test("matches sheet duplicates case-insensitively on email, pointing at the first occurrence", () => {
    const report = dedupeLeadRows(
      [
        row({ email: "lead@example.com", rowNumber: 1 }),
        row({ email: "LEAD@EXAMPLE.COM", rowNumber: 2 }),
      ],
      [],
    );
    expect(report.rows[1]).toMatchObject({
      match: { kind: "sheet", rowNumber: 1 },
      status: "duplicate_in_sheet",
    });
  });

  test("matches phones across formatting and country prefix", () => {
    const report = dedupeLeadRows(
      [
        row({ phone: "(555) 010-0134", rowNumber: 1 }),
        row({ phone: "+1 555 010 0134", rowNumber: 2 }),
      ],
      [],
    );
    expect(report.rows[1]!.status).toBe("duplicate_in_sheet");
  });

  test("existing CRM contact wins over duplicate-in-sheet, and matches carry the contact", () => {
    const report = dedupeLeadRows(
      [
        row({ email: "casey.okafor@example.com", rowNumber: 1 }),
        row({ email: "casey.okafor@example.com", rowNumber: 2 }),
      ],
      SANITIZED_EXISTING_CONTACTS,
    );
    expect(report.rows[0]).toMatchObject({
      match: { contactId: "contact-casey", contactName: "Casey Okafor", kind: "contact" },
      status: "existing_contact",
    });
    expect(report.rows[1]!.status).toBe("existing_contact");
    expect(report.counts.existing_contact).toBe(2);
  });

  test("rows without dedupe keys stay new and never collide", () => {
    const report = dedupeLeadRows(
      [row({ rowNumber: 1 }), row({ rowNumber: 2 }), row({ phone: "123", rowNumber: 3 })],
      [],
    );
    expect(report.rows.map((entry) => entry.status)).toEqual(["new", "new", "new"]);
  });
});
