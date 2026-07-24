/**
 * Discovery-intake COMMIT planning — pure rules (SESSION_0632, goal #1 first slice).
 *
 * The /app/intake page captures a Metal Building Sales discovery call (questionnaire content
 * lives in the kernel: `@ronin-dojo/ui-kit/intake`). On the operator's EXPLICIT commit, the
 * capture becomes one Contact + one lead-stage Project — the same write shape as the New Job
 * Order form and the lead-sheet import, so intake leads land on the pipeline and the Today
 * queue like every other lead.
 *
 * Posture (MB-LEAD-002, operator ratification 2026-07-19, re-pinned SESSION_0625):
 *   - EXPLICIT commit — nothing persists until the operator confirms;
 *   - dedupe via THE ONE matcher (lib/contact-match.ts keys; the action's `matchContact` is the
 *     write-path consumer) — a matched contact is ATTACHED to, reported, and NEVER enriched or
 *     overwritten;
 *   - a capture with no valid email or phone is REFUSED: it could never be deduped, so
 *     committing it would break the idempotency contract.
 *
 * RETENTION LAW: answers flow only to the CRM DB via the executing action. Plan errors carry
 * field names, never captured answer text, so the report is safe to display anywhere.
 */

import {
  answeredCount,
  flatQuestions,
  METAL_BUILDING_SALES,
  type Questionnaire,
} from "@ronin-dojo/ui-kit/intake";
import { emailKey, phoneKey } from "./contact-match";
import { FIRST_TOUCH_NEXT_TASK } from "./lead-commit";
import { LEAD_SOURCES, type LeadSourceValue } from "./lead-source";

/** The questionnaire THIS app mounts — Mammoth runs Metal Building Sales discovery. */
export const INTAKE_QUESTIONNAIRE = METAL_BUILDING_SALES;

/** What the /app/intake form sends to the commit action. */
export type IntakeCaptureInput = {
  /** Client / company name. */
  client: string;
  /** The person on the call. */
  contactName: string;
  email: string;
  phone: string;
  /** ISO `YYYY-MM-DD`. */
  meetingDate: string;
  source: LeadSourceValue;
  /** Answer map keyed by question id. */
  answers: Record<string, string>;
};

/** One planned write: the Contact row + its lead Project (contactId/ownerId added by the action). */
export type IntakeCommitPlan =
  | { ok: false; error: string }
  | {
      ok: true;
      contact: { email: string; name: string; phone: string | null; source: LeadSourceValue };
      project: {
        buildingType: string;
        name: string;
        nextTask: string;
        notes: string;
        orderConfirmed: boolean;
        region: string;
        source: LeadSourceValue;
        stage: "lead";
        use: string;
      };
    };

/** What the commit action returns to the page. */
export type IntakeCommitReport =
  | { ok: false; error: string }
  | {
      ok: true;
      /** True when the capture attached to an existing CRM contact (nothing on it was changed). */
      contactMatched: boolean;
      projectId: string;
      projectName: string;
    };

/**
 * The Project.notes digest: the call header + ONLY the answered questions. This is a CRM note a
 * human reads on the project page — not the capture-note Markdown (frontmatter + recipe banner)
 * the kernel serializer emits for the file/vault flow; the page offers that export separately.
 */
export function intakeNotesDigest(questionnaire: Questionnaire, input: IntakeCaptureInput): string {
  const lines = [`${questionnaire.title} — ${input.meetingDate}`];
  for (const q of flatQuestions(questionnaire)) {
    const answer = (input.answers[q.id] ?? "").trim();
    if (answer) {
      lines.push("", q.prompt, answer);
    }
  }
  return lines.join("\n");
}

/** Validate the capture and shape the exact writes the commit performs. */
export function planIntakeCommit(
  questionnaire: Questionnaire,
  input: IntakeCaptureInput,
): IntakeCommitPlan {
  const client = input.client.trim();
  const contactName = input.contactName.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();

  if (!LEAD_SOURCES.includes(input.source)) {
    return { ok: false, error: "Pick a lead source from the list." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.meetingDate)) {
    return { ok: false, error: "Meeting date must be YYYY-MM-DD." };
  }
  if (emailKey(email) === null && phoneKey(phone) === null) {
    return {
      ok: false,
      error: "No valid email or phone — not committed (the lead could never be deduped).",
    };
  }
  if (answeredCount(questionnaire, input.answers) === 0) {
    return { ok: false, error: "Nothing captured — answer at least one question first." };
  }

  const name = contactName || client || "Unknown";
  return {
    ok: true,
    contact: { email, name, phone: phone || null, source: input.source },
    project: {
      buildingType: "",
      name: contactName && client ? `${contactName} — ${client}` : name,
      nextTask: FIRST_TOUCH_NEXT_TASK,
      notes: intakeNotesDigest(questionnaire, input),
      orderConfirmed: false,
      region: "",
      source: input.source,
      stage: "lead",
      use: "",
    },
  };
}
