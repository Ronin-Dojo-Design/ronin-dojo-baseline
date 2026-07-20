import { describe, expect, test } from "bun:test";
import { projectToCard } from "./board-config";
import type { Project } from "./types";

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: "seed-ridgeline",
    name: "Ridgeline Auto — 60×100 Service",
    contactName: "Dana Ruiz",
    contactEmail: "dana@ridgelineauto.example",
    buildingType: "Auto Service",
    use: "Auto service center, 6 bays",
    region: "Boise, ID",
    width: 60,
    length: 100,
    eaveHeight: 16,
    stage: "fabrication",
    source: "referral",
    nextTask: "Send fabrication-milestone invoice",
    orderConfirmed: true,
    orderNumber: "MB-2041",
    notes: "",
    photos: [],
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("projectToCard — Lead Source round-trip (SESSION_0586)", () => {
  test("carries the persisted source onto the kernel card's source field", () => {
    const card = projectToCard(project({ source: "trade_show" }));
    expect(card.source).toBe("trade_show");
  });

  test("appends a Lead Source label as a passthrough badge", () => {
    const card = projectToCard(project({ source: "web_form" }));
    expect(card.badges).toEqual([{ label: "Web form" }]);
  });

  test("does not disturb the existing orderConfirmed/orderNumber fields bag", () => {
    const card = projectToCard(project({ orderConfirmed: true, orderNumber: "MB-2041" }));
    expect(card.fields).toEqual({ orderConfirmed: true, orderNumber: "MB-2041" });
  });

  test("omits orderNumber from fields when the project has none yet", () => {
    const card = projectToCard(project({ orderConfirmed: false, orderNumber: null }));
    expect(card.fields).toEqual({ orderConfirmed: false });
  });
});
