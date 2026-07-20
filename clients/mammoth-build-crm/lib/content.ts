import type { Project } from "./types";

// `SEED_PROJECTS` doubles as `prisma/seed.ts`'s source data — varied `source` values here
// (referral / trade_show / web_form) are what make the Lead Source facet's per-source counts
// non-trivial on a freshly seeded `mammoth_dev` (SESSION_0586, G-021 loop 3b).

// ---- Landing content (Mammoth Metal Buildings) ----

export const HERO = {
  eyebrow: "Pre-Engineered Metal Buildings",
  headline: "We don't quote, ship, and disappear.",
  sub: "Most metal-building companies hand off a kit and vanish. Mammoth stays in the whole project — design, fabrication, sequenced delivery, and construction — with proof at every step.",
  cta: "Start Your Build",
};

export const DIFFERENTIATOR =
  "Every project carries context, budget pressure, timelines, and people who will live or work inside the finished space. We build for that — not just the steel.";

export const PROCESS_STEPS: { label: string; desc: string }[] = [
  { label: "Design", desc: "Structural, code, and energy design dialed to your site and loads." },
  { label: "Fabrication", desc: "Built-to-order PEMB components, off-site, on schedule." },
  { label: "Sequenced Delivery", desc: "Components arrive in erection order — no jobsite chaos." },
  { label: "Construction", desc: "We stay in it through erection and handoff. Documented." },
];

export const BUILDING_TYPES: { id: string; title: string; blurb: string }[] = [
  { id: "commercial", title: "Commercial", blurb: "Service centers, offices, and storefronts." },
  { id: "auto-service", title: "Auto Service", blurb: "Bays, lifts, and flow built around the work." },
  { id: "retail", title: "Retail", blurb: "Clear-span space that flexes with your floor plan." },
  { id: "flex", title: "Flex Space", blurb: "Warehouse + office under one engineered roof." },
  { id: "agricultural", title: "Agricultural", blurb: "Equipment, livestock, and storage that lasts." },
  { id: "residential", title: "Residential", blurb: "Shops, garages, and barndominiums." },
  { id: "office", title: "Office", blurb: "Finished, conditioned workspace, planned in." },
  { id: "warehouse", title: "Warehouse", blurb: "Tall, wide, and ready for racking." },
];

export const CONTEXT_BAND =
  "Process, communication, and execution matter as much as the building itself.";

// ---- CRM seed data (demo projects for Sunday review) ----

const now = Date.now();
const iso = (offsetDays: number) =>
  new Date(now - offsetDays * 86_400_000).toISOString();

export const SEED_PROJECTS: Project[] = [
  {
    id: "seed-ridgeline",
    name: "Ridgeline Auto — 60×100 Service",
    contactName: "Dana Ruiz",
    contactEmail: "dana@ridgelineauto.example",
    buildingType: "Auto Service",
    use: "Auto service center, 6 bays",
    region: "Boise, ID",
    width: 60,
    length: 100,
    eaveHeight: 16,
    stage: "fabrication",
    source: "referral",
    nextTask: "Send fabrication-milestone invoice; confirm steel delivery date",
    orderConfirmed: true,
    orderNumber: "MB-2041",
    notes: "PE stamp (ID) on file. Snow load confirmed.",
    photos: [],
    createdAt: iso(38),
    updatedAt: iso(2),
  },
  {
    id: "seed-harvest",
    name: "Harvest Co-op — 80×160 Storage",
    contactName: "Will Tanner",
    contactEmail: "wtanner@harvestcoop.example",
    buildingType: "Agricultural",
    use: "Equipment + grain storage",
    region: "Lincoln, NE",
    width: 80,
    length: 160,
    eaveHeight: 20,
    stage: "quote",
    source: "trade_show",
    nextTask: "Finalize quote from product library; review wind load options",
    orderConfirmed: false,
    orderNumber: null,
    notes: "Budget-sensitive. Wants two pricing tiers.",
    photos: [],
    createdAt: iso(9),
    updatedAt: iso(1),
  },
  {
    id: "seed-flex",
    name: "Cedar Flex — 50×80 Warehouse+Office",
    contactName: "Priya Shah",
    contactEmail: "priya@cedarflex.example",
    buildingType: "Flex Space",
    use: "Warehouse with 1,200 sf office",
    region: "Greensboro, NC",
    width: 50,
    length: 80,
    eaveHeight: 18,
    stage: "lead",
    source: "web_form",
    nextTask: "First-touch call within 24h; qualify use + timeline",
    orderConfirmed: false,
    orderNumber: null,
    notes: "Inbound from landing page.",
    photos: [],
    createdAt: iso(1),
    updatedAt: iso(0),
  },
];
