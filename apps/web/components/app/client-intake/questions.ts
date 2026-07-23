/**
 * questions.ts — the RDD initial-client-meeting questionnaire + its Markdown serializer
 * (SESSION_0625, G-021 lane).
 *
 * ── Provenance ───────────────────────────────────────────────────────────────────────────────────
 * The 15 questions are the operator's `docs/product/rdd/assets/Initial_Client_Meeting_Template.docx`
 * (uploaded SESSION_0598), **re-scoped** from its inherited Tableau / data-visualization-firm framing
 * to RDD's actual business: a software + design agency. That re-scope was flagged as required before
 * client use by Brandon's `/rr` in `docs/product/rdd/assets/README.md` ("De-Tableau re-scope needed")
 * — this file is where it lands. Order and count are 1:1 with the .docx so the mapping stays
 * auditable; only the wording changed.
 *
 * ── Why the questions live in a pure module ──────────────────────────────────────────────────────
 * The form is a live, in-meeting capture surface; this module is its testable core (pure data +
 * a pure serializer, no React, no fs, no network). The serializer's output is the ONLY artifact the
 * form produces — see the security note on {@link toMarkdown}.
 */

export type IntakeQuestion = {
  /** Stable key — also the answer-map key and the localStorage field name. Never renumber. */
  id: string
  /** Asked out loud / read by the client. */
  prompt: string
  /** The interviewer's note: what this question is actually digging for. */
  why: string
}

/**
 * The 15-question discovery agenda. Section grouping is deliberate — a discovery call that jumps
 * between money, people, and taste feels like an interrogation; grouped, it feels like a
 * conversation.
 */
export const INTAKE_SECTIONS: { title: string; questions: IntakeQuestion[] }[] = [
  {
    title: "The work",
    questions: [
      {
        id: "goals",
        prompt: "What are your goals and objectives?",
        why: "The overarching outcome they want from the software and design we build together.",
      },
      {
        id: "challenges",
        prompt: "What specific challenges are you facing right now?",
        why: "The pain points they believe a better product or process would relieve.",
      },
      {
        id: "systems",
        prompt: "What systems, tools, and data are you running on today?",
        why: "The current stack — CRM, spreadsheets, existing site — its shape and its quality.",
      },
      {
        id: "metrics",
        prompt: "What numbers tell you the business is working?",
        why: "The handful of measures that actually drive their decisions.",
      },
      {
        id: "effortless",
        prompt: "What should this product make effortless?",
        why: "The specific daily friction they want gone — the strongest signal for scoping v1.",
      },
    ],
  },
  {
    title: "The people",
    questions: [
      {
        id: "stakeholders",
        prompt: "Who are the key stakeholders and decision-makers?",
        why: "Who uses it, who signs off, and who can say no late.",
      },
      {
        id: "involvement",
        prompt: "How involved do you want to be in the process?",
        why: "Deep in every step, or hands-off with checkpoints — sets the whole cadence.",
      },
      {
        id: "communication",
        prompt: "How do you prefer to communicate?",
        why: "Channel and frequency for updates, progress, and problems.",
      },
      {
        id: "reporting",
        prompt: "How often do you want updates and reporting?",
        why: "Their expected rhythm — weekly demo, monthly summary, on-milestone.",
      },
      {
        id: "partners",
        prompt: "Are there other partners or teams involved?",
        why: "Anyone we'd need to coordinate with — incumbent agency, IT, a contractor.",
      },
    ],
  },
  {
    title: "The shape of the deal",
    questions: [
      {
        id: "timeline_budget",
        prompt: "What is your timeline and budget?",
        why: "The two constraints every scope decision has to respect.",
      },
      {
        id: "prior_experience",
        prompt: "Have you had software or design built for you before? How did it go?",
        why: "Calibrates vocabulary, expectations, and which past failure they're guarding against.",
      },
      {
        id: "design_direction",
        prompt: "Any brand or visual direction you love — or want to avoid?",
        why: "Examples, references, colors, competitors they admire or refuse to resemble.",
      },
      {
        id: "privacy_security",
        prompt: "Any privacy, security, or compliance concerns?",
        why: "Sensitive data, regulated industry, or anything that changes how we host and store.",
      },
      {
        id: "scale",
        prompt: "Do you see this scaling or expanding later?",
        why: "Whether to build for the pilot or for the platform — an architecture fork, not a nicety.",
      },
    ],
  },
]

/** Flat question list in agenda order. */
export const INTAKE_QUESTIONS: IntakeQuestion[] = INTAKE_SECTIONS.flatMap(s => s.questions)

export type IntakeHeader = {
  /** Client / company name. */
  client: string
  /** Primary contact at the client. */
  contact: string
  /** ISO `YYYY-MM-DD`. */
  meetingDate: string
  /**
   * Whether the answers contain REAL client information. Mirrors the `contains_real_data` field on
   * `docs/product/mammoth-build/assets/Michaels_Notes_Meeting.md`; the Client_Meeting_Intake recipe
   * reads it to decide whether the capture may be committed to the repo at all.
   */
  containsRealData: boolean
}

/** `Mammoth Build Co.` → `mammoth-build-co`. */
export function clientSlug(client: string): string {
  return client
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** How many questions have a non-blank answer — drives the form's progress readout. */
export function answeredCount(answers: Record<string, string>): number {
  return INTAKE_QUESTIONS.filter(q => (answers[q.id] ?? "").trim().length > 0).length
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
 * frontmatter so the recipe can refuse to commit it.
 */
export function toMarkdown(header: IntakeHeader, answers: Record<string, string>): string {
  const client = header.client.trim() || "unnamed-client"
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
    `# ${client} — Initial client meeting`,
    "",
    header.containsRealData
      ? "> ⚠️ **Contains real client data — do NOT commit to git.** Store via the gated uploader/R2 seam or the private vault."
      : "> Demo-safe capture — no real client data.",
    "",
  ]

  for (const section of INTAKE_SECTIONS) {
    lines.push(`## ${section.title}`, "")
    for (const q of section.questions) {
      const answer = (answers[q.id] ?? "").trim()
      lines.push(`### ${q.prompt}`, "", answer || "_(not answered)_", "")
    }
  }

  lines.push(
    "## Next actions",
    "",
    "_(filled during the grill — one row per material ask, routed to PRD / STORIES / goals.)_",
    "",
  )
  return lines.join("\n")
}
