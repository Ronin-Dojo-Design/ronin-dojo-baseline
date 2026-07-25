import type { Questionnaire } from "../questionnaire";

/**
 * The Metal Building Sales discovery questionnaire (SESSION_0632, G-027 lane) — Mammoth runs this
 * on THEIR prospects, the first brand instance of the intake module beyond RDD's own.
 *
 * ── Provenance ───────────────────────────────────────────────────────────────────────────────────
 * Content is Michael's 2026-07-18 meeting notes + MMB canon (`docs/product/mammoth-build/CONTEXT.md`):
 * the FOUR commercial lanes (steel building supply · erection/install · concrete & excavation ·
 * building-only vs building + install) that SESSION_0625's intake audit flagged as unrouted (GAP-1),
 * plus the ratified **Installation Path** axis (Mammoth-Installed / Customer-Installed — both paths
 * must reach the same Satisfied Installation standard). This questionnaire is the lanes' first real
 * consumer; the drafted MB-LANE-001/002 stories route the taxonomy into canon proper.
 */
export const METAL_BUILDING_SALES: Questionnaire = {
  id: "mmb-metal-building-sales",
  title: "Metal building discovery call",
  sections: [
    {
      title: "The building",
      questions: [
        {
          id: "commercial_lanes",
          prompt:
            "Which parts of the job do you need from us — the steel building itself, erection and install, concrete and excavation, or a combination?",
          why: "The four commercial lanes. Pins whether this is building-only supply, building + install, sitework, or turnkey — the single biggest scope fork in the quote.",
        },
        {
          id: "building_spec",
          prompt: "What building are you picturing — dimensions, and what will it be used for?",
          why: "Width × length × eave height plus the use (shop, ag, warehouse, auto service) — the spec that drives the quote and the Job Order.",
        },
        {
          id: "delivery_window",
          prompt: "When do you need the building delivered?",
          why: "The delivery window — drives production scheduling and whether the timeline is realistic against permits and site work.",
        },
      ],
    },
    {
      title: "The site",
      questions: [
        {
          id: "site_readiness",
          prompt: "Where does the site stand today — cleared, graded, utilities, concrete?",
          why: "Install Readiness signals. Every gap here is either the customer's homework or scope we should be quoting.",
        },
        {
          id: "concrete_excavation",
          prompt: "Does the site need concrete or excavation work, and who is doing it?",
          why: "The concrete-&-excavation lane in its own right — if nobody owns the pad and dirt work, it is Mammoth scope to quote, not an assumption to discover at delivery.",
        },
        {
          id: "permits",
          prompt: "Who is handling permits, and what jurisdiction are you building in?",
          why: "Permit owner + jurisdiction — code requirements and approval timelines vary by county and can gate the whole delivery window.",
        },
      ],
    },
    {
      title: "The install",
      questions: [
        {
          id: "install_path",
          prompt:
            "Who puts the building up — our crew (Mammoth-Installed) or yours (Customer-Installed)?",
          why: "The Installation Path, chosen out loud. Both paths must reach the same Satisfied Installation standard — this decides who owns erection through proof and satisfaction.",
        },
        {
          id: "install_support",
          prompt:
            "If your crew installs: have they put up a steel building before, and what support would help?",
          why: "A Customer-Installed project still owes readiness, education, and guidance (the Enablement System) — gauge experience now, not at delivery.",
        },
      ],
    },
    {
      title: "The deal",
      questions: [
        {
          id: "budget_financing",
          prompt: "What budget are you working with, and is financing part of the picture?",
          why: "The budget constraint plus whether a financing conversation belongs in the quote — surfaces sticker-shock before it kills the deal.",
        },
        {
          id: "decision_maker",
          prompt: "Who signs off on this purchase, and who else weighs in?",
          why: "The decision-maker and anyone who can say no late — a spouse, a partner, a county inspector.",
        },
      ],
    },
  ],
};
