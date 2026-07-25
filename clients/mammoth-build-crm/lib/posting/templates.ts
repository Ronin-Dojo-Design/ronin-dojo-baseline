/**
 * Mammoth Build CRM — posting-template library (SESSION_0687).
 *
 * Transcribed, verbatim in structure, from the approved template source of truth:
 * docs/product/mammoth-build/templates/posting-templates.md ("DRAFT — NOT APPROVED FOR
 * PUBLISHING" at the time of writing — the doc's draft status is exactly why the pipeline this
 * module feeds STOPS at `approved`, never auto-posts). Hardcoded as TS data rather than parsed
 * from the markdown at runtime — the same "content-as-code" convention `lib/content.ts` already
 * uses for landing copy. If the source doc changes, update this file to match (kept in the same
 * PR/session as the doc change so they never drift silently).
 *
 * Every `[PLACEHOLDER]` token below is a literal bracket-wrapped UPPER_SNAKE_CASE string, matched
 * by the generator's placeholder pattern (lib/posting/generator.ts). Never fill one with a guess —
 * an unresolved placeholder blocks approval (lib/posting/status.ts).
 */

export type PostingPlatform = "facebook" | "instagram" | "google_business_profile";

export const POSTING_PLATFORMS: readonly PostingPlatform[] = [
  "facebook",
  "instagram",
  "google_business_profile",
] as const;

export type PostingTemplateKey =
  | "before_after"
  | "build_timelapse"
  | "crew_spotlight"
  | "completed_build"
  | "customer_review"
  | "faq_answer"
  | "progress_milestone";

export type PostingTemplateDefinition = {
  key: PostingTemplateKey;
  /** Matches the doc's numbered heading (minus the number). */
  title: string;
  /** The doc's "Usage note" — when to reach for this template. */
  usageNote: string;
  /** The doc's "Asset" line — what media the post needs. */
  asset: string;
  /** Platform-specific copy skeleton, placeholders unfilled. */
  copy: Record<PostingPlatform, string>;
};

export const POSTING_TEMPLATES: readonly PostingTemplateDefinition[] = [
  {
    key: "before_after",
    title: "Before-and-after transformation",
    usageNote:
      "Pair the same camera position before and after to make progress immediately legible.",
    asset: "[BEFORE_PHOTO] + [AFTER_PHOTO]",
    copy: {
      facebook:
        "From [BEFORE_STAGE] to a finished [BUILDING_TYPE].\n\n" +
        "This project in [PUBLISHABLE_GENERAL_LOCATION] moved through [APPROVED_PROJECT_DETAIL] and a satisfied installation. Swipe between the first view and the finished build.\n\n" +
        "Built all the way through. [CALL_TO_ACTION_URL]",
      instagram:
        "Before → after.\n\n" +
        "[BUILDING_TYPE] · [PUBLISHABLE_GENERAL_LOCATION]\n[APPROVED_PROJECT_DETAIL]\n\n" +
        "Know the customer. Carry the build. Finish proud.\n\n" +
        "[APPROVED_HASHTAGS]",
      google_business_profile:
        "See the progress on this [BUILDING_TYPE] project, from [BEFORE_STAGE] through a satisfied installation. Planning a building? Start with the next right conversation: [CALL_TO_ACTION_URL]",
    },
  },
  {
    key: "build_timelapse",
    title: "Build timelapse",
    usageNote:
      "Use a fixed-position clip to turn one major build milestone into a short proof-of-process story.",
    asset: "[TIMELAPSE_VIDEO]",
    copy: {
      facebook:
        "Watch [PROJECT_STAGE] take shape on this [BUILDING_TYPE].\n\n" +
        "The quick version is satisfying. The real work is careful ownership from one stage to the next. [APPROVED_PROJECT_DETAIL]\n\n" +
        "Built all the way through. [CALL_TO_ACTION_URL]",
      instagram:
        "[PROJECT_STAGE] in motion.\n\n" +
        "[BUILDING_TYPE] · [PUBLISHABLE_GENERAL_LOCATION]\n[APPROVED_PROJECT_DETAIL]\n\n" +
        "[APPROVED_HASHTAGS]",
      google_business_profile:
        "A quick look at [PROJECT_STAGE] for a [BUILDING_TYPE] project. Mammoth carries every project through delivery and a satisfied installation. [CALL_TO_ACTION_URL]",
    },
  },
  {
    key: "crew_spotlight",
    title: "Crew spotlight",
    usageNote:
      "Publish only with written crew consent and anchor the spotlight in a specific contribution to the build.",
    asset: "[PHOTO_OR_VIDEO]",
    copy: {
      facebook:
        "Meet [CREW_MEMBER_NAME], [CREW_MEMBER_ROLE].\n\n" +
        "On this [BUILDING_TYPE] project, [CREW_MEMBER_NAME] owned [APPROVED_PROJECT_DETAIL].\n\n" +
        '"[CREW_MEMBER_QUOTE]"\n\n' +
        "Capable, personal, and proud — that's how the work gets carried through.",
      instagram:
        "Crew spotlight: [CREW_MEMBER_NAME] · [CREW_MEMBER_ROLE]\n\n" +
        "[APPROVED_PROJECT_DETAIL]\n\n" +
        '"[CREW_MEMBER_QUOTE]"\n\n' +
        "[APPROVED_HASHTAGS]",
      google_business_profile:
        "Meet [CREW_MEMBER_NAME], [CREW_MEMBER_ROLE], and see how [APPROVED_PROJECT_DETAIL] helped carry this [BUILDING_TYPE] project forward.",
    },
  },
  {
    key: "completed_build",
    title: "Completed-build feature",
    usageNote:
      "Lead with verified building type and one useful project detail; omit location or dimensions unless approved.",
    asset: "[AFTER_PHOTO] or [PHOTO_OR_VIDEO]",
    copy: {
      facebook:
        "Completed: [BUILDING_TYPE] in [PUBLISHABLE_GENERAL_LOCATION].\n\n" +
        "[APPROVED_DIMENSIONS]\n[APPROVED_PROJECT_DETAIL]\n\n" +
        "Completion means more than delivery: the selected Installation Path reaches a satisfied installation, with concerns owned through the finish.\n\n" +
        "[CALL_TO_ACTION_URL]",
      instagram:
        "Finished proud.\n\n" +
        "[BUILDING_TYPE]\n[APPROVED_DIMENSIONS]\n[PUBLISHABLE_GENERAL_LOCATION]\n\n" +
        "[APPROVED_PROJECT_DETAIL]\n\n" +
        "Built all the way through.\n[APPROVED_HASHTAGS]",
      google_business_profile:
        "Completed [BUILDING_TYPE]: [APPROVED_PROJECT_DETAIL]. Mammoth carries projects through delivery and a satisfied installation. Start your build conversation: [CALL_TO_ACTION_URL]",
    },
  },
  {
    key: "customer_review",
    title: "Customer-review repost",
    usageNote:
      "Repost only an exact approved excerpt with written permission and a link to the original review when appropriate.",
    asset: "[APPROVED_REVIEW_GRAPHIC_OR_PROJECT_PHOTO]",
    copy: {
      facebook:
        '"[CUSTOMER_QUOTE]"\n\n' +
        "Thank you, [CUSTOMER_FIRST_NAME_OR_APPROVED_LABEL], for trusting Mammoth with your [BUILDING_TYPE] project.\n\n" +
        "Read or share a Mammoth experience: [GOOGLE_REVIEW_LINK]",
      instagram:
        '"[CUSTOMER_QUOTE]"\n\n' +
        "— [CUSTOMER_FIRST_NAME_OR_APPROVED_LABEL], [BUILDING_TYPE]\n\n" +
        "Thank you for letting Mammoth carry the build through.\n[APPROVED_HASHTAGS]",
      google_business_profile:
        'Customer feedback: "[CUSTOMER_QUOTE]"\n\n' +
        "Thank you, [CUSTOMER_FIRST_NAME_OR_APPROVED_LABEL]. Learn how Mammoth carries a project through delivery and a satisfied installation: [CALL_TO_ACTION_URL]",
    },
  },
  {
    key: "faq_answer",
    title: "FAQ / educational answer",
    usageNote: "Answer one real buyer question with canon-approved language and one clear next action.",
    asset: "[FAQ_GRAPHIC_OR_RELEVANT_PROJECT_PHOTO]",
    copy: {
      facebook:
        "FAQ: [FAQ_QUESTION]\n\n" +
        "[CANON_ANSWER]\n\n" +
        "Still deciding what the right next step is for your [BUILDING_TYPE]? Start here: [CALL_TO_ACTION_URL]",
      instagram:
        "[FAQ_QUESTION]\n\n" +
        "[CANON_ANSWER]\n\n" +
        "Save this for your building plan.\n[APPROVED_HASHTAGS]",
      google_business_profile:
        "[FAQ_QUESTION]\n\n" +
        "[CANON_ANSWER]\n\n" +
        "Ask Mammoth about the next step for your building: [CALL_TO_ACTION_URL]",
    },
  },
  {
    key: "progress_milestone",
    title: "Progress milestone",
    usageNote:
      "Use one during-build image to show visible ownership between the before and finished shots.",
    asset: "[PHOTO_OR_VIDEO]",
    copy: {
      facebook:
        "Project update: [PROJECT_STAGE].\n\n" +
        "This [BUILDING_TYPE] has reached [APPROVED_PROJECT_DETAIL]. The next owned action is [APPROVED_NEXT_ACTION_FOR_PUBLICATION].\n\n" +
        "Smooth handoffs keep a project moving without dropping the relationship.",
      instagram:
        "Now: [PROJECT_STAGE]\nNext: [APPROVED_NEXT_ACTION_FOR_PUBLICATION]\n\n" +
        "[BUILDING_TYPE] · [PUBLISHABLE_GENERAL_LOCATION]\n\n" +
        "Carry the build.\n[APPROVED_HASHTAGS]",
      google_business_profile:
        "This [BUILDING_TYPE] project has reached [PROJECT_STAGE]. Mammoth keeps the next action visible as the build moves toward delivery and a satisfied installation. [CALL_TO_ACTION_URL]",
    },
  },
] as const;

const TEMPLATE_BY_KEY = new Map<PostingTemplateKey, PostingTemplateDefinition>(
  POSTING_TEMPLATES.map((t) => [t.key, t]),
);

/** Look up a template definition, or throw — every `templateKey` on a draft must resolve. */
export function getPostingTemplate(key: PostingTemplateKey): PostingTemplateDefinition {
  const template = TEMPLATE_BY_KEY.get(key);
  if (!template) {
    throw new Error(`Unknown posting template key: ${key}`);
  }
  return template;
}
