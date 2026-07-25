/**
 * @ronin-dojo/ui-kit/intake — the client-intake feature-module (ADR 0051: any feature-module can
 * run on any app). Pure data + pure functions, zero React — standalone bun apps (`clients/*`)
 * import this sub-path directly. Per-brand question sets live in `./questionnaires/*`.
 */

export {
  answeredCount,
  clientSlug,
  flatQuestions,
  type IntakeHeader,
  type IntakeQuestion,
  type Questionnaire,
  type QuestionnaireSection,
  toMarkdown,
} from "./questionnaire";

export { METAL_BUILDING_SALES } from "./questionnaires/metal-building-sales";
export { RDD_INITIAL_CLIENT_MEETING } from "./questionnaires/rdd-initial-client-meeting";
