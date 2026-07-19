import { describe, expect, test } from "bun:test";
import type { ExistingContact } from "./lead-ingest";
import {
  FIRST_TOUCH_NEXT_TASK,
  planLeadCommit,
  type LeadCommitPlan,
} from "./lead-commit";
import {
  SANITIZED_EXISTING_CONTACTS,
  SANITIZED_LEAD_SHEET_CSV,
  SANITIZED_LEAD_SHEET_JSON,
} from "./lead-ingest.fixtures";

/** Turn a plan's created contacts into the index a follow-up run dedupes against —
 * the pure-level stand-in for "the first commit wrote these rows to the DB". */
const asExistingContacts = (plan: LeadCommitPlan): ExistingContact[] =>
  plan.creates.map((entry) => ({
    email: entry.contact.email,
    id: `contact-row-${entry.rowNumber}`,
    name: entry.contact.name,
    phone: entry.contact.phone,
  }));

describe("planLeadCommit", () => {
  test("plans one Contact + one lead Project per NEW row, refusing keyless rows", () => {
    const plan = planLeadCommit(SANITIZED_LEAD_SHEET_CSV, "csv", []);

    // Rows 4 + 6 are in-sheet duplicates (case-insensitive email / normalized
    // phone); row 5 has no email or phone → refused, not imported.
    expect(plan.creates.map((entry) => entry.rowNumber)).toEqual([1, 2, 3, 7, 8]);
    expect(plan.skippedDuplicates).toBe(2);
    expect(plan.errors).toEqual([
      "Row 5: no valid email or phone — not imported (it could never be deduped).",
    ]);

    const first = plan.creates[0]!;
    expect(first.contact).toEqual({
      email: "alex.rivera@example.com",
      name: "Alex Rivera",
      phone: "(555) 010-0134",
      source: "referral",
    });
    expect(first.project).toEqual({
      buildingType: "",
      name: "Alex Rivera — Rivera Ag Supply",
      nextTask: FIRST_TOUCH_NEXT_TASK,
      notes: "40x60 equipment shed",
      orderConfirmed: false,
      region: "",
      source: "referral",
      stage: "lead",
      use: "",
    });

    // Email-only row: phone stored as null, not "".
    expect(plan.creates[2]!.contact).toMatchObject({
      email: "casey.okafor@example.com",
      phone: null,
    });
  });

  test("skips rows already in the CRM index (skip + report, never enrich)", () => {
    const plan = planLeadCommit(SANITIZED_LEAD_SHEET_CSV, "csv", SANITIZED_EXISTING_CONTACTS);
    // Casey (email) and Emerson (normalized phone) match existing contacts.
    expect(plan.creates.map((entry) => entry.rowNumber)).toEqual([1, 2, 8]);
    expect(plan.skippedDuplicates).toBe(4);
    expect(plan.errors).toHaveLength(1);
  });

  test("is idempotent: re-planning the same sheet against the first run's writes skips everything", () => {
    const firstRun = planLeadCommit(SANITIZED_LEAD_SHEET_CSV, "csv", []);
    const secondRun = planLeadCommit(
      SANITIZED_LEAD_SHEET_CSV,
      "csv",
      asExistingContacts(firstRun),
    );

    expect(secondRun.creates).toEqual([]);
    // All 7 keyed rows now match the CRM — including the case-flipped email
    // (row 4) and the reformatted phone (row 6), proving the widened semantics.
    expect(secondRun.skippedDuplicates).toBe(7);
    expect(secondRun.errors).toEqual([
      "Row 5: no valid email or phone — not imported (it could never be deduped).",
    ]);
  });

  test("plans JSON sheets too", () => {
    const plan = planLeadCommit(SANITIZED_LEAD_SHEET_JSON, "json", []);
    expect(plan.creates).toHaveLength(3);
    expect(plan.skippedDuplicates).toBe(0);
    expect(plan.errors).toEqual([]);
    // No company → the project label is just the contact name.
    expect(plan.creates[2]!.project.name).toBe("Harlow Diaz");
  });

  test("refuses the whole commit when the parsed format differs from the previewed one", () => {
    const plan = planLeadCommit(SANITIZED_LEAD_SHEET_CSV, "json", []);
    expect(plan.creates).toEqual([]);
    expect(plan.skippedDuplicates).toBe(0);
    expect(plan.errors[0]).toContain("re-run the preview");
  });
});
