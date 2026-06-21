// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep.
import { describe, expect, it } from "bun:test";
import { createLead, intakeStageId, isDuplicateContact } from "./intake";
import type { BoardCard, BoardConfig } from "./types";

const config: BoardConfig = {
  id: "test",
  title: "Test",
  brand: "test",
  cardKind: "task",
  stages: [
    { id: "raw", name: "Raw" },
    { id: "new", name: "New Lead", intake: true },
  ],
  automations: [],
};

describe("intakeStageId", () => {
  it("returns the stage flagged intake, not stage[0]", () => {
    expect(intakeStageId(config)).toBe("new");
  });
});

describe("isDuplicateContact", () => {
  it("matches on normalized phone (ignores formatting)", () => {
    expect(isDuplicateContact({ phone: "(555) 123-4567" }, { phone: "5551234567" })).toBe(true);
  });
  it("matches on case-insensitive email", () => {
    expect(isDuplicateContact({ email: "A@B.com" }, { email: "a@b.com" })).toBe(true);
  });
  it("is false when neither phone nor email overlaps", () => {
    expect(isDuplicateContact({ email: "a@b.com" }, { email: "c@d.com" })).toBe(false);
  });
});

describe("createLead", () => {
  it("drops a new lead into the intake stage and stamps the source", () => {
    const result = createLead(
      { title: "Web inquiry", source: "web", contact: { email: "new@x.com" } },
      [],
      config,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.card.stage).toBe("new");
      expect(result.card.source).toBe("web");
      expect(result.card.status).toBe("active");
    }
  });

  it("rejects a duplicate by email", () => {
    const existing: BoardCard[] = [
      {
        id: "c1",
        stage: "new",
        title: "Old",
        contact: { email: "dup@x.com" },
        createdAt: "2026-06-20T00:00:00Z",
        updatedAt: "2026-06-20T00:00:00Z",
      },
    ];
    const result = createLead({ title: "New", contact: { email: "DUP@x.com" } }, existing, config);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("duplicate");
      expect(result.existingId).toBe("c1");
    }
  });
});
