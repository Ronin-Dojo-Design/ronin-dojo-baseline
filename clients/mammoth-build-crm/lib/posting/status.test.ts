import { describe, expect, test } from "bun:test";
import { planApprovePostingDraft, type PostingDraftLike } from "./status";

const CLEAN_DRAFT: PostingDraftLike = {
  body: "Completed Auto Service: sequenced delivery. Mammoth carries every project through.",
  status: "draft",
};

describe("planApprovePostingDraft", () => {
  test("approves a clean draft (every placeholder filled)", () => {
    const now = new Date("2026-07-24T12:00:00.000Z");
    const plan = planApprovePostingDraft(CLEAN_DRAFT, now);
    expect(plan).toEqual({ ok: true, status: "approved", approvedAt: now });
  });

  test("refuses a draft that still has an unresolved placeholder", () => {
    const plan = planApprovePostingDraft({
      body: "Completed [BUILDING_TYPE]: sequenced delivery.",
      status: "draft",
    });
    expect(plan.ok).toBe(false);
    if (!plan.ok) {
      expect(plan.reason).toContain("unfilled");
    }
  });

  test("refuses to re-approve an already-approved draft", () => {
    const plan = planApprovePostingDraft({ ...CLEAN_DRAFT, status: "approved" });
    expect(plan.ok).toBe(false);
    if (!plan.ok) {
      expect(plan.reason).toContain('"approved"');
    }
  });

  // The hard rule this pipeline exists to enforce: approving NEVER posts. There is no code path in
  // this module — or anywhere in lib/posting/** — that can produce status "posted". Publishing is
  // a later wired step + an explicit operator action.
  test("approving a draft never yields status 'posted'", () => {
    const plan = planApprovePostingDraft(CLEAN_DRAFT);
    expect(plan.ok).toBe(true);
    if (plan.ok) {
      expect(plan.status).toBe("approved");
      expect(plan.status as string).not.toBe("posted");
    }
  });

  test("refuses to approve a draft that is already posted", () => {
    const plan = planApprovePostingDraft({ ...CLEAN_DRAFT, status: "posted" });
    expect(plan.ok).toBe(false);
    if (!plan.ok) {
      expect(plan.reason).toContain('"posted"');
    }
  });
});
