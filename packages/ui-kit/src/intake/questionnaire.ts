/**
 * questionnaire.ts — the brand-agnostic client-intake core (SESSION_0632, extracted from
 * `apps/web/components/app/client-intake/questions.ts` per ADR 0051's kernel→brand→app model).
 *
 * A `Questionnaire` is pure data (sections of questions); the serializer and counters are pure
 * functions over it. **Zero runtime deps, zero React** — ui-kit's React is a peer dependency, and
 * a standalone bun app (`clients/*`) must be able to import this without pulling one in. Per-brand
 * question sets live in `./questionnaires/*`; every brand shares this ONE serializer.
 */

export type IntakeQuestion = {
  /** Stable key — also the answer-map key and the localStorage field name. Never renumber. */
  id: string;
  /** Asked out loud / read by the client. */
  prompt: string;
  /** The interviewer's note: what this question is actually digging for. */
  why: string;
};

export type QuestionnaireSection = {
  title: string;
  questions: IntakeQuestion[];
};

export type Questionnaire = {
  /** Stable identifier, e.g. `rdd-initial-client-meeting`. */
  id: string;
  /** Rendered into the capture-note H1: `# <client> — <title>`. */
  title: string;
  /**
   * Section grouping is deliberate — a discovery call that jumps between money, people, and taste
   * feels like an interrogation; grouped, it feels like a conversation.
   */
  sections: QuestionnaireSection[];
};

export type IntakeHeader = {
  /** Client / company name. */
  client: string;
  /** Primary contact at the client. */
  contact: string;
  /** ISO `YYYY-MM-DD`. */
  meetingDate: string;
  /**
   * Whether the answers contain REAL client information. Mirrors the `contains_real_data` field on
   * `docs/product/mammoth-build/assets/Michaels_Notes_Meeting.md`; the Client_Meeting_Intake recipe
   * reads it to decide whether the capture may be committed to the repo at all.
   */
  containsRealData: boolean;
};

/** Flat question list in agenda order. */
export function flatQuestions(questionnaire: Questionnaire): IntakeQuestion[] {
  return questionnaire.sections.flatMap((s) => s.questions);
}

/** `Mammoth Build Co.` → `mammoth-build-co`. */
export function clientSlug(client: string): string {
  return client
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** How many questions have a non-blank answer — drives the form's progress readout. */
export function answeredCount(
  questionnaire: Questionnaire,
  answers: Record<string, string>,
): number {
  return flatQuestions(questionnaire).filter((q) => (answers[q.id] ?? "").trim().length > 0).length;
}

/**
 * Serialize a filled intake into the capture-note Markdown the **Client_Meeting_Intake** recipe
 * consumes — same frontmatter shape as `Michaels_Notes_Meeting.md`, so a fresh capture drops
 * straight into the grill → synthesize → route flow with no reformatting.
 *
 * ── Security: this string is the ONLY output ─────────────────────────────────────────────────────
 * It is returned to the caller (clipboard / file download) and NEVER posted to a server, written to
 * a database, or committed. A filled intake carries a real client's name, terms and problems — the
 * RDD assets README is explicit that executed/filled instances must live in the gated uploader/R2
 * seam, never in git. `contains_real_data: true` is the flag that says so out loud, carried in the
 * frontmatter so the recipe can refuse to commit it. (A brand app that persists intake to its OWN
 * database — e.g. Mammoth's CRM lead path — does so in its own server code, not here.)
 */
export function toMarkdown(
  questionnaire: Questionnaire,
  header: IntakeHeader,
  answers: Record<string, string>,
): string {
  const client = header.client.trim() || "unnamed-client";
  const lines: string[] = [
    "---",
    "type: meeting-notes",
    `client: ${clientSlug(client)}`,
    `contact: ${header.contact.trim() || "TBD"}`,
    `meeting_date: ${header.meetingDate}`,
    "status: captured-needs-grill",
    `contains_real_data: ${header.containsRealData}`,
    "---",
    "",
    `# ${client} — ${questionnaire.title}`,
    "",
    header.containsRealData
      ? "> ⚠️ **Contains real client data — do NOT commit to git.** Store via the gated uploader/R2 seam or the private vault."
      : "> Demo-safe capture — no real client data.",
    "",
  ];

  for (const section of questionnaire.sections) {
    lines.push(`## ${section.title}`, "");
    for (const q of section.questions) {
      const answer = (answers[q.id] ?? "").trim();
      lines.push(`### ${q.prompt}`, "", answer || "_(not answered)_", "");
    }
  }

  lines.push(
    "## Next actions",
    "",
    "_(filled during the grill — one row per material ask, routed to PRD / STORIES / goals.)_",
    "",
  );
  return lines.join("\n");
}
