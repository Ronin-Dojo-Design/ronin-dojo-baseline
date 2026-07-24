#!/usr/bin/env bun
/**
 * watchdog.ts — Vercel deploy watchdog. NOTIFY-ONLY: it never rolls back, never
 * cancels a deployment, never mutates any Vercel or repo state. Its only side
 * effect is a push notification.
 *
 * For each configured project, fetches the newest PRODUCTION deployment from
 * api.vercel.com (v6/deployments). If it's ERROR or CANCELED, pushes an alert
 * via the repo's existing ntfy.sh sender (scripts/notify/ntfy-send.sh —
 * SESSION_0334 convention, see README.md for the citation). Otherwise exits
 * quietly.
 *
 * Usage:
 *   bun scripts/deploy-watchdog/watchdog.ts [--dry-run] [--verbose|-v]
 *
 *   --dry-run   Print what WOULD be sent to ntfy; send nothing.
 *   --verbose   Print the resolved state for every project, not just alerts.
 *
 * Auth (first found wins — see README.md "Auth" for full detail):
 *   1. $VERCEL_TOKEN env var
 *   2. Vercel CLI's auth.json `token` field (read-only; the value is never
 *      printed, logged, or included in any notification).
 *
 * Exit codes:
 *   0   Healthy (nothing to notify), or an alert was raised/notified.
 *   2   Auth/config error (no token found, or the Vercel API rejected it).
 */

import { homedir } from "node:os";
import { join } from "node:path";
import { decideAlert, extractCommitInfo, type Deployment } from "./state-parse.ts";

// ── Config ──────────────────────────────────────────────────────────────────

const PROJECTS = ["ronin-dojo-baseline", "ronindojodesign"] as const;
const SCOPE = "brian-scotts-projects-4841d4d6"; // Vercel team slug

// scripts/notify/ntfy-send.sh — the repo's shared ntfy sender (SESSION_0334).
// Reused as-is (read-only subprocess call, never edited) so this watchdog
// follows the exact same topic/env/priority conventions as the existing
// docker-cache-monitor.sh / disk-pressure-monitor.sh launchd jobs.
const NTFY_SEND = join(import.meta.dir, "..", "notify", "ntfy-send.sh");

// Vercel CLI's global config directory on macOS. The CLI uses `xdg-app-paths`,
// which resolves to `~/Library/Application Support/<name>` by default, or to
// `$XDG_CONFIG_HOME/<name>` when that env var is set (some machines set it
// globally, which redirects the CLI off the macOS default path).
function vercelAuthPaths(): string[] {
  const paths = [join(homedir(), "Library", "Application Support", "com.vercel.cli", "auth.json")];
  if (process.env.XDG_CONFIG_HOME) {
    paths.push(join(process.env.XDG_CONFIG_HOME, "com.vercel.cli", "auth.json"));
  }
  return paths;
}

// ── Types ───────────────────────────────────────────────────────────────────

interface Args {
  dryRun: boolean;
  verbose: boolean;
}

class AuthError extends Error {}

// ── Auth resolution ─────────────────────────────────────────────────────────

async function resolveToken(): Promise<string | null> {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;

  for (const path of vercelAuthPaths()) {
    try {
      const file = Bun.file(path);
      if (!(await file.exists())) continue;
      const parsed = (await file.json()) as { token?: unknown };
      if (typeof parsed.token === "string" && parsed.token.length > 0) return parsed.token;
    } catch {
      // Malformed/unreadable auth.json — try the next candidate path.
    }
  }

  return null;
}

// ── Vercel API ──────────────────────────────────────────────────────────────

async function fetchNewestProductionDeployments(project: string, token: string): Promise<Deployment[]> {
  const url = new URL("https://api.vercel.com/v6/deployments");
  url.searchParams.set("projectId", project); // API accepts project ID *or* name here
  url.searchParams.set("target", "production");
  url.searchParams.set("limit", "3");
  url.searchParams.set("slug", SCOPE);

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  if (res.status === 401 || res.status === 403) {
    throw new AuthError(`Vercel API rejected the token for project "${project}" (HTTP ${res.status})`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Vercel API error for project "${project}": HTTP ${res.status} ${body}`.trim());
  }

  const parsed = (await res.json()) as { deployments?: Deployment[] };
  return parsed.deployments ?? [];
}

// ── Notification ────────────────────────────────────────────────────────────

function buildAlertMessage(
  project: string,
  reason: string,
  rollbackCandidate: string | null,
  newest: Deployment | undefined,
): string {
  const lines = [`Project: ${project}`, `State: ${reason}`];

  const commit = newest ? extractCommitInfo(newest.meta) : null;
  if (commit?.sha) {
    const short = commit.sha.slice(0, 7);
    lines.push(commit.message ? `Commit: ${short} — ${commit.message}` : `Commit: ${short}`);
  }

  lines.push(
    rollbackCandidate
      ? `Rollback candidate (most recent READY): https://${rollbackCandidate}`
      : "Rollback candidate: none found in the last 3 production deployments — check the Vercel dashboard.",
  );

  return lines.join("\n");
}

async function sendAlert(title: string, message: string, dryRun: boolean): Promise<void> {
  const sendArgs = ["--title", title, "--priority", "5", "--tags", "rotating_light,x", "--", message];

  if (dryRun) {
    console.log(`[dry-run] would notify via ${NTFY_SEND}:`);
    console.log(`  title: ${title}`);
    console.log(`  message:\n    ${message.split("\n").join("\n    ")}`);
    return;
  }

  const proc = Bun.spawn([NTFY_SEND, ...sendArgs], { stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;
  if (code !== 0) {
    console.error(`watchdog: ntfy-send.sh exited ${code} — notification may not have been delivered`);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): Args {
  return {
    dryRun: argv.includes("--dry-run"),
    verbose: argv.includes("--verbose") || argv.includes("-v"),
  };
}

async function main(): Promise<void> {
  const { dryRun, verbose } = parseArgs(process.argv.slice(2));

  const token = await resolveToken();
  if (!token) {
    console.error(
      "watchdog: no Vercel token found. Set $VERCEL_TOKEN, or run `vercel login` so the CLI's auth.json " +
        "has one (see README.md for the exact paths checked).",
    );
    process.exit(2);
  }

  let authFailed = false;

  for (const project of PROJECTS) {
    try {
      const deployments = await fetchNewestProductionDeployments(project, token);
      const decision = decideAlert(deployments);

      if (verbose || dryRun) {
        console.log(`[${project}] ${decision.reason} (alert=${decision.alert})`);
      }

      if (decision.alert) {
        const message = buildAlertMessage(project, decision.reason, decision.rollbackCandidate, deployments[0]);
        await sendAlert(`Vercel deploy watchdog: ${project} is down`, message, dryRun);
      }
    } catch (err) {
      if (err instanceof AuthError) {
        authFailed = true;
        console.error(`watchdog: ${err.message}`);
        continue;
      }
      console.error(`watchdog: failed to check "${project}": ${(err as Error).message}`);
    }
  }

  process.exit(authFailed ? 2 : 0);
}

main();
