// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, test } from "bun:test"
import {
  answeredCount,
  clientSlug,
  INTAKE_QUESTIONS,
  INTAKE_SECTIONS,
  toMarkdown,
} from "./questions"

const header = {
  client: "Mammoth Build Co.",
  contact: "Michael Flores",
  meetingDate: "2026-07-23",
  containsRealData: false,
}

describe("INTAKE_QUESTIONS", () => {
  test("keeps the source template's 15 questions, 1:1", () => {
    expect(INTAKE_QUESTIONS).toHaveLength(15)
    expect(INTAKE_SECTIONS.flatMap(s => s.questions)).toHaveLength(15)
  })

  test("every question id is unique — ids key the answer map and localStorage", () => {
    expect(new Set(INTAKE_QUESTIONS.map(q => q.id)).size).toBe(15)
  })

  test("the Tableau / data-viz framing is gone (the README's de-Tableau re-scope gate)", () => {
    const all = INTAKE_QUESTIONS.map(q => `${q.prompt} ${q.why}`)
      .join(" ")
      .toLowerCase()
    expect(all).not.toContain("tableau")
    expect(all).not.toContain("dashboard")
    expect(all).not.toContain("data analytics")
  })
})

describe("clientSlug", () => {
  test("slugifies a company name", () => {
    expect(clientSlug("Mammoth Build Co.")).toBe("mammoth-build-co")
    expect(clientSlug("  Acme & Sons  ")).toBe("acme-sons")
  })
})

describe("answeredCount", () => {
  test("counts only non-blank answers", () => {
    expect(answeredCount({})).toBe(0)
    expect(answeredCount({ goals: "   ", challenges: "cash flow" })).toBe(1)
  })

  test("ignores keys that aren't questions", () => {
    expect(answeredCount({ notAQuestion: "x" })).toBe(0)
  })
})

describe("toMarkdown", () => {
  test("emits the capture-note frontmatter the Client_Meeting_Intake recipe reads", () => {
    const md = toMarkdown(header, { goals: "Win more building jobs" })
    expect(md.startsWith("---\ntype: meeting-notes\n")).toBe(true)
    expect(md).toContain("client: mammoth-build-co")
    expect(md).toContain("contact: Michael Flores")
    expect(md).toContain("meeting_date: 2026-07-23")
    expect(md).toContain("status: captured-needs-grill")
    expect(md).toContain("contains_real_data: false")
  })

  test("renders every question, marking the unanswered ones honestly", () => {
    const md = toMarkdown(header, { goals: "Win more building jobs" })
    for (const q of INTAKE_QUESTIONS) expect(md).toContain(`### ${q.prompt}`)
    expect(md).toContain("Win more building jobs")
    expect(md).toContain("_(not answered)_")
  })

  test("a real-data capture carries a do-NOT-commit banner; a demo-safe one does not", () => {
    expect(toMarkdown({ ...header, containsRealData: true }, {})).toContain("do NOT commit to git")
    expect(toMarkdown(header, {})).toContain("Demo-safe capture")
    expect(toMarkdown(header, {})).not.toContain("do NOT commit")
  })

  test("falls back rather than emitting an empty client/contact", () => {
    const md = toMarkdown({ ...header, client: "  ", contact: "" }, {})
    expect(md).toContain("client: unnamed-client")
    expect(md).toContain("contact: TBD")
  })
})
