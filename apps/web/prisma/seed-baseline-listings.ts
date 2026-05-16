import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"

/**
 * seed-baseline-listings.ts
 *
 * Production-safe seed for the BASELINE_MARTIAL_ARTS listings surface.
 * Ports the 14 Categories, 36 Tags, and ~24 Tool rows from the Dirstarter
 * template `seed.ts` into a standalone idempotent script.
 *
 * Key differences from `seed.ts`:
 *   - All `owner: { connect: { email: "admin@dirstarter.com" } }` remapped
 *     to Brian's prod admin user id.
 *   - Categories/Tags: upsert on `slug` (unique).
 *   - Tools: findFirst on `slug` + create if missing (idempotent).
 *   - No test users, no DUMMY_CONTENT for published tools.
 *
 * Idempotency: re-running this script is a no-op (all Skipped).
 *
 * Usage:
 *   bun run apps/web/prisma/seed-baseline-listings.ts
 *
 * @see docs/sprints/SESSION_0173.md TASK_01
 * @see apps/web/prisma/seed-baseline-launch.ts (pattern reference)
 */

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

// Brian's prod admin user (confirmed in SESSION_0172).
const OWNER_ID = "KBYccZGiVxmOhV2l1LpB2XjSgES3MI8T"

const LISTING_CONTENT = `This listing gives visitors a quick way to understand what the resource offers, who it serves, and why it belongs in the directory. Use it as starter content for local development, then replace it with verified copy before publication.

For martial arts directory workflows, each listing should make the relationship clear: school, league, event, training resource, equipment supplier, software platform, or certification body. The most useful entries connect a visitor to a real next step without overstating affiliations or credentials.

Automated content generation can enrich this text later with screenshots, favicons, and structured descriptions. Human review remains required before launch for brand accuracy, lineage claims, sanctioning claims, and payment-related listing benefits.`

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { name: "Frontend", slug: "frontend", label: "Frontend Development", description: "Tools for building the user interface of a website or application." },
  { name: "Backend", slug: "backend", label: "Backend Development", description: "Tools for building the server-side of a website or application." },
  { name: "DevOps", slug: "devops", label: "DevOps & Deployment", description: "Tools for deploying and managing applications." },
  { name: "Design Tools", slug: "design-tools", label: "Design & UI/UX", description: "Tools for designing and creating user interfaces." },
  { name: "Productivity", slug: "productivity", label: "Productivity Tools", description: "Tools for increasing productivity and efficiency." },
  { name: "Testing", slug: "testing", label: "Testing & QA", description: "Tools for testing and quality assurance." },
  { name: "Learning", slug: "learning", label: "Learning Resources", description: "Tools for learning and improving skills." },
  { name: "AI Tools", slug: "ai-tools", label: "AI & Machine Learning", description: "Tools for using AI and machine learning." },
  { name: "Training Programs", slug: "training-programs", label: "Training Programs", description: "Schools, curriculums, and multi-discipline training programs." },
  { name: "Lineage & Certification", slug: "lineage-certification", label: "Lineage & Certification", description: "Rank lineage, instructor credentials, certificates, and education records." },
  { name: "Tournaments & Events", slug: "tournaments-events", label: "Tournaments & Events", description: "Tournament platforms, event organizers, leagues, and competitive circuits." },
  { name: "School Operations", slug: "school-operations", label: "School Operations", description: "Software and services for memberships, billing, attendance, and school growth." },
  { name: "Equipment & Gear", slug: "equipment-gear", label: "Equipment & Gear", description: "Training gear, uniforms, safety equipment, and weapons suppliers." },
  { name: "Media & Education", slug: "media-education", label: "Media & Education", description: "Educational sites, videos, articles, and reference libraries." },
] as const

const TAGS = [
  { name: "React", slug: "react" },
  { name: "Vue", slug: "vue" },
  { name: "Angular", slug: "angular" },
  { name: "Svelte", slug: "svelte" },
  { name: "Node.js", slug: "nodejs" },
  { name: "Python", slug: "python" },
  { name: "TypeScript", slug: "typescript" },
  { name: "JavaScript", slug: "javascript" },
  { name: "CSS", slug: "css" },
  { name: "HTML", slug: "html" },
  { name: "Rust", slug: "rust" },
  { name: "Go", slug: "go" },
  { name: "AWS", slug: "aws" },
  { name: "Docker", slug: "docker" },
  { name: "Kubernetes", slug: "kubernetes" },
  { name: "CI/CD", slug: "ci-cd" },
  { name: "Free", slug: "free" },
  { name: "Paid", slug: "paid" },
  { name: "Open Source", slug: "open-source" },
  { name: "AI", slug: "ai" },
  { name: "API", slug: "api" },
  { name: "Brazilian Jiu-Jitsu", slug: "bjj" },
  { name: "Eskrima", slug: "eskrima" },
  { name: "Muay Thai", slug: "muay-thai" },
  { name: "Boxing", slug: "boxing" },
  { name: "Self Defense", slug: "self-defense" },
  { name: "Tournaments", slug: "tournaments" },
  { name: "Curriculum", slug: "curriculum" },
  { name: "Lineage", slug: "lineage" },
  { name: "Certification", slug: "certification" },
  { name: "Memberships", slug: "memberships" },
  { name: "White Label", slug: "white-label" },
  { name: "Software", slug: "software" },
  { name: "Equipment", slug: "equipment" },
  { name: "Youth", slug: "youth" },
  { name: "Adult", slug: "adult" },
] as const

type ToolDef = {
  name: string
  slug: string
  websiteUrl: string
  tagline: string
  description: string
  isFeatured?: boolean
  status: "Published" | "Scheduled" | "Draft"
  publishedAt?: Date
  screenshotUrl?: string
  categories: string[]
  tags: string[]
  hasOwner: boolean // true = connect to OWNER_ID
}

const now = new Date()
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86400000)

const TOOLS: ToolDef[] = [
  {
    name: "VS Code",
    slug: "vscode",
    websiteUrl: "https://code.visualstudio.com",
    tagline: "Free source-code editor made by Microsoft",
    description: "Visual Studio Code is a lightweight but powerful source code editor with support for many programming languages through extensions.",
    status: "Published",
    publishedAt: now,
    screenshotUrl: "https://code.visualstudio.com/opengraphimg/opengraph-home.png",
    categories: ["frontend"],
    tags: ["free", "open-source"],
    hasOwner: true,
  },
  {
    name: "Next.js",
    slug: "nextjs",
    websiteUrl: "https://nextjs.org",
    tagline: "The full-stack React framework for the web",
    description: "Next.js gives you the best developer experience with all the features you need for production: hybrid static & server rendering, TypeScript support, smart bundling, route pre-fetching, and more.",
    isFeatured: true,
    status: "Published",
    publishedAt: now,
    screenshotUrl: "https://assets.vercel.com/image/upload/front/nextjs/twitter-card.png",
    categories: ["frontend"],
    tags: ["typescript", "javascript", "free", "open-source"],
    hasOwner: false,
  },
  {
    name: "Docker",
    slug: "docker",
    websiteUrl: "https://www.docker.com",
    tagline: "Accelerate how you build, share and run modern applications",
    description: "Docker is an open platform for developing, shipping, and running applications in containers.",
    isFeatured: true,
    status: "Published",
    publishedAt: now,
    screenshotUrl: "https://www.docker.com/app/uploads/2023/06/meta-image-homepage-1110x580.png",
    categories: ["devops"],
    tags: ["docker", "free", "open-source"],
    hasOwner: false,
  },
  {
    name: "Figma",
    slug: "figma",
    websiteUrl: "https://www.figma.com",
    tagline: "Design, prototype, and collaborate all in the browser",
    description: "Figma is a vector graphics editor and prototyping tool, primarily web-based with additional offline features through desktop applications.",
    isFeatured: true,
    status: "Published",
    publishedAt: now,
    screenshotUrl: "https://cdn.sanity.io/images/599r6htc/regionalized/1adfa5a99040c80af7b4b5e3e2cf845315ea2367-2400x1260.png?w=1200&q=70&fit=max&auto=format",
    categories: ["design-tools"],
    tags: ["free", "paid"],
    hasOwner: false,
  },
  {
    name: "Node.js",
    slug: "nodejs",
    websiteUrl: "https://nodejs.org",
    tagline: "JavaScript runtime built on Chrome's V8 JavaScript engine",
    description: "Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser.",
    status: "Published",
    publishedAt: now,
    screenshotUrl: "https://nodejs.org/en/next-data/og/announcement/Node.js%20%E2%80%94%20Run%20JavaScript%20Everywhere",
    categories: ["backend"],
    tags: ["nodejs", "javascript", "free", "open-source"],
    hasOwner: false,
  },
  {
    name: "Claude",
    slug: "claude",
    websiteUrl: "https://claude.ai",
    tagline: "Advanced AI assistant for coding and analysis",
    description: "Claude is an AI assistant by Anthropic that excels at coding, analysis, and creative tasks. It can help with code review, debugging, and explaining complex concepts.",
    status: "Published",
    publishedAt: now,
    screenshotUrl: "https://claude.ai/images/claude_ogimage.png",
    categories: ["productivity", "ai-tools"],
    tags: ["paid", "ai"],
    hasOwner: false,
  },
  {
    name: "Jest",
    slug: "jest",
    websiteUrl: "https://jestjs.io",
    tagline: "Delightful JavaScript Testing",
    description: "Jest is a JavaScript testing framework designed to ensure correctness of any JavaScript codebase.",
    status: "Published",
    publishedAt: now,
    screenshotUrl: "https://jestjs.io/img/opengraph.png",
    categories: ["testing"],
    tags: ["typescript", "javascript", "free", "open-source"],
    hasOwner: false,
  },
  {
    name: "AWS",
    slug: "aws",
    websiteUrl: "https://aws.amazon.com",
    tagline: "The most comprehensive and broadly adopted cloud platform",
    description: "Amazon Web Services offers reliable, scalable, and inexpensive cloud computing services.",
    status: "Published",
    publishedAt: now,
    screenshotUrl: "https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png",
    categories: ["devops"],
    tags: ["aws", "paid"],
    hasOwner: false,
  },
  {
    name: "MDN Web Docs",
    slug: "mdn-web-docs",
    websiteUrl: "https://developer.mozilla.org",
    tagline: "Resources for developers, by developers",
    description: "MDN Web Docs is an open-source, collaborative project documenting Web platform technologies.",
    status: "Published",
    publishedAt: now,
    screenshotUrl: "https://developer.mozilla.org/mdn-social-share.d893525a4fb5fb1f67a2.png",
    categories: ["learning"],
    tags: ["javascript", "css", "html", "free", "open-source"],
    hasOwner: false,
  },
  {
    name: "ChatGPT",
    slug: "chatgpt",
    websiteUrl: "https://chatgpt.com",
    tagline: "A conversational AI system that listens, learns, and challenges",
    description: "ChatGPT is a large language model developed by OpenAI that can generate human-like text based on the context and prompt it's given.",
    isFeatured: true,
    status: "Published",
    publishedAt: now,
    screenshotUrl: "https://cdn.oaistatic.com/assets/chatgpt-share-og-u7j5uyao.webp",
    categories: ["ai-tools", "productivity"],
    tags: ["free", "paid", "ai"],
    hasOwner: false,
  },
  {
    name: "Tailwind CSS",
    slug: "tailwind-css",
    websiteUrl: "https://tailwindcss.com",
    tagline: "A utility-first CSS framework for rapid UI development",
    description: "Tailwind CSS is a utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.",
    status: "Published",
    publishedAt: now,
    screenshotUrl: "https://tailwindcss.com/opengraph-image.jpg",
    categories: ["frontend"],
    tags: ["css", "free", "open-source"],
    hasOwner: false,
  },
  {
    name: "React",
    slug: "react",
    websiteUrl: "https://react.dev",
    tagline: "The library for web and native user interfaces",
    description: "React is a JavaScript library for building user interfaces, particularly single-page applications.",
    status: "Published",
    publishedAt: now,
    screenshotUrl: "https://react.dev/images/og-home.png",
    categories: ["frontend"],
    tags: ["react", "javascript", "free", "open-source"],
    hasOwner: false,
  },
  {
    name: "Postman",
    slug: "postman",
    websiteUrl: "https://www.postman.com",
    tagline: "API platform for building and using APIs",
    description: "Postman is an API platform for developers to design, build, test and iterate their APIs.",
    status: "Published",
    publishedAt: now,
    screenshotUrl: "https://voyager.postman.com/social-preview/postman-api-platform-social-preview-2.jpeg",
    categories: ["testing", "backend"],
    tags: ["free", "paid", "api"],
    hasOwner: false,
  },
  {
    name: "GitHub",
    slug: "github",
    websiteUrl: "https://github.com",
    tagline: "Build and ship software on a single, collaborative platform",
    description: "GitHub is a code hosting platform for version control and collaboration, letting you and others work together on projects.",
    isFeatured: true,
    status: "Published",
    publishedAt: now,
    screenshotUrl: "https://github.githubassets.com/images/modules/site/social-cards/github-social.png",
    categories: ["devops"],
    tags: ["free", "paid", "open-source", "ci-cd"],
    hasOwner: false,
  },
  {
    name: "SvelteKit",
    slug: "sveltekit",
    websiteUrl: "https://svelte.dev",
    tagline: "The fastest way to build Svelte apps",
    description: "SvelteKit is a framework for building web applications of all sizes, with a beautiful development experience and flexible filesystem-based routing.",
    status: "Scheduled",
    publishedAt: addDays(now, 7),
    screenshotUrl: "https://svelte.dev/images/twitter-thumbnail.jpg",
    categories: ["frontend"],
    tags: ["svelte", "javascript", "free", "open-source"],
    hasOwner: true,
  },
  {
    name: "Rust",
    slug: "rust",
    websiteUrl: "https://www.rust-lang.org",
    tagline: "A language empowering everyone to build reliable and efficient software",
    description: "Rust is a multi-paradigm, general-purpose programming language designed for performance and safety, especially safe concurrency.",
    status: "Draft",
    screenshotUrl: "https://www.rust-lang.org/static/images/rust-social-wide.jpg",
    categories: ["backend"],
    tags: ["rust", "free", "open-source"],
    hasOwner: true,
  },
  {
    name: "Kubernetes",
    slug: "kubernetes",
    websiteUrl: "https://kubernetes.io",
    tagline: "Production-Grade Container Orchestration",
    description: "Kubernetes is an open-source container orchestration platform for automating deployment, scaling, and management of containerized applications.",
    status: "Draft",
    screenshotUrl: "https://kubernetes.io/images/kubernetes-open-graph.png",
    categories: ["devops"],
    tags: ["kubernetes", "free", "open-source"],
    hasOwner: true,
  },
  {
    name: "Baseline Martial Arts",
    slug: "baseline-martial-arts",
    websiteUrl: "https://baselinemartialarts.com",
    tagline: "Multi-discipline martial arts training programs",
    description: "Baseline Martial Arts is the first public training brand for the Ronin Dojo platform, focused on practical classes, curriculum, memberships, and student progress.",
    isFeatured: true,
    status: "Published",
    publishedAt: now,
    categories: ["training-programs"],
    tags: ["bjj", "muay-thai", "boxing", "self-defense", "adult", "paid"],
    hasOwner: true,
  },
  {
    name: "Black Belt Legacy",
    slug: "black-belt-legacy",
    websiteUrl: "https://blackbeltlegacy.com",
    tagline: "Brazilian Jiu-Jitsu black belt lineage records",
    description: "Black Belt Legacy preserves lineage-centered Brazilian Jiu-Jitsu records and is a future migration target for profiles, credentials, and community trust signals.",
    isFeatured: true,
    status: "Published",
    publishedAt: now,
    categories: ["lineage-certification"],
    tags: ["bjj", "lineage", "certification", "paid"],
    hasOwner: true,
  },
  {
    name: "WEKAF USA",
    slug: "wekaf-usa",
    websiteUrl: "https://wekafusa.com",
    tagline: "Eskrima tournament and league operations",
    description: "WEKAF USA represents the tournament-operations lane for stick fighting, with event discovery, registration, brackets, officials, and results as launch-critical workflows.",
    isFeatured: true,
    status: "Published",
    publishedAt: now,
    categories: ["tournaments-events"],
    tags: ["eskrima", "tournaments", "certification"],
    hasOwner: true,
  },
  {
    name: "Ronin Dojo Design",
    slug: "ronin-dojo-design",
    websiteUrl: "https://ronindojodesign.com",
    tagline: "White-label martial arts software and launch support",
    description: "Ronin Dojo Design is the umbrella brand for assisted white-label onboarding, brand launches, school operations setup, and implementation support.",
    status: "Published",
    publishedAt: now,
    categories: ["school-operations"],
    tags: ["software", "white-label", "memberships", "paid"],
    hasOwner: true,
  },
  {
    name: "USA Stick Fighting",
    slug: "usa-stick-fighting",
    websiteUrl: "https://usastickfighting.com",
    tagline: "Stick fighting event visibility and athlete pathway",
    description: "USA Stick Fighting is a companion domain for public-facing event visibility, athlete discovery, and tournament funnel testing in the WEKAF lane.",
    status: "Scheduled",
    publishedAt: addDays(now, 10),
    categories: ["tournaments-events"],
    tags: ["eskrima", "tournaments", "equipment"],
    hasOwner: true,
  },
  {
    name: "Black Belt Wiki",
    slug: "black-belt-wiki",
    websiteUrl: "https://blackbeltwiki.com",
    tagline: "Martial arts reference library for students",
    description: "Black Belt Wiki is a public martial arts reference library covering styles, techniques, training ideas, and student-facing education resources.",
    status: "Published",
    publishedAt: now,
    categories: ["media-education"],
    tags: ["free", "curriculum", "self-defense"],
    hasOwner: false,
  },
  {
    name: "Smoothcomp",
    slug: "smoothcomp",
    websiteUrl: "https://smoothcomp.com",
    tagline: "Competition registration and tournament software",
    description: "Smoothcomp is a competition operations platform that provides useful reference behavior for registration, brackets, check-in, and public tournament results.",
    status: "Published",
    publishedAt: now,
    categories: ["tournaments-events"],
    tags: ["tournaments", "software", "paid"],
    hasOwner: false,
  },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n🌱 seed-baseline-listings.ts — Categories, Tags, Tools\n")

  // -------------------------------------------------------------------------
  // Categories — 14 rows, upsert on slug
  // -------------------------------------------------------------------------
  let catsCreated = 0
  let catsSkipped = 0

  for (const cat of CATEGORIES) {
    const existing = await db.category.findUnique({ where: { slug: cat.slug } })
    if (existing) {
      catsSkipped++
      continue
    }
    await db.category.create({ data: cat })
    catsCreated++
  }

  console.log(`   Categories: Created ${catsCreated}, Skipped ${catsSkipped}, Total ${CATEGORIES.length}`)

  // -------------------------------------------------------------------------
  // Tags — 36 rows, upsert on slug
  // -------------------------------------------------------------------------
  let tagsCreated = 0
  let tagsSkipped = 0

  for (const tag of TAGS) {
    const existing = await db.tag.findUnique({ where: { slug: tag.slug } })
    if (existing) {
      tagsSkipped++
      continue
    }
    await db.tag.create({ data: tag })
    tagsCreated++
  }

  console.log(`   Tags: Created ${tagsCreated}, Skipped ${tagsSkipped}, Total ${TAGS.length}`)

  // -------------------------------------------------------------------------
  // Tools — ~24 rows, findFirst on slug + create if missing
  // -------------------------------------------------------------------------
  let toolsCreated = 0
  let toolsSkipped = 0

  for (const toolDef of TOOLS) {
    const existing = await db.tool.findUnique({ where: { slug: toolDef.slug } })
    if (existing) {
      toolsSkipped++
      continue
    }

    const { categories, tags, hasOwner, status, ...rest } = toolDef

    await db.tool.create({
      data: {
        ...rest,
        status: status as "Published" | "Scheduled" | "Draft",
        content: LISTING_CONTENT,
        faviconUrl: `https://www.google.com/s2/favicons?sz=128&domain_url=${rest.websiteUrl}`,
        ...(hasOwner ? { ownerId: OWNER_ID } : {}),
        categories: { connect: categories.map(slug => ({ slug })) },
        tags: { connect: tags.map(slug => ({ slug })) },
      },
    })
    toolsCreated++
  }

  console.log(`   Tools: Created ${toolsCreated}, Skipped ${toolsSkipped}, Total ${TOOLS.length}`)

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("\n🎉 seed-baseline-listings.ts complete.\n")
}

main()
  .catch((error) => {
    console.error("❌ Error in seed-baseline-listings:", error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
