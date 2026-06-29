/**
 * fetch-ledgers — the realtime, server-side ledger reader for `/app/loop-board`.
 *
 * Reads the 9 governance ledgers from the **public `main`** branch via `raw.githubusercontent.com`
 * (the repo is public — verified 200 unauthenticated), so the board reflects `main` regardless of
 * Vercel deploy cadence (docs-only ledger commits skip the prod build via `vercel.json`'s
 * `ignoreCommand`, yet the board still updates — that's why we read from git, not from the bundle).
 *
 * Resilient: a ledger whose fetch fails contributes 0 items (logged in the result) rather than
 * breaking the whole projection. Cached `revalidate` seconds so it's near-realtime, not per-request.
 */

import "server-only"
import {
  aggregateFromContents,
  FILE_LEDGER_ORDER,
  type FileLedgerCode,
  type Item,
  LEDGER_FILES,
  parsePullRequests,
  type PullRequestJson,
} from "./ledger-parse"

const LEDGER_REPO = process.env.LOOP_BOARD_LEDGER_REPO ?? "Ronin-Dojo-Design/ronin-dojo-baseline"
const LEDGER_BRANCH = process.env.LOOP_BOARD_LEDGER_BRANCH ?? "main"
const RAW_BASE = `https://raw.githubusercontent.com/${LEDGER_REPO}/${LEDGER_BRANCH}`

/** Seconds the fetched ledger content is cached before re-fetching `main`. */
const LOOP_BOARD_REVALIDATE_SECONDS = 60

export type LedgerBacklog = {
  items: Item[]
  source: { repo: string; branch: string }
  /** Ledgers whose fetch failed (non-200 or network error) — excluded from the projection. */
  failedLedgers: FileLedgerCode[]
  /** Whether the live `PR` source contributed (`true` only when a GitHub token is configured + reachable). */
  prSourceIncluded: boolean
}

// --- live PR source (G-007) ------------------------------------------------

/** GitHub token for the PR query. Operator-gated: unset on Vercel until provisioned → PR source off. */
const GH_TOKEN = process.env.LOOP_BOARD_GH_TOKEN ?? process.env.GITHUB_TOKEN

/**
 * One GraphQL query that returns the SAME field set as `gh pr list --json
 * number,title,headRefName,isDraft,reviewDecision,statusCheckRollup` — so the shared `parsePullRequests`
 * consumes it unchanged. `statusCheckRollup.contexts.nodes` is flattened to the flat array the parser reads.
 */
const PR_QUERY = `
query($owner:String!,$repo:String!){
  repository(owner:$owner,name:$repo){
    pullRequests(states:OPEN, first:50, orderBy:{field:CREATED_AT, direction:ASC}){
      nodes{
        number title isDraft reviewDecision headRefName
        commits(last:1){ nodes{ commit{ statusCheckRollup{ contexts(first:100){ nodes{
          __typename
          ... on CheckRun { name conclusion status }
          ... on StatusContext { context state }
        }}}}}}
      }
    }
  }
}`

type GraphqlPrNode = {
  number: number
  title: string
  isDraft: boolean
  reviewDecision: string | null
  headRefName: string
  commits: {
    nodes: Array<{
      commit: {
        statusCheckRollup: { contexts: { nodes: PullRequestJson["statusCheckRollup"] } } | null
      }
    }>
  }
}

/** Flatten a GraphQL PR node into the flat `gh`-shaped JSON the shared parser expects. */
function graphqlNodeToJson(n: GraphqlPrNode): PullRequestJson {
  return {
    number: n.number,
    title: n.title,
    headRefName: n.headRefName,
    isDraft: n.isDraft,
    reviewDecision: n.reviewDecision ?? "",
    statusCheckRollup: n.commits.nodes[0]?.commit.statusCheckRollup?.contexts.nodes ?? [],
  }
}

/**
 * Fetch open PRs as backlog items via GitHub GraphQL. Operator-gated + resilient: with no token (the
 * Vercel default) or on any error, it returns `[]` and the board simply shows no PR cards — identical to
 * the `failedLedgers` posture. Cached on the same `revalidate` window as the ledger reads.
 */
async function fetchOpenPullRequestItems(): Promise<{ items: Item[]; included: boolean }> {
  if (!GH_TOKEN) return { items: [], included: false }
  const [owner, repo] = LEDGER_REPO.split("/")
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${GH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: PR_QUERY, variables: { owner, repo } }),
      next: { revalidate: LOOP_BOARD_REVALIDATE_SECONDS },
    })
    if (!res.ok) return { items: [], included: false }
    const json = (await res.json()) as {
      data?: { repository?: { pullRequests?: { nodes?: GraphqlPrNode[] } } }
    }
    const nodes = json.data?.repository?.pullRequests?.nodes ?? []
    return { items: parsePullRequests(nodes.map(graphqlNodeToJson)), included: true }
  } catch {
    return { items: [], included: false }
  }
}

/** Fetch + aggregate the open ledger backlog from the public `main` branch, plus the live PR source. */
export async function fetchLedgerBacklog(): Promise<LedgerBacklog> {
  const failedLedgers: FileLedgerCode[] = []

  const [entries, prs] = await Promise.all([
    Promise.all(
      FILE_LEDGER_ORDER.map(
        async (code): Promise<readonly [FileLedgerCode, string | undefined]> => {
          try {
            const res = await fetch(`${RAW_BASE}/${LEDGER_FILES[code]}`, {
              next: { revalidate: LOOP_BOARD_REVALIDATE_SECONDS },
            })
            if (!res.ok) {
              failedLedgers.push(code)
              return [code, undefined]
            }
            return [code, await res.text()]
          } catch {
            failedLedgers.push(code)
            return [code, undefined]
          }
        },
      ),
    ),
    fetchOpenPullRequestItems(),
  ])

  const contents: Partial<Record<FileLedgerCode, string>> = {}
  for (const [code, text] of entries) {
    if (text != null) contents[code] = text
  }

  return {
    items: aggregateFromContents(contents, { extraItems: prs.items }),
    source: { repo: LEDGER_REPO, branch: LEDGER_BRANCH },
    failedLedgers,
    prSourceIncluded: prs.included,
  }
}
