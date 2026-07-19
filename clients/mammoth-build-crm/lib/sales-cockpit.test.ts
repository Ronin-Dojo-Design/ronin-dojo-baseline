import { describe, expect, test } from "bun:test";
import {
  CONTACT_ATTEMPT_OUTCOME_LABELS,
  bucketDueActivities,
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
