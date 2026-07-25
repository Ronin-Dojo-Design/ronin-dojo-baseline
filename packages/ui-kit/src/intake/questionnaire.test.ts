// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep.
import { describe, expect, test } from "bun:test";
import {
  answeredCount,
  clientSlug,
  flatQuestions,
  type Questionnaire,
  toMarkdown,
} from "./questionnaire";

/**
 * Kernel-level tests run against a SYNTHETIC questionnaire — brand question sets carry their own
 * content tests (and `apps/web`'s 10 extraction tests pin the RDD instance's behavior unchanged).
 */
const questionnaire: Questionnaire = {
  id: "test-brand-discovery",
  title: "Discovery call",
  sections: [
    {
      title: "Alpha",
      questions: [
        { id: "one", prompt: "Question one?", why: "First." },
        { id: "two", prompt: "Question two?", why: "Second." },
      ],
    },
    {
      title: "Beta",
      questions: [{ id: "three", prompt: "Question three?", why: "Third." }],
    },
  ],
};

const header = {
  client: "Acme Steel LLC",
  contact: "Jo Rivera",
  meetingDate: "2026-07-23",
  containsRealData: false,
};

describe("flatQuestions", () => {
  test("flattens sections in agenda order", () => {
    expect(flatQuestions(questionnaire).map((q) => q.id)).toEqual(["one", "two", "three"]);
  });
});

describe("answeredCount", () => {
  test("counts only non-blank answers to real questions", () => {
    expect(answeredCount(questionnaire, {})).toBe(0);
    expect(answeredCount(questionnaire, { one: "  ", two: "yes", ghost: "x" })).toBe(1);
  });
});

describe("clientSlug", () => {
  test("slugifies a company name", () => {
    expect(clientSlug("Acme Steel LLC")).toBe("acme-steel-llc");
  });
});

describe("toMarkdown", () => {
  test("emits the capture-note frontmatter + the questionnaire title in the H1", () => {
    const md = toMarkdown(questionnaire, header, { one: "Grow revenue" });
    expect(md.startsWith("---\ntype: meeting-notes\n")).toBe(true);
    expect(md).toContain("client: acme-steel-llc");
    expect(md).toContain("# Acme Steel LLC — Discovery call");
    expect(md).toContain("contains_real_data: false");
  });

  test("renders every question and marks unanswered ones honestly", () => {
    const md = toMarkdown(questionnaire, header, { one: "Grow revenue" });
    for (const q of flatQuestions(questionnaire)) expect(md).toContain(`### ${q.prompt}`);
    expect(md).toContain("Grow revenue");
    expect(md).toContain("_(not answered)_");
  });

  test("a real-data capture carries the do-NOT-commit banner", () => {
    expect(toMarkdown(questionnaire, { ...header, containsRealData: true }, {})).toContain(
      "do NOT commit to git",
    );
    expect(toMarkdown(questionnaire, header, {})).toContain("Demo-safe capture");
  });
});
