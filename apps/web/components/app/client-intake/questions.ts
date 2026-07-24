/**
 * questions.ts — the RDD initial-client-meeting questionnaire, re-exported from the kernel
 * (SESSION_0632; originally built in-app at SESSION_0625, G-021 lane).
 *
 * The questionnaire content, types, and serializer now live in `@ronin-dojo/ui-kit/intake`
 * (ADR 0051: intake is a kernel feature-module any brand app can mount). This module is the
 * app-side adapter: it binds the generic core to the RDD questionnaire so the form and its tests
 * keep the original single-questionnaire signatures unchanged.
 */

import {
  answeredCount as kernelAnsweredCount,
  clientSlug,
  flatQuestions,
  type IntakeHeader,
  type IntakeQuestion,
  RDD_INITIAL_CLIENT_MEETING,
  toMarkdown as kernelToMarkdown,
} from "@ronin-dojo/ui-kit/intake"

export { clientSlug }
export type { IntakeHeader, IntakeQuestion }

/** The 15-question discovery agenda, grouped as the kernel questionnaire defines it. */
export const INTAKE_SECTIONS: { title: string; questions: IntakeQuestion[] }[] =
  RDD_INITIAL_CLIENT_MEETING.sections

/** Flat question list in agenda order. */
export const INTAKE_QUESTIONS: IntakeQuestion[] = flatQuestions(RDD_INITIAL_CLIENT_MEETING)

/** How many questions have a non-blank answer — drives the form's progress readout. */
export function answeredCount(answers: Record<string, string>): number {
  return kernelAnsweredCount(RDD_INITIAL_CLIENT_MEETING, answers)
}

/** Serialize a filled intake — see the kernel's security note: this string is the ONLY output. */
export function toMarkdown(header: IntakeHeader, answers: Record<string, string>): string {
  return kernelToMarkdown(RDD_INITIAL_CLIENT_MEETING, header, answers)
}
