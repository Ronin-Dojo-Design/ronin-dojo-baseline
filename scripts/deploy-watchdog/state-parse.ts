/**
 * state-parse.ts — pure deployment-state decision logic for the deploy watchdog.
 *
 * No I/O here on purpose: everything in this file is a pure function over plain
 * data so it can be unit-tested with fixture JSON (see state-parse.test.ts)
 * without touching the network, the filesystem, or a real Vercel token.
 */

/** Known Vercel deployment states (per api.vercel.com v6/deployments). Widened to
 * `string` so a future/unknown state from the API degrades to "quiet", not a crash. */
export type DeploymentState =
  | "BUILDING"
  | "ERROR"
  | "BLOCKED"
  | "INITIALIZING"
  | "QUEUED"
  | "READY"
  | "CANCELED"
  | "DELETED"
  | (string & {});

export interface DeploymentMeta {
  [key: string]: string | undefined;
}

/** Shape we actually read off a v6/deployments list item — subset of the real
 * (much larger) Vercel response. */
export interface Deployment {
  uid?: string;
  name?: string;
  url?: string;
  state?: DeploymentState;
  /** Some API versions/SDKs expose `readyState` instead of (or alongside) `state`. */
  readyState?: DeploymentState;
  created?: number;
  meta?: DeploymentMeta;
}

export interface AlertDecision {
  alert: boolean;
  reason: string;
  rollbackCandidate: string | null;
}

export interface CommitInfo {
  sha?: string;
  message?: string;
  ref?: string;
}

// Only these newest-deployment states page the operator. CANCELED counts because
// a canceled production deploy still leaves the previous READY build serving
// traffic silently un-rolled-forward — same "did the deploy actually land?"
// blind spot as ERROR. BLOCKED/DELETED are intentionally NOT in this set for v1
// (spec: "If newest state is ERROR or CANCELED") — revisit if either shows up
// in practice as a silent-failure mode.
const UNHEALTHY_STATES = new Set<string>(["ERROR", "CANCELED"]);

const IN_PROGRESS_STATES = new Set<string>(["BUILDING", "QUEUED", "INITIALIZING"]);

function stateOf(d: Deployment): string {
  return (d.state ?? d.readyState ?? "UNKNOWN").toUpperCase();
}

/**
 * Decide whether the newest production deployment warrants an alert.
 *
 * `deployments` is expected newest-first, matching the order Vercel's
 * v6/deployments endpoint returns (as fetched with target=production).
 */
export function decideAlert(deployments: Deployment[]): AlertDecision {
  if (!deployments || deployments.length === 0) {
    return {
      alert: false,
      reason: "no production deployments found",
      rollbackCandidate: null,
    };
  }

  const newest = deployments[0];
  const newestState = stateOf(newest);

  if (IN_PROGRESS_STATES.has(newestState)) {
    return {
      alert: false,
      reason: `newest deployment is ${newestState} (in progress)`,
      rollbackCandidate: null,
    };
  }

  if (!UNHEALTHY_STATES.has(newestState)) {
    // READY, or any other non-alerting state (BLOCKED, DELETED, unknown future
    // states) — quiet by design, see UNHEALTHY_STATES comment above.
    return {
      alert: false,
      reason: `newest deployment is ${newestState}`,
      rollbackCandidate: null,
    };
  }

  // Newest is ERROR/CANCELED — the most recent READY deployment in the fetched
  // window (newest-first, including the unhealthy one at index 0, which by
  // definition won't match) is the rollback candidate.
  const rollback = deployments.find((d) => stateOf(d) === "READY");

  return {
    alert: true,
    reason: `newest production deployment is ${newestState}`,
    rollbackCandidate: rollback?.url ?? null,
  };
}

/**
 * Vercel's deployment `meta` is a generic string map whose keys vary by git
 * provider. Probe the known provider-specific keys in priority order.
 * Returns null when none of the probed keys are present (e.g. a CLI-triggered
 * deployment with no git metadata at all).
 */
export function extractCommitInfo(meta?: DeploymentMeta): CommitInfo | null {
  if (!meta) return null;

  const sha = meta.githubCommitSha ?? meta.gitlabCommitSha ?? meta.bitbucketCommitSha;
  const message = meta.githubCommitMessage ?? meta.gitlabCommitMessage ?? meta.bitbucketCommitMessage;
  const ref = meta.githubCommitRef ?? meta.gitlabCommitRef ?? meta.bitbucketCommitRef;

  if (!sha && !message && !ref) return null;
  return { sha, message, ref };
}
