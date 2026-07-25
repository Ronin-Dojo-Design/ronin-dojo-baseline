import { describe, expect, test } from "bun:test";
import { decideAlert, extractCommitInfo, type Deployment } from "./state-parse.ts";

// ── Fixtures ──────────────────────────────────────────────────────────────────
// Newest-first, matching what api.vercel.com v6/deployments?target=production
// returns. Only the fields state-parse.ts actually reads are populated.

const readyDeployment = (overrides: Partial<Deployment> = {}): Deployment => ({
  uid: "dpl_ready",
  url: "app-ready123.vercel.app",
  state: "READY",
  created: 1700000000000,
  ...overrides,
});

const errorNewestFixture: Deployment[] = [
  {
    uid: "dpl_error",
    url: "app-error456.vercel.app",
    state: "ERROR",
    created: 1700000300000,
    meta: {
      githubCommitSha: "abc1234def5678900000000000000000000000",
      githubCommitMessage: "feat: ship the thing that broke prod",
      githubCommitRef: "main",
    },
  },
  readyDeployment({ uid: "dpl_prev_ready", url: "app-prevready.vercel.app", created: 1700000000000 }),
  readyDeployment({ uid: "dpl_older_ready", url: "app-olderready.vercel.app", created: 1699999000000 }),
];

const readyNewestFixture: Deployment[] = [
  readyDeployment({ uid: "dpl_current", url: "app-current.vercel.app", created: 1700000300000 }),
  readyDeployment({ uid: "dpl_prev", url: "app-prev.vercel.app", created: 1700000000000 }),
];

const canceledNewestFixture: Deployment[] = [
  {
    uid: "dpl_canceled",
    url: "app-canceled.vercel.app",
    state: "CANCELED",
    created: 1700000300000,
  },
  readyDeployment({ uid: "dpl_backfill_ready", url: "app-backfill.vercel.app", created: 1699990000000 }),
];

const emptyFixture: Deployment[] = [];

const buildingInProgressFixture: Deployment[] = [
  {
    uid: "dpl_building",
    url: "app-building.vercel.app",
    state: "BUILDING",
    created: 1700000300000,
  },
  readyDeployment({ uid: "dpl_last_good", url: "app-lastgood.vercel.app", created: 1700000000000 }),
];

// ── decideAlert ───────────────────────────────────────────────────────────────

describe("decideAlert", () => {
  test("ERROR newest → alerts, surfaces most recent READY as rollback candidate", () => {
    const decision = decideAlert(errorNewestFixture);
    expect(decision.alert).toBe(true);
    expect(decision.reason).toContain("ERROR");
    expect(decision.rollbackCandidate).toBe("app-prevready.vercel.app");
  });

  test("READY newest → quiet, no rollback candidate needed", () => {
    const decision = decideAlert(readyNewestFixture);
    expect(decision.alert).toBe(false);
    expect(decision.reason).toContain("READY");
    expect(decision.rollbackCandidate).toBeNull();
  });

  test("CANCELED newest → alerts, surfaces most recent READY as rollback candidate", () => {
    const decision = decideAlert(canceledNewestFixture);
    expect(decision.alert).toBe(true);
    expect(decision.reason).toContain("CANCELED");
    expect(decision.rollbackCandidate).toBe("app-backfill.vercel.app");
  });

  test("empty deployment list → quiet, distinct reason, no rollback candidate", () => {
    const decision = decideAlert(emptyFixture);
    expect(decision.alert).toBe(false);
    expect(decision.reason).toBe("no production deployments found");
    expect(decision.rollbackCandidate).toBeNull();
  });

  test("BUILDING newest (deploy in progress) → quiet, distinct reason", () => {
    const decision = decideAlert(buildingInProgressFixture);
    expect(decision.alert).toBe(false);
    expect(decision.reason).toContain("in progress");
  });

  test("QUEUED newest → treated as in-progress, quiet", () => {
    const decision = decideAlert([{ uid: "dpl_q", url: "app-q.vercel.app", state: "QUEUED", created: 1 }]);
    expect(decision.alert).toBe(false);
    expect(decision.reason).toContain("in progress");
  });

  test("ERROR newest with no READY deployment in the fetched window → alerts, null rollback candidate", () => {
    const decision = decideAlert([
      { uid: "dpl_only_error", url: "app-onlyerror.vercel.app", state: "ERROR", created: 1 },
    ]);
    expect(decision.alert).toBe(true);
    expect(decision.rollbackCandidate).toBeNull();
  });

  test("state read is case-insensitive and falls back to readyState", () => {
    const decision = decideAlert([{ uid: "dpl_lower", url: "app-lower.vercel.app", readyState: "error" as never, created: 1 }]);
    expect(decision.alert).toBe(true);
  });

  test("BLOCKED newest → does not alert in v1 (documented gap, not ERROR/CANCELED)", () => {
    const decision = decideAlert([{ uid: "dpl_blocked", url: "app-blocked.vercel.app", state: "BLOCKED", created: 1 }]);
    expect(decision.alert).toBe(false);
  });
});

// ── extractCommitInfo ─────────────────────────────────────────────────────────

describe("extractCommitInfo", () => {
  test("extracts GitHub commit fields", () => {
    const info = extractCommitInfo({
      githubCommitSha: "deadbeef",
      githubCommitMessage: "fix: thing",
      githubCommitRef: "main",
    });
    expect(info).toEqual({ sha: "deadbeef", message: "fix: thing", ref: "main" });
  });

  test("falls back to GitLab/Bitbucket keys when GitHub keys are absent", () => {
    const info = extractCommitInfo({ gitlabCommitSha: "cafef00d" });
    expect(info?.sha).toBe("cafef00d");
  });

  test("returns null when meta is undefined", () => {
    expect(extractCommitInfo(undefined)).toBeNull();
  });

  test("returns null when meta has no recognized commit keys", () => {
    expect(extractCommitInfo({ someUnrelatedKey: "value" })).toBeNull();
  });
});
