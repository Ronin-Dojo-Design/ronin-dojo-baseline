import { describe, expect, test } from "bun:test";
import {
  ATTEMPT_CADENCE_TARGET,
  CONTACT_ATTEMPT_OUTCOME_LABELS,
  attemptProgress,
  bucketDueActivities,
  buildAttemptLog,
  validateContactAttemptInput,
  type SalesQueueItem,
} from "./sales-cockpit";

const item = (activityId: string, dueAt: string, projectName = activityId): SalesQueueItem => ({
  activityId,
  contactName: "Sanitized Contact",
  dueAt,
  projectId: `project-${activityId}`,
  projectName,
  title: `Next action ${activityId}`,
});

describe("sales cockpit pure rules", () => {
  test("buckets and sorts overdue, today, and upcoming work", () => {
    const now = new Date("2026-07-19T05:30:00.000Z"); // July 18, 23:30 in Denver.
    const result = bucketDueActivities(
      [
        item("upcoming", "2026-07-19T06:30:00.000Z"),
        item("today-late", "2026-07-19T05:45:00.000Z", "Zulu"),
        item("overdue", "2026-07-18T05:59:00.000Z"),
        item("today-early", "2026-07-18T12:00:00.000Z", "Alpha"),
      ],
      now,
    );

    expect(result.overdue.map((entry) => entry.activityId)).toEqual(["overdue"]);
    expect(result.today.map((entry) => entry.activityId)).toEqual(["today-early", "today-late"]);
    expect(result.upcoming.map((entry) => entry.activityId)).toEqual(["upcoming"]);
  });

  test("keeps the provisional outcome vocabulary bounded", () => {
    expect(Object.values(CONTACT_ATTEMPT_OUTCOME_LABELS)).toEqual([
      "Connected",
      "Left message",
      "No answer",
      "Invalid contact details",
      "Follow-up requested",
    ]);
  });

  test("requires exactly one named, due Next Action", () => {
    expect(() =>
      validateContactAttemptInput({
        channel: "call",
        nextAction: " ",
        nextActionDueAt: "2026-07-19T09:00:00.000Z",
        outcome: "connected",
        projectId: "project-1",
      }),
    ).toThrow("Exactly one Next Action is required.");

    expect(() =>
      validateContactAttemptInput({
        channel: "call",
        nextAction: "Prepare revised estimate",
        nextActionDueAt: "",
        outcome: "connected",
        projectId: "project-1",
      }),
    ).toThrow("valid due date");

    const valid = validateContactAttemptInput({
      channel: "email",
      nextAction: "  Send the requested specification sheet  ",
      nextActionDueAt: "2026-07-19T09:00:00.000Z",
      notes: "  Customer requested gauge options.  ",
      outcome: "follow_up_requested",
      projectId: "project-1",
    });
    expect(valid.nextAction).toBe("Send the requested specification sheet");
    expect(valid.notes).toBe("Customer requested gauge options.");
  });
});

const attempt = (
  id: string,
  occurredAt: string,
  overrides: Partial<Parameters<typeof buildAttemptLog>[0][number]> = {},
): Parameters<typeof buildAttemptLog>[0][number] => ({
  completedAt: occurredAt,
  createdAt: occurredAt,
  id,
  status: "completed",
  title: "Contact Attempt — Manual call: Left message",
  type: "call",
  ...overrides,
});

describe("contact-attempt log", () => {
  test("numbers recorded attempts chronologically, skipping tasks and open activities", () => {
    const log = buildAttemptLog([
      attempt("third", "2026-07-19T17:00:00.000Z", {
        title: "Contact Attempt — Manual email: Connected",
        type: "email",
      }),
      attempt("first", "2026-07-17T15:00:00.000Z"),
      attempt("not-an-attempt", "2026-07-18T09:00:00.000Z", { status: "open", type: "task" }),
      attempt("second", "2026-07-18T16:00:00.000Z", { type: "meeting" }),
    ]);

    expect(log.map((entry) => [entry.attemptNumber, entry.activityId])).toEqual([
      [1, "first"],
      [2, "second"],
      [3, "third"],
    ]);
    expect(log[2]).toMatchObject({ channel: "email", summary: "Manual email: Connected" });
  });

  test("falls back to createdAt ordering and keeps unprefixed titles verbatim", () => {
    const log = buildAttemptLog([
      attempt("legacy", "2026-07-16T10:00:00.000Z", {
        completedAt: null,
        title: "Called about the quote",
      }),
    ]);
    expect(log[0]).toMatchObject({
      attemptNumber: 1,
      occurredAt: "2026-07-16T10:00:00.000Z",
      summary: "Called about the quote",
    });
  });

  test("reads out the Attempt-N-of-3 cadence", () => {
    expect(attemptProgress(0)).toEqual({
      cadenceMet: false,
      count: 0,
      label: `No attempts yet — target ${ATTEMPT_CADENCE_TARGET}`,
    });
    expect(attemptProgress(2)).toEqual({ cadenceMet: false, count: 2, label: "Attempt 2 of 3" });
    expect(attemptProgress(3)).toEqual({ cadenceMet: true, count: 3, label: "Attempt 3 of 3" });
    expect(attemptProgress(5)).toEqual({
      cadenceMet: true,
      count: 5,
      label: "5 attempts — 3-attempt cadence complete",
    });
  });
});
