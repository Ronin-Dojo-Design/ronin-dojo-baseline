// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, test } from "bun:test"
import {
  bucketGoalPhase,
  bucketSessionPhase,
  classifyGoalProduct,
  classifySessionProduct,
  detectOperatorPending,
  detectPushGateHeld,
  detectReviewSignal,
  frontmatterField,
  parseGoalsDetail,
  parseSessionFile,
} from "./parse"

describe("frontmatterField", () => {
  const doc = `---\ntitle: "SESSION 0580 — G-022 Lane B"\nstatus: in-progress\nlane: bbl\nempty_field:\n---\n\n# body\n`

  test("reads a quoted scalar", () => {
    expect(frontmatterField(doc, "title")).toBe("SESSION 0580 — G-022 Lane B")
  })

  test("reads a bare scalar", () => {
    expect(frontmatterField(doc, "status")).toBe("in-progress")
    expect(frontmatterField(doc, "lane")).toBe("bbl")
  })

  test("returns undefined for an empty field or missing key", () => {
    expect(frontmatterField(doc, "empty_field")).toBeUndefined()
    expect(frontmatterField(doc, "nope")).toBeUndefined()
  })

  test("returns undefined with no frontmatter block at all", () => {
    expect(frontmatterField("# just a doc\n", "title")).toBeUndefined()
  })
})

describe("classifySessionProduct", () => {
  test("bbl and mmb split out; everything else is the rdd umbrella", () => {
    expect(classifySessionProduct("bbl")).toBe("bbl")
    expect(classifySessionProduct("mmb")).toBe("mmb")
    expect(classifySessionProduct("repo")).toBe("rdd")
    expect(classifySessionProduct("rdd")).toBe("rdd")
    expect(classifySessionProduct("bma")).toBe("rdd")
    expect(classifySessionProduct(undefined)).toBe("rdd")
  })
})

describe("classifyGoalProduct", () => {
  test("keyword heuristic over the free-text Lane bullet", () => {
    expect(classifyGoalProduct("Mammoth product / vault-kit / CRM")).toBe("mmb")
    expect(classifyGoalProduct("BJJ→grappling techniques / curriculum")).toBe("bbl")
    expect(classifyGoalProduct("belt / schema")).toBe("bbl")
    expect(classifyGoalProduct("lineage / onboarding")).toBe("bbl")
    expect(classifyGoalProduct("platform / infra")).toBe("rdd")
    expect(classifyGoalProduct("governance tooling")).toBe("rdd")
    expect(classifyGoalProduct(undefined)).toBe("rdd")
  })
})

describe("bucketSessionPhase", () => {
  test("staged/open/pending -> planned", () => {
    expect(bucketSessionPhase("staged", false)).toBe("planned")
    expect(bucketSessionPhase("open", false)).toBe("planned")
    expect(bucketSessionPhase("pending", false)).toBe("planned")
  })

  test("in-progress -> in-flight, unless push-gate held -> held (brown)", () => {
    expect(bucketSessionPhase("in-progress", false)).toBe("in-flight")
    expect(bucketSessionPhase("in-progress", true)).toBe("held")
  })

  test("any closed* variant -> done", () => {
    expect(bucketSessionPhase("closed", false)).toBe("done")
    expect(bucketSessionPhase("closed-full", false)).toBe("done")
    expect(bucketSessionPhase("closed-quick", false)).toBe("done")
    expect(bucketSessionPhase("closed-partial", false)).toBe("done")
  })

  test("unrecognized status defaults to planned", () => {
    expect(bucketSessionPhase("wat", false)).toBe("planned")
  })
})

describe("bucketGoalPhase", () => {
  test("done/landed/shipped -> done", () => {
    expect(bucketGoalPhase("done", false)).toBe("done")
    expect(bucketGoalPhase("landed", false)).toBe("done")
    expect(bucketGoalPhase("shipped", false)).toBe("done")
  })

  test("in-progress -> in-flight, unless a review signal bumps it to review", () => {
    expect(bucketGoalPhase("in-progress", false)).toBe("in-flight")
    expect(bucketGoalPhase("in-progress", true)).toBe("review")
  })

  test("open/proposed/dropped -> planned (dropped has no ladder stage; render layer badges it)", () => {
    expect(bucketGoalPhase("open", false)).toBe("planned")
    expect(bucketGoalPhase("proposed", false)).toBe("planned")
    expect(bucketGoalPhase("dropped", false)).toBe("planned")
  })
})

describe("detectPushGateHeld", () => {
  test("matches the phrase in either normal order", () => {
    expect(detectPushGateHeld("push gate held")).toBe(true)
    expect(detectPushGateHeld("push gate stays shut until the operator's word")).toBe(true)
    expect(detectPushGateHeld("the push gate is held pending review")).toBe(true)
  })

  test("no match on unrelated text", () => {
    expect(detectPushGateHeld("everything shipped clean")).toBe(false)
  })
})

describe("detectOperatorPending", () => {
  test("matches operator-adjacent pending/ratification language", () => {
    expect(detectOperatorPending("Dashboard ratifications pending (operator)")).toBe(true)
    expect(detectOperatorPending("operator decision pending on naming")).toBe(true)
  })

  test("no match on unrelated pending text", () => {
    expect(detectOperatorPending("PR review pending from Doug")).toBe(false)
  })

  test("genuine pending phrasings match", () => {
    expect(detectOperatorPending("pending operator ratification")).toBe(true)
    expect(detectOperatorPending("operator ratification pending")).toBe(true)
    expect(detectOperatorPending("ratification pending")).toBe(true)
  })

  test("'operator-ratified' (goal is DONE) must NOT match — the G-023 regression", () => {
    expect(detectOperatorPending("operator-ratified direction, SESSION_0574")).toBe(false)
    expect(detectOperatorPending("operator-ratified")).toBe(false)
  })
})

describe("detectReviewSignal", () => {
  test("matches ratification/review-pending language", () => {
    expect(detectReviewSignal("ratifications pending: name, wording")).toBe(true)
    expect(detectReviewSignal("awaiting operator sign-off")).toBe(true)
    expect(detectReviewSignal("push gate held pending the clean rerun")).toBe(true)
  })

  test("no match on plain in-progress narrative", () => {
    expect(detectReviewSignal("Lane B shipped the write path; Lane A continues")).toBe(false)
  })
})

describe("parseSessionFile", () => {
  test("returns null for a non-SESSION filename", () => {
    expect(parseSessionFile("docs/sprints/_template/SESSION_TEMPLATE.md", "---\n---\n")).toBeNull()
  })

  test("extracts number/title/status/lane and classifies + buckets", () => {
    const content = [
      "---",
      'title: "SESSION 0580 — G-022 Lane B: member technique-progress wiring"',
      "status: in-progress",
      "lane: bbl",
      "---",
      "",
      "# body — push gate held pending the operator's word",
    ].join("\n")
    const row = parseSessionFile("docs/sprints/SESSION_0580.md", content)
    expect(row).toEqual({
      number: "0580",
      title: "G-022 Lane B: member technique-progress wiring",
      status: "in-progress",
      lane: "bbl",
      product: "bbl",
      phase: "held", // in-progress + push-gate-held body marker → brown (held) belt
      pushGateHeld: true,
    })
  })

  test("a session with no lane frontmatter classifies to the rdd umbrella", () => {
    const content = ["---", 'title: "SESSION 0100 — some docs pass"', "status: closed", "---"].join(
      "\n",
    )
    const row = parseSessionFile("docs/sprints/SESSION_0100.md", content)
    expect(row?.lane).toBeUndefined()
    expect(row?.product).toBe("rdd")
    expect(row?.phase).toBe("done")
  })
})

describe("parseGoalsDetail", () => {
  const fixture = [
    "### G-001 — Land Brian Truelson (FI-001)",
    "",
    "- **Status:** in-progress — P0",
    "- **Lane:** lineage / onboarding. **Gated:** real send held.",
    "- **Why:** the claim loop is the moat's engine.",
    "",
    "### G-016 — Email Boards program (5 brands, phased)",
    "",
    "- **Status:** open — P2",
    "- **Lane:** automation / email. **Depends on:** G-017 pilot.",
    "",
    "### G-021 — Mammoth lean operating shell + sales-cockpit tracer",
    "",
    "- **Status:** in-progress — P1",
    "- **Lane:** Mammoth product / vault-kit / CRM.",
    "- **Progress:** ratifications pending (operator): loop naming, retention wording.",
    "",
    "### G-004 — BBLApp feature adaptation",
    "",
    "- **Status:** done — P1 (SESSION_0500)",
    "- **Lane:** lineage / member dashboard.",
  ].join("\n")

  const rows = parseGoalsDetail(fixture)

  test("parses every G-row with id/title/status/priority/lane/summary", () => {
    expect(rows).toHaveLength(4)
    expect(rows[0]).toMatchObject({
      id: "G-001",
      title: "Land Brian Truelson (FI-001)",
      status: "in-progress",
      priority: "P0",
      lane: "lineage / onboarding.",
      product: "bbl",
      phase: "in-flight",
      summary: "Land Brian Truelson (FI-001)",
    })
  })

  test("a middle-dot-separated status (real ledger quirk) still isolates the status word", () => {
    const dotFixture = [
      "### G-012 — Fixture-ownership module",
      "",
      "- **Status:** landed · P2 · SESSION_0551",
    ].join("\n")
    const [row] = parseGoalsDetail(dotFixture)
    expect(row).toMatchObject({ status: "landed", priority: "P2" })
  })

  test("classifies product per goal (mmb/bbl/rdd)", () => {
    expect(rows.find(r => r.id === "G-021")?.product).toBe("mmb")
    expect(rows.find(r => r.id === "G-016")?.product).toBe("rdd")
    expect(rows.find(r => r.id === "G-004")?.product).toBe("bbl")
  })

  test("done goal reaches the done phase", () => {
    expect(rows.find(r => r.id === "G-004")?.phase).toBe("done")
  })

  test("an operator-pending signal in the body flags the row AND bumps phase to review", () => {
    const g021 = rows.find(r => r.id === "G-021")
    expect(g021?.operatorPending).toBe(true)
    expect(g021?.phase).toBe("review")
  })

  test("a goal with no pending signal is not flagged", () => {
    expect(rows.find(r => r.id === "G-016")?.operatorPending).toBe(false)
  })

  test("a Lane bullet followed by another bullet on the next line doesn't bleed across the newline", () => {
    const wrapFixture = [
      "### G-015 — Hermes local automation",
      "",
      "- **Status:** open — P1",
      "- **Lane:** automation / agentic ops.",
      "- **Why:** the dashboard is only alive if something feeds it daily.",
    ].join("\n")
    const [row] = parseGoalsDetail(wrapFixture)
    expect(row.lane).toBe("automation / agentic ops.")
  })

  test("a Lane label embedded inline inside a different bullet's prose still resolves", () => {
    const inlineFixture = [
      "### G-019 — Mammoth landing resurrection",
      "",
      "- **Status:** open — P2",
      "- **Pointer:** docs/product/mammoth-build/ (added when the mock came off",
      "  prod). **Lane:** Mammoth product. **Why:** was briefly live on BBL prod.",
    ].join("\n")
    const [row] = parseGoalsDetail(inlineFixture)
    expect(row.lane).toBe("Mammoth product.")
    expect(row.product).toBe("mmb")
  })
})
