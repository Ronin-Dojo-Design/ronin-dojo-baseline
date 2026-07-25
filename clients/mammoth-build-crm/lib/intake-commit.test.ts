// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep.
import { describe, expect, test } from "bun:test";
import { FIRST_TOUCH_NEXT_TASK } from "./lead-commit";
import {
  INTAKE_QUESTIONNAIRE,
  intakeNotesDigest,
  planIntakeCommit,
  type IntakeCaptureInput,
} from "./intake-commit";

const input: IntakeCaptureInput = {
  client: "Flores Ag Supply",
  contactName: "Sam Rivera",
  email: "sam@floresag.test",
  phone: "+1 (555) 010-0134",
  meetingDate: "2026-07-23",
  source: "phone",
  answers: { commercial_lanes: "Building + install", budget_financing: "About $80k, cash" },
};

describe("planIntakeCommit", () => {
  test("refuses a capture with no valid email or phone (it could never be deduped)", () => {
    const plan = planIntakeCommit(INTAKE_QUESTIONNAIRE, {
      ...input,
      email: "not-an-email",
      phone: "123",
    });
    expect(plan.ok).toBe(false);
    if (!plan.ok) expect(plan.error).toContain("could never be deduped");
  });

  test("refuses an empty capture — a lead Project with no answers is noise", () => {
    expect(planIntakeCommit(INTAKE_QUESTIONNAIRE, { ...input, answers: {} }).ok).toBe(false);
  });

  test("refuses a malformed payload with a report, not a throw (forged action calls fail closed)", () => {
    const garbage = [
      { ...input, answers: null },
      { ...input, answers: [1, 2] },
      { ...input, answers: { commercial_lanes: 42 } },
      { ...input, client: 7 },
    ] as unknown as IntakeCaptureInput[];
    for (const bad of garbage) {
      const plan = planIntakeCommit(INTAKE_QUESTIONNAIRE, bad);
      expect(plan.ok).toBe(false);
      if (!plan.ok) expect(plan.error).toContain("Malformed");
    }
  });

  test("refuses a bad meeting date and an unknown source (client shapes are never trusted)", () => {
    expect(planIntakeCommit(INTAKE_QUESTIONNAIRE, { ...input, meetingDate: "7/23/26" }).ok).toBe(
      false,
    );
    expect(
      planIntakeCommit(INTAKE_QUESTIONNAIRE, {
        ...input,
        source: "carrier_pigeon" as IntakeCaptureInput["source"],
      }).ok,
    ).toBe(false);
  });

  test("plans the createProject-shaped lead write: lead stage, first-touch task, both names", () => {
    const plan = planIntakeCommit(INTAKE_QUESTIONNAIRE, input);
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.contact).toEqual({
      email: "sam@floresag.test",
      name: "Sam Rivera",
      phone: "+1 (555) 010-0134",
      source: "phone",
    });
    expect(plan.project.name).toBe("Sam Rivera — Flores Ag Supply");
    expect(plan.project.stage).toBe("lead");
    expect(plan.project.nextTask).toBe(FIRST_TOUCH_NEXT_TASK);
    expect(plan.project.orderConfirmed).toBe(false);
  });

  test("falls back through contact name → client → Unknown rather than an empty name", () => {
    const noContact = planIntakeCommit(INTAKE_QUESTIONNAIRE, { ...input, contactName: " " });
    if (noContact.ok) expect(noContact.contact.name).toBe("Flores Ag Supply");
    const neither = planIntakeCommit(INTAKE_QUESTIONNAIRE, {
      ...input,
      client: "",
      contactName: "",
    });
    if (neither.ok) expect(neither.contact.name).toBe("Unknown");
    expect(noContact.ok && neither.ok).toBe(true);
  });
});

describe("intakeNotesDigest", () => {
  test("carries the call header plus ONLY the answered questions", () => {
    const digest = intakeNotesDigest(INTAKE_QUESTIONNAIRE, input);
    expect(digest).toContain("Metal building discovery call — 2026-07-23");
    expect(digest).toContain("Building + install");
    expect(digest).toContain("About $80k, cash");
    expect(digest).not.toContain("_(not answered)_");
    expect(digest).not.toContain("permits");
  });

  test("the planned project notes ARE the digest", () => {
    const plan = planIntakeCommit(INTAKE_QUESTIONNAIRE, input);
    if (plan.ok) {
      expect(plan.project.notes).toBe(intakeNotesDigest(INTAKE_QUESTIONNAIRE, input));
    }
    expect(plan.ok).toBe(true);
  });
});
