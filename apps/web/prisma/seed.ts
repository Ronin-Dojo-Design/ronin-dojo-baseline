import { PrismaPg } from "@prisma/adapter-pg"
import { addDays } from "date-fns"
import { PrismaClient, ToolStatus } from "~/.generated/prisma/client"

// Seed uses its own Prisma client to bypass env.ts validation
// (which requires all production env vars to be set)
const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const ADMIN_EMAIL = "admin@dirstarter.com"
const USER_EMAIL = "user@dirstarter.com"

const DUMMY_CONTENT = `This listing gives visitors a quick way to understand what the resource offers, who it serves, and why it belongs in the directory. Use it as starter content for local development, then replace it with verified copy before publication.

For martial arts directory workflows, each listing should make the relationship clear: school, league, event, training resource, equipment supplier, software platform, or certification body. The most useful entries connect a visitor to a real next step without overstating affiliations or credentials.

Automated content generation can enrich this text later with screenshots, favicons, and structured descriptions. Human review remains required before launch for brand accuracy, lineage claims, sanctioning claims, and payment-related listing benefits.`

async function main() {
  const now = new Date()

  console.log("Starting seeding...")

  await db.user.createMany({
    data: [
      {
        name: "Admin User",
        email: ADMIN_EMAIL,
        emailVerified: true,
        role: "admin",
      },
      {
        name: "User",
        email: USER_EMAIL,
        emailVerified: true,
        role: "user",
      },
    ],
  })

  console.log("Created users")

  // Create categories
  await db.category.createMany({
    data: [
      {
        name: "Frontend",
        slug: "frontend",
        label: "Frontend Development",
        description: "Tools for building the user interface of a website or application.",
      },
      {
        name: "Backend",
        slug: "backend",
        label: "Backend Development",
        description: "Tools for building the server-side of a website or application.",
      },
      {
        name: "DevOps",
        slug: "devops",
        label: "DevOps & Deployment",
        description: "Tools for deploying and managing applications.",
      },
      {
        name: "Design Tools",
        slug: "design-tools",
        label: "Design & UI/UX",
        description: "Tools for designing and creating user interfaces.",
      },
      {
        name: "Productivity",
        slug: "productivity",
        label: "Productivity Tools",
        description: "Tools for increasing productivity and efficiency.",
      },
      {
        name: "Testing",
        slug: "testing",
        label: "Testing & QA",
        description: "Tools for testing and quality assurance.",
      },
      {
        name: "Learning",
        slug: "learning",
        label: "Learning Resources",
        description: "Tools for learning and improving skills.",
      },
      {
        name: "AI Tools",
        slug: "ai-tools",
        label: "AI & Machine Learning",
        description: "Tools for using AI and machine learning.",
      },
      {
        name: "Training Programs",
        slug: "training-programs",
        label: "Training Programs",
        description: "Schools, curriculums, and multi-discipline training programs.",
      },
      {
        name: "Lineage & Certification",
        slug: "lineage-certification",
        label: "Lineage & Certification",
        description: "Rank lineage, instructor credentials, certificates, and education records.",
      },
      {
        name: "Tournaments & Events",
        slug: "tournaments-events",
        label: "Tournaments & Events",
        description: "Tournament platforms, event organizers, leagues, and competitive circuits.",
      },
      {
        name: "School Operations",
        slug: "school-operations",
        label: "School Operations",
        description:
          "Software and services for memberships, billing, attendance, and school growth.",
      },
      {
        name: "Equipment & Gear",
        slug: "equipment-gear",
        label: "Equipment & Gear",
        description: "Training gear, uniforms, safety equipment, and weapons suppliers.",
      },
      {
        name: "Media & Education",
        slug: "media-education",
        label: "Media & Education",
        description: "Educational sites, videos, articles, and reference libraries.",
      },
    ],
  })

  console.log("Created categories")

  // Create tags
  await db.tag.createMany({
    data: [
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
    ],
  })

  console.log("Created tags")

  // Create tools
  const toolsData = [
    {
      name: "VS Code",
      slug: "vscode",
      websiteUrl: "https://code.visualstudio.com",
      tagline: "Free source-code editor made by Microsoft",
      description:
        "Visual Studio Code is a lightweight but powerful source code editor with support for many programming languages through extensions.",
      status: ToolStatus.Published,
      publishedAt: now,
      screenshotUrl: "https://code.visualstudio.com/opengraphimg/opengraph-home.png",
      categories: ["frontend"],
      tags: ["free", "open-source"],
      owner: { connect: { email: "admin@dirstarter.com" } },
    },
    {
      name: "Next.js",
      slug: "nextjs",
      websiteUrl: "https://nextjs.org",
      tagline: "The full-stack React framework for the web",
      description:
        "Next.js gives you the best developer experience with all the features you need for production: hybrid static & server rendering, TypeScript support, smart bundling, route pre-fetching, and more.",
      isFeatured: true,
      status: ToolStatus.Published,
      publishedAt: now,
      screenshotUrl: "https://assets.vercel.com/image/upload/front/nextjs/twitter-card.png",
      categories: ["frontend"],
      tags: ["typescript", "javascript", "free", "open-source"],
    },
    {
      name: "Docker",
      slug: "docker",
      websiteUrl: "https://www.docker.com",
      tagline: "Accelerate how you build, share and run modern applications",
      description:
        "Docker is an open platform for developing, shipping, and running applications in containers.",
      isFeatured: true,
      status: ToolStatus.Published,
      publishedAt: now,
      screenshotUrl: "https://www.docker.com/app/uploads/2023/06/meta-image-homepage-1110x580.png",
      categories: ["devops"],
      tags: ["docker", "free", "open-source"],
    },
    {
      name: "Figma",
      slug: "figma",
      websiteUrl: "https://www.figma.com",
      tagline: "Design, prototype, and collaborate all in the browser",
      description:
        "Figma is a vector graphics editor and prototyping tool, primarily web-based with additional offline features through desktop applications.",
      isFeatured: true,
      status: ToolStatus.Published,
      publishedAt: now,
      screenshotUrl:
        "https://cdn.sanity.io/images/599r6htc/regionalized/1adfa5a99040c80af7b4b5e3e2cf845315ea2367-2400x1260.png?w=1200&q=70&fit=max&auto=format",
      categories: ["design-tools"],
      tags: ["free", "paid"],
    },
    {
      name: "Node.js",
      slug: "nodejs",
      websiteUrl: "https://nodejs.org",
      tagline: "JavaScript runtime built on Chrome's V8 JavaScript engine",
      description:
        "Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser.",
      status: ToolStatus.Published,
      publishedAt: now,
      screenshotUrl:
        "https://nodejs.org/en/next-data/og/announcement/Node.js%20%E2%80%94%20Run%20JavaScript%20Everywhere",
      categories: ["backend"],
      tags: ["nodejs", "javascript", "free", "open-source"],
    },
    {
      name: "Claude",
      slug: "claude",
      websiteUrl: "https://claude.ai",
      tagline: "Advanced AI assistant for coding and analysis",
      description:
        "Claude is an AI assistant by Anthropic that excels at coding, analysis, and creative tasks. It can help with code review, debugging, and explaining complex concepts.",
      status: ToolStatus.Published,
      publishedAt: now,
      screenshotUrl: "https://claude.ai/images/claude_ogimage.png",
      categories: ["productivity", "ai-tools"],
      tags: ["paid", "ai"],
    },
    {
      name: "Jest",
      slug: "jest",
      websiteUrl: "https://jestjs.io",
      tagline: "Delightful JavaScript Testing",
      description:
        "Jest is a JavaScript testing framework designed to ensure correctness of any JavaScript codebase.",
      status: ToolStatus.Published,
      publishedAt: now,
      screenshotUrl: "https://jestjs.io/img/opengraph.png",
      categories: ["testing"],
      tags: ["typescript", "javascript", "free", "open-source"],
    },
    {
      name: "AWS",
      slug: "aws",
      websiteUrl: "https://aws.amazon.com",
      tagline: "The most comprehensive and broadly adopted cloud platform",
      description:
        "Amazon Web Services offers reliable, scalable, and inexpensive cloud computing services.",
      status: ToolStatus.Published,
      publishedAt: now,
      screenshotUrl: "https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png",
      categories: ["devops"],
      tags: ["aws", "paid"],
    },
    {
      name: "MDN Web Docs",
      slug: "mdn-web-docs",
      websiteUrl: "https://developer.mozilla.org",
      tagline: "Resources for developers, by developers",
      description:
        "MDN Web Docs is an open-source, collaborative project documenting Web platform technologies.",
      status: ToolStatus.Published,
      publishedAt: now,
      screenshotUrl: "https://developer.mozilla.org/mdn-social-share.d893525a4fb5fb1f67a2.png",
      categories: ["learning"],
      tags: ["javascript", "css", "html", "free", "open-source"],
    },
    {
      name: "ChatGPT",
      slug: "chatgpt",
      websiteUrl: "https://chatgpt.com",
      tagline: "A conversational AI system that listens, learns, and challenges",
      description:
        "ChatGPT is a large language model developed by OpenAI that can generate human-like text based on the context and prompt it's given.",
      isFeatured: true,
      status: ToolStatus.Published,
      publishedAt: now,
      screenshotUrl: "https://cdn.oaistatic.com/assets/chatgpt-share-og-u7j5uyao.webp",
      categories: ["ai-tools", "productivity"],
      tags: ["free", "paid", "ai"],
    },
    {
      name: "Tailwind CSS",
      slug: "tailwind-css",
      websiteUrl: "https://tailwindcss.com",
      tagline: "A utility-first CSS framework for rapid UI development",
      description:
        "Tailwind CSS is a utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.",
      status: ToolStatus.Published,
      publishedAt: now,
      screenshotUrl: "https://tailwindcss.com/opengraph-image.jpg",
      categories: ["frontend"],
      tags: ["css", "free", "open-source"],
    },
    {
      name: "React",
      slug: "react",
      websiteUrl: "https://react.dev",
      tagline: "The library for web and native user interfaces",
      description:
        "React is a JavaScript library for building user interfaces, particularly single-page applications.",
      status: ToolStatus.Published,
      publishedAt: now,
      screenshotUrl: "https://react.dev/images/og-home.png",
      categories: ["frontend"],
      tags: ["react", "javascript", "free", "open-source"],
    },
    {
      name: "Postman",
      slug: "postman",
      websiteUrl: "https://www.postman.com",
      tagline: "API platform for building and using APIs",
      description:
        "Postman is an API platform for developers to design, build, test and iterate their APIs.",
      status: ToolStatus.Published,
      publishedAt: now,
      screenshotUrl:
        "https://voyager.postman.com/social-preview/postman-api-platform-social-preview-2.jpeg",
      categories: ["testing", "backend"],
      tags: ["free", "paid", "api"],
    },
    {
      name: "GitHub",
      slug: "github",
      websiteUrl: "https://github.com",
      tagline: "Build and ship software on a single, collaborative platform",
      description:
        "GitHub is a code hosting platform for version control and collaboration, letting you and others work together on projects.",
      isFeatured: true,
      status: ToolStatus.Published,
      publishedAt: now,
      screenshotUrl:
        "https://github.githubassets.com/images/modules/site/social-cards/github-social.png",
      categories: ["devops"],
      tags: ["free", "paid", "open-source", "ci-cd"],
    },
    {
      name: "SvelteKit",
      slug: "sveltekit",
      websiteUrl: "https://svelte.dev",
      tagline: "The fastest way to build Svelte apps",
      description:
        "SvelteKit is a framework for building web applications of all sizes, with a beautiful development experience and flexible filesystem-based routing.",
      status: ToolStatus.Scheduled,
      publishedAt: addDays(now, 7),
      screenshotUrl: "https://svelte.dev/images/twitter-thumbnail.jpg",
      categories: ["frontend"],
      tags: ["svelte", "javascript", "free", "open-source"],
      owner: { connect: { email: "admin@dirstarter.com" } },
    },
    {
      name: "Rust",
      slug: "rust",
      websiteUrl: "https://www.rust-lang.org",
      tagline: "A language empowering everyone to build reliable and efficient software",
      description:
        "Rust is a multi-paradigm, general-purpose programming language designed for performance and safety, especially safe concurrency.",
      status: ToolStatus.Draft,
      screenshotUrl: "https://www.rust-lang.org/static/images/rust-social-wide.jpg",
      categories: ["backend"],
      tags: ["rust", "free", "open-source"],
      owner: { connect: { email: "admin@dirstarter.com" } },
    },
    {
      name: "Kubernetes",
      slug: "kubernetes",
      websiteUrl: "https://kubernetes.io",
      tagline: "Production-Grade Container Orchestration",
      description:
        "Kubernetes is an open-source container orchestration platform for automating deployment, scaling, and management of containerized applications.",
      status: ToolStatus.Draft,
      screenshotUrl: "https://kubernetes.io/images/kubernetes-open-graph.png",
      categories: ["devops"],
      tags: ["kubernetes", "free", "open-source"],
      owner: { connect: { email: "admin@dirstarter.com" } },
    },
    {
      name: "Baseline Martial Arts",
      slug: "baseline-martial-arts",
      websiteUrl: "https://baselinemartialarts.com",
      tagline: "Multi-discipline martial arts training programs",
      description:
        "Baseline Martial Arts is the first public training brand for the Ronin Dojo platform, focused on practical classes, curriculum, memberships, and student progress.",
      isFeatured: true,
      status: ToolStatus.Published,
      publishedAt: now,
      categories: ["training-programs"],
      tags: ["bjj", "muay-thai", "boxing", "self-defense", "adult", "paid"],
      owner: { connect: { email: "admin@dirstarter.com" } },
    },
    {
      name: "Black Belt Legacy",
      slug: "black-belt-legacy",
      websiteUrl: "https://blackbeltlegacy.com",
      tagline: "Brazilian Jiu-Jitsu black belt lineage records",
      description:
        "Black Belt Legacy preserves lineage-centered Brazilian Jiu-Jitsu records and is a future migration target for profiles, credentials, and community trust signals.",
      isFeatured: true,
      status: ToolStatus.Published,
      publishedAt: now,
      categories: ["lineage-certification"],
      tags: ["bjj", "lineage", "certification", "paid"],
      owner: { connect: { email: "admin@dirstarter.com" } },
    },
    {
      name: "WEKAF USA",
      slug: "wekaf-usa",
      websiteUrl: "https://wekafusa.com",
      tagline: "Eskrima tournament and league operations",
      description:
        "WEKAF USA represents the tournament-operations lane for stick fighting, with event discovery, registration, brackets, officials, and results as launch-critical workflows.",
      isFeatured: true,
      status: ToolStatus.Published,
      publishedAt: now,
      categories: ["tournaments-events"],
      tags: ["eskrima", "tournaments", "certification"],
      owner: { connect: { email: "admin@dirstarter.com" } },
    },
    {
      name: "Ronin Dojo Design",
      slug: "ronin-dojo-design",
      websiteUrl: "https://ronindojodesign.com",
      tagline: "White-label martial arts software and launch support",
      description:
        "Ronin Dojo Design is the umbrella brand for assisted white-label onboarding, brand launches, school operations setup, and implementation support.",
      status: ToolStatus.Published,
      publishedAt: now,
      categories: ["school-operations"],
      tags: ["software", "white-label", "memberships", "paid"],
      owner: { connect: { email: "admin@dirstarter.com" } },
    },
    {
      name: "USA Stick Fighting",
      slug: "usa-stick-fighting",
      websiteUrl: "https://usastickfighting.com",
      tagline: "Stick fighting event visibility and athlete pathway",
      description:
        "USA Stick Fighting is a companion domain for public-facing event visibility, athlete discovery, and tournament funnel testing in the WEKAF lane.",
      status: ToolStatus.Scheduled,
      publishedAt: addDays(now, 10),
      categories: ["tournaments-events"],
      tags: ["eskrima", "tournaments", "equipment"],
      owner: { connect: { email: "admin@dirstarter.com" } },
    },
    {
      name: "Black Belt Wiki",
      slug: "black-belt-wiki",
      websiteUrl: "https://blackbeltwiki.com",
      tagline: "Martial arts reference library for students",
      description:
        "Black Belt Wiki is a public martial arts reference library covering styles, techniques, training ideas, and student-facing education resources.",
      status: ToolStatus.Published,
      publishedAt: now,
      categories: ["media-education"],
      tags: ["free", "curriculum", "self-defense"],
    },
    {
      name: "Smoothcomp",
      slug: "smoothcomp",
      websiteUrl: "https://smoothcomp.com",
      tagline: "Competition registration and tournament software",
      description:
        "Smoothcomp is a competition operations platform that provides useful reference behavior for registration, brackets, check-in, and public tournament results.",
      status: ToolStatus.Published,
      publishedAt: now,
      categories: ["tournaments-events"],
      tags: ["tournaments", "software", "paid"],
    },
  ]

  // Create tools with their relationships
  for (const { categories, tags, ...toolData } of toolsData) {
    await db.tool.create({
      data: {
        ...toolData,
        content: DUMMY_CONTENT,
        faviconUrl: `https://www.google.com/s2/favicons?sz=128&domain_url=${toolData.websiteUrl}`,
        categories: { connect: categories.map(slug => ({ slug })) },
        tags: { connect: tags.map(slug => ({ slug })) },
      },
    })
  }

  console.log("Created tools")

  // =========================================================================
  // RONIN DOJO PLATFORM SEED DATA
  // =========================================================================
  // System defaults for the multi-brand martial arts SaaS platform.
  // isSystem=true, brand=null rows are visible to all brands.
  // isSystem=false, brand=X rows are brand-specific templates.
  // =========================================================================

  // ---------------------------------------------------------------------------
  // Disciplines (12 system defaults)
  // ---------------------------------------------------------------------------
  const disciplines = await Promise.all([
    db.discipline.create({
      data: { name: "Brazilian Jiu-Jitsu", slug: "bjj", code: "bjj", isSystem: true },
    }),
    db.discipline.create({
      data: { name: "Doce Pares Eskrima", slug: "eskrima", code: "eskrima", isSystem: true },
    }),
    db.discipline.create({
      data: { name: "Muay Thai", slug: "muay-thai", code: "muay-thai", isSystem: true },
    }),
    db.discipline.create({
      data: { name: "Boxing", slug: "boxing", code: "boxing", isSystem: true },
    }),
    db.discipline.create({
      data: { name: "Self Defense", slug: "self-defense", code: "self-defense", isSystem: true },
    }),
    db.discipline.create({ data: { name: "Judo", slug: "judo", code: "judo", isSystem: true } }),
    db.discipline.create({
      data: { name: "Kajukenbo", slug: "kajukenbo", code: "kajukenbo", isSystem: true },
    }),
    db.discipline.create({
      data: { name: "Karate", slug: "karate", code: "karate", isSystem: true },
    }),
    db.discipline.create({ data: { name: "Taekwondo", slug: "tkd", code: "tkd", isSystem: true } }),
    db.discipline.create({
      data: { name: "Wrestling", slug: "wrestling", code: "wrestling", isSystem: true },
    }),
    db.discipline.create({
      data: { name: "Krav Maga", slug: "krav-maga", code: "krav-maga", isSystem: true },
    }),
    db.discipline.create({
      data: { name: "Wing Chun", slug: "wing-chun", code: "wing-chun", isSystem: true },
    }),
  ])

  const [
    bjj,
    eskrima,
    muayThai,
    boxing,
    selfDefense,
    judo,
    kajukenbo,
    karate,
    tkd,
    wrestling,
    kravMaga,
    wingChun,
  ] = disciplines
  console.log("Created 12 disciplines")

  // ---------------------------------------------------------------------------
  // Rank Systems + Ranks
  // ---------------------------------------------------------------------------

  // Helper to create a rank system with its ranks
  async function seedRankSystem(
    disciplineId: string,
    name: string,
    kind: "BELT" | "PRAJIOUD" | "GRADE" | "KYU_DAN" | "OTHER",
    isSystem: boolean,
    brand: "BASELINE_MARTIAL_ARTS" | "BBL" | "RONIN_DOJO_DESIGN" | "WEKAF" | null,
    ranks: Array<{ name: string; shortName?: string; colorHex?: string }>,
  ) {
    const rs = await db.rankSystem.create({
      data: { name, kind, isSystem, brand, disciplineId },
    })
    await db.rank.createMany({
      data: ranks.map((r, i) => ({
        sortOrder: i + 1,
        name: r.name,
        shortName: r.shortName ?? null,
        colorHex: r.colorHex ?? null,
        isSystem,
        brand,
        rankSystemId: rs.id,
      })),
    })
    return rs
  }

  // --- 1. BJJ — IBJJF Belt System (30 ranks) ---
  const bjjRanks: Array<{ name: string; shortName: string; colorHex: string }> = []
  const bjjBelts = [
    { belt: "White Belt", prefix: "W", hex: "#FFFFFF" },
    { belt: "Blue Belt", prefix: "BL", hex: "#0000FF" },
    { belt: "Purple Belt", prefix: "P", hex: "#800080" },
    { belt: "Brown Belt", prefix: "BR", hex: "#8B4513" },
  ]
  for (const { belt, prefix, hex } of bjjBelts) {
    bjjRanks.push({ name: belt, shortName: `${prefix}0`, colorHex: hex })
    for (let s = 1; s <= 4; s++) {
      bjjRanks.push({
        name: `${belt} - ${s} Stripe${s > 1 ? "s" : ""}`,
        shortName: `${prefix}${s}`,
        colorHex: hex,
      })
    }
  }
  bjjRanks.push(
    { name: "Black Belt - 1st Degree", shortName: "BK1", colorHex: "#000000" },
    { name: "Black Belt - 2nd Degree", shortName: "BK2", colorHex: "#000000" },
    { name: "Black Belt - 3rd Degree", shortName: "BK3", colorHex: "#000000" },
    { name: "Black Belt - 4th Degree", shortName: "BK4", colorHex: "#000000" },
    { name: "Black Belt - 5th Degree", shortName: "BK5", colorHex: "#000000" },
    { name: "Black Belt - 6th Degree", shortName: "BK6", colorHex: "#000000" },
    { name: "Coral Belt (Red/Black) - 7th Degree", shortName: "CB7", colorHex: "#FF0000" },
    { name: "Coral Belt (Red/White) - 8th Degree", shortName: "CB8", colorHex: "#FF0000" },
    { name: "Red Belt - 9th Degree", shortName: "R9", colorHex: "#FF0000" },
    { name: "Red Belt - 10th Degree (Grand Master)", shortName: "R10", colorHex: "#FF0000" },
  )
  await seedRankSystem(bjj.id, "IBJJF Belt System", "BELT", true, null, bjjRanks)
  console.log("Created BJJ rank system (30 ranks)")

  // --- 2. Eskrima — PIMA Denver Doce Pares (GM Steve Wolk) (22 ranks) ---
  const pimaDenverRanks: Array<{ name: string; shortName: string }> = []
  for (let i = 1; i <= 11; i++) {
    pimaDenverRanks.push({ name: `Level ${i}`, shortName: `L${i}` })
  }
  pimaDenverRanks.push(
    { name: "Black Belt (Guro)", shortName: "BB" },
    { name: "1st Degree Black Belt", shortName: "1D" },
    { name: "2nd Degree Black Belt", shortName: "2D" },
    { name: "3rd Degree Black Belt", shortName: "3D" },
    { name: "4th Degree Black Belt", shortName: "4D" },
    { name: "5th Degree Black Belt (Master)", shortName: "5D" },
    { name: "6th Degree Black Belt", shortName: "6D" },
    { name: "7th Degree Black Belt", shortName: "7D" },
    { name: "8th Degree Black Belt", shortName: "8D" },
    { name: "9th Degree Black Belt (Grandmaster)", shortName: "9D" },
    { name: "10th Degree Red Belt (Supreme Grandmaster)", shortName: "10D" },
  )
  await seedRankSystem(
    eskrima.id,
    "PIMA Denver Doce Pares (GM Steve Wolk)",
    "BELT",
    true,
    null,
    pimaDenverRanks,
  )
  console.log("Created Eskrima PIMA Denver rank system (22 ranks)")

  // --- 3. Eskrima — PIMA Jersey Doce Pares (SGM Dong Cuesta) (22 ranks) ---
  const pimaJerseyRanks = [
    { name: "White Belt", shortName: "W", colorHex: "#FFFFFF" },
    { name: "Yellow Belt", shortName: "Y", colorHex: "#FFD700" },
    { name: "Orange Belt", shortName: "O", colorHex: "#FFA500" },
    { name: "Green Belt", shortName: "G", colorHex: "#008000" },
    { name: "Blue Belt", shortName: "BL", colorHex: "#0000FF" },
    { name: "Purple Belt", shortName: "P", colorHex: "#800080" },
    { name: "Brown Belt", shortName: "BR", colorHex: "#8B4513" },
    { name: "Brown Belt with Black Stripe", shortName: "BRS", colorHex: "#8B4513" },
    { name: "Brown Belt 1st Grade", shortName: "BR1", colorHex: "#8B4513" },
    { name: "Brown Belt 2nd Grade", shortName: "BR2", colorHex: "#8B4513" },
    { name: "Black Belt with Stripes", shortName: "BKS", colorHex: "#000000" },
    { name: "Black Belt (Guro)", shortName: "BB", colorHex: "#000000" },
    { name: "1st Degree Black Belt", shortName: "1D", colorHex: "#000000" },
    { name: "2nd Degree Black Belt", shortName: "2D", colorHex: "#000000" },
    { name: "3rd Degree Black Belt", shortName: "3D", colorHex: "#000000" },
    { name: "4th Degree Black Belt", shortName: "4D", colorHex: "#000000" },
    { name: "5th Degree Black Belt (Master)", shortName: "5D", colorHex: "#000000" },
    { name: "6th Degree Black Belt", shortName: "6D", colorHex: "#000000" },
    { name: "7th Degree Black Belt", shortName: "7D", colorHex: "#000000" },
    { name: "8th Degree Black Belt", shortName: "8D", colorHex: "#000000" },
    { name: "9th Degree Black Belt (Grandmaster)", shortName: "9D", colorHex: "#000000" },
    { name: "10th Degree Red Belt (Supreme Grandmaster)", shortName: "10D", colorHex: "#FF0000" },
  ]
  await seedRankSystem(
    eskrima.id,
    "PIMA Jersey Doce Pares (SGM Dong Cuesta)",
    "BELT",
    true,
    null,
    pimaJerseyRanks,
  )
  console.log("Created Eskrima PIMA Jersey rank system (22 ranks)")

  // --- 4. Muay Thai — Sak Va Roon Prajioud System (9 ranks) ---
  const muayThaiRanks = [
    { name: "White (Beginner)", shortName: "W", colorHex: "#FFFFFF" },
    { name: "Yellow", shortName: "Y", colorHex: "#FFD700" },
    { name: "Yellow-Black", shortName: "YB", colorHex: "#FFD700" },
    { name: "Blue (Intermediate)", shortName: "BL", colorHex: "#0000FF" },
    { name: "Blue-Black", shortName: "BLB", colorHex: "#0000FF" },
    { name: "Red (Advanced)", shortName: "R", colorHex: "#FF0000" },
    { name: "Black (Fighter)", shortName: "BK", colorHex: "#000000" },
    { name: "Red-Black (Instructor - Fighter)", shortName: "RB", colorHex: "#FF0000" },
    {
      name: "Red-Blue-Black (Fighter - Corner/Kru/Head Instructor)",
      shortName: "RBB",
      colorHex: "#FF0000",
    },
  ]
  await seedRankSystem(
    muayThai.id,
    "Sak Va Roon Thai Boxing Prajioud System",
    "PRAJIOUD",
    true,
    null,
    muayThaiRanks,
  )
  console.log("Created Muay Thai rank system (9 ranks)")

  // --- 5. Boxing — Skill Levels (Baseline-specific) (8 ranks) ---
  const boxingRanks = [
    { name: "Fundamentals", shortName: "F" },
    { name: "Novice", shortName: "N" },
    { name: "Beginner", shortName: "B" },
    { name: "Intermediate", shortName: "I" },
    { name: "Advanced", shortName: "A" },
    { name: "Sparring Ready", shortName: "SR" },
    { name: "Amateur", shortName: "AM" },
    { name: "Competition Ready", shortName: "CR" },
  ]
  await seedRankSystem(
    boxing.id,
    "Boxing Skill Levels",
    "GRADE",
    false,
    "BASELINE_MARTIAL_ARTS",
    boxingRanks,
  )
  console.log("Created Boxing rank system (8 ranks, Baseline-specific)")

  // --- 6. Self Defense — Levels (Baseline-specific) (8 ranks) ---
  const selfDefenseRanks = [
    { name: "Awareness", shortName: "AW" },
    { name: "Fundamentals", shortName: "F" },
    { name: "Basic Responses", shortName: "BR" },
    { name: "Intermediate", shortName: "I" },
    { name: "Advanced", shortName: "A" },
    { name: "Weapons Defense", shortName: "WD" },
    { name: "Ground Defense", shortName: "GD" },
    { name: "Multiple Attackers", shortName: "MA" },
  ]
  await seedRankSystem(
    selfDefense.id,
    "Self Defense Levels",
    "GRADE",
    false,
    "BASELINE_MARTIAL_ARTS",
    selfDefenseRanks,
  )
  console.log("Created Self Defense rank system (8 ranks, Baseline-specific)")

  // --- 7. Judo — Kodokan Kyu-Dan System (16 ranks) ---
  const judoRanks = [
    { name: "6th Kyu (Rokkyu) - White Belt", shortName: "6K", colorHex: "#FFFFFF" },
    { name: "5th Kyu (Gokyu) - Yellow Belt", shortName: "5K", colorHex: "#FFD700" },
    { name: "4th Kyu (Yonkyu) - Orange Belt", shortName: "4K", colorHex: "#FFA500" },
    { name: "3rd Kyu (Sankyu) - Green Belt", shortName: "3K", colorHex: "#008000" },
    { name: "2nd Kyu (Nikyu) - Blue Belt", shortName: "2K", colorHex: "#0000FF" },
    { name: "1st Kyu (Ikkyu) - Brown Belt", shortName: "1K", colorHex: "#8B4513" },
    { name: "1st Dan (Shodan) - Black Belt", shortName: "1D", colorHex: "#000000" },
    { name: "2nd Dan (Nidan) - Black Belt", shortName: "2D", colorHex: "#000000" },
    { name: "3rd Dan (Sandan) - Black Belt", shortName: "3D", colorHex: "#000000" },
    { name: "4th Dan (Yondan) - Black Belt", shortName: "4D", colorHex: "#000000" },
    { name: "5th Dan (Godan) - Black Belt", shortName: "5D", colorHex: "#000000" },
    { name: "6th Dan (Rokudan) - Red-White Belt", shortName: "6D", colorHex: "#FF0000" },
    { name: "7th Dan (Shichidan) - Red-White Belt", shortName: "7D", colorHex: "#FF0000" },
    { name: "8th Dan (Hachidan) - Red-White Belt", shortName: "8D", colorHex: "#FF0000" },
    { name: "9th Dan (Kudan) - Red Belt", shortName: "9D", colorHex: "#FF0000" },
    { name: "10th Dan (Judan) - Red Belt", shortName: "10D", colorHex: "#FF0000" },
  ]
  await seedRankSystem(judo.id, "Kodokan Judo Kyu-Dan System", "KYU_DAN", true, null, judoRanks)
  console.log("Created Judo rank system (16 ranks)")

  // --- 8. Kajukenbo — Belt System (19 ranks) ---
  const kajukenboRanks = [
    { name: "White Belt", shortName: "W", colorHex: "#FFFFFF" },
    { name: "Yellow Belt", shortName: "Y", colorHex: "#FFD700" },
    { name: "Orange Belt", shortName: "O", colorHex: "#FFA500" },
    { name: "Purple Belt", shortName: "P", colorHex: "#800080" },
    { name: "Blue Belt", shortName: "BL", colorHex: "#0000FF" },
    { name: "Green Belt", shortName: "G", colorHex: "#008000" },
    { name: "Brown Belt - 3rd Degree", shortName: "BR3", colorHex: "#8B4513" },
    { name: "Brown Belt - 2nd Degree", shortName: "BR2", colorHex: "#8B4513" },
    { name: "Brown Belt - 1st Degree", shortName: "BR1", colorHex: "#8B4513" },
    { name: "Black Belt - 1st Degree", shortName: "BK1", colorHex: "#000000" },
    { name: "Black Belt - 2nd Degree", shortName: "BK2", colorHex: "#000000" },
    { name: "Black Belt - 3rd Degree", shortName: "BK3", colorHex: "#000000" },
    { name: "Black Belt - 4th Degree", shortName: "BK4", colorHex: "#000000" },
    { name: "Black Belt - 5th Degree", shortName: "BK5", colorHex: "#000000" },
    { name: "Black Belt - 6th Degree", shortName: "BK6", colorHex: "#000000" },
    { name: "Black Belt - 7th Degree", shortName: "BK7", colorHex: "#000000" },
    { name: "Black Belt - 8th Degree", shortName: "BK8", colorHex: "#000000" },
    { name: "Black Belt - 9th Degree", shortName: "BK9", colorHex: "#000000" },
    { name: "Black Belt - 10th Degree", shortName: "BK10", colorHex: "#000000" },
  ]
  await seedRankSystem(kajukenbo.id, "Kajukenbo Belt System", "BELT", true, null, kajukenboRanks)
  console.log("Created Kajukenbo rank system (19 ranks)")

  // --- 9. Karate — USA Karate Federation Kyu-Dan System (20 ranks) ---
  const karateRanks = [
    { name: "10th Kyu (Jukyu) - White Belt", shortName: "10K", colorHex: "#FFFFFF" },
    { name: "9th Kyu (Kukyu) - White Belt", shortName: "9K", colorHex: "#FFFFFF" },
    { name: "8th Kyu (Hachikyu) - Yellow Belt", shortName: "8K", colorHex: "#FFD700" },
    { name: "7th Kyu (Shichikyu) - Orange Belt", shortName: "7K", colorHex: "#FFA500" },
    { name: "6th Kyu (Rokkyu) - Green Belt", shortName: "6K", colorHex: "#008000" },
    { name: "5th Kyu (Gokyu) - Blue Belt", shortName: "5K", colorHex: "#0000FF" },
    { name: "4th Kyu (Yonkyu) - Blue Belt", shortName: "4K", colorHex: "#0000FF" },
    { name: "3rd Kyu (Sankyu) - Brown Belt", shortName: "3K", colorHex: "#8B4513" },
    { name: "2nd Kyu (Nikyu) - Brown Belt", shortName: "2K", colorHex: "#8B4513" },
    { name: "1st Kyu (Ikkyu) - Brown Belt", shortName: "1K", colorHex: "#8B4513" },
    { name: "Shodan (1st Dan) - Black Belt", shortName: "1D", colorHex: "#000000" },
    { name: "Nidan (2nd Dan) - Black Belt", shortName: "2D", colorHex: "#000000" },
    { name: "Sandan (3rd Dan) - Black Belt", shortName: "3D", colorHex: "#000000" },
    { name: "Yondan (4th Dan) - Black Belt", shortName: "4D", colorHex: "#000000" },
    { name: "Godan (5th Dan) - Black Belt", shortName: "5D", colorHex: "#000000" },
    { name: "Rokudan (6th Dan) - Black Belt", shortName: "6D", colorHex: "#000000" },
    { name: "Shichidan (7th Dan) - Black Belt", shortName: "7D", colorHex: "#000000" },
    { name: "Hachidan (8th Dan) - Black Belt", shortName: "8D", colorHex: "#000000" },
    { name: "Kudan (9th Dan) - Black Belt", shortName: "9D", colorHex: "#000000" },
    { name: "Judan (10th Dan) - Black Belt", shortName: "10D", colorHex: "#000000" },
  ]
  await seedRankSystem(
    karate.id,
    "USA Karate Federation Kyu-Dan System",
    "KYU_DAN",
    true,
    null,
    karateRanks,
  )
  console.log("Created Karate rank system (20 ranks)")

  // --- 10. TKD — USA Taekwondo Gup-Dan System (20 ranks) ---
  const tkdRanks = [
    { name: "10th Gup - White Belt", shortName: "10G", colorHex: "#FFFFFF" },
    { name: "9th Gup - White Belt with Yellow Stripe", shortName: "9G", colorHex: "#FFFFFF" },
    { name: "8th Gup - Yellow Belt", shortName: "8G", colorHex: "#FFD700" },
    { name: "7th Gup - Yellow Belt with Green Stripe", shortName: "7G", colorHex: "#FFD700" },
    { name: "6th Gup - Green Belt", shortName: "6G", colorHex: "#008000" },
    { name: "5th Gup - Green Belt with Blue Stripe", shortName: "5G", colorHex: "#008000" },
    { name: "4th Gup - Blue Belt", shortName: "4G", colorHex: "#0000FF" },
    { name: "3rd Gup - Blue Belt with Red Stripe", shortName: "3G", colorHex: "#0000FF" },
    { name: "2nd Gup - Red Belt", shortName: "2G", colorHex: "#FF0000" },
    { name: "1st Gup - Red Belt with Black Stripe", shortName: "1G", colorHex: "#FF0000" },
    { name: "1st Dan (Poom/Dan) - Black Belt", shortName: "1D", colorHex: "#000000" },
    { name: "2nd Dan - Black Belt", shortName: "2D", colorHex: "#000000" },
    { name: "3rd Dan - Black Belt", shortName: "3D", colorHex: "#000000" },
    { name: "4th Dan - Black Belt", shortName: "4D", colorHex: "#000000" },
    { name: "5th Dan - Black Belt", shortName: "5D", colorHex: "#000000" },
    { name: "6th Dan - Black Belt", shortName: "6D", colorHex: "#000000" },
    { name: "7th Dan - Black Belt", shortName: "7D", colorHex: "#000000" },
    { name: "8th Dan - Black Belt", shortName: "8D", colorHex: "#000000" },
    { name: "9th Dan - Black Belt", shortName: "9D", colorHex: "#000000" },
    { name: "10th Dan - Black Belt", shortName: "10D", colorHex: "#000000" },
  ]
  await seedRankSystem(tkd.id, "USA Taekwondo Gup-Dan System", "KYU_DAN", true, null, tkdRanks)
  console.log("Created TKD rank system (20 ranks)")

  // --- 11. Wrestling — Skill Levels (6 ranks) ---
  const wrestlingRanks = [
    { name: "Beginner", shortName: "BEG" },
    { name: "Novice", shortName: "NOV" },
    { name: "Intermediate", shortName: "INT" },
    { name: "Advanced", shortName: "ADV" },
    { name: "Elite", shortName: "ELI" },
    { name: "Master", shortName: "MAS" },
  ]
  await seedRankSystem(wrestling.id, "Wrestling Skill Levels", "GRADE", true, null, wrestlingRanks)
  console.log("Created Wrestling rank system (6 ranks)")

  // --- 12. Krav Maga — Level System (6 ranks) ---
  const kravMagaRanks = [
    { name: "Practitioner 1 (P1)", shortName: "P1" },
    { name: "Practitioner 2 (P2)", shortName: "P2" },
    { name: "Practitioner 3 (P3)", shortName: "P3" },
    { name: "Practitioner 4 (P4)", shortName: "P4" },
    { name: "Practitioner 5 (P5)", shortName: "P5" },
    { name: "Graduate / Expert", shortName: "EXP" },
  ]
  await seedRankSystem(kravMaga.id, "Krav Maga Level System", "GRADE", true, null, kravMagaRanks)
  console.log("Created Krav Maga rank system (6 ranks)")

  // --- 13. Wing Chun — Forms Progression (8 ranks) ---
  const wingChunRanks = [
    { name: "Siu Nim Tao (Little Idea)", shortName: "SNT" },
    { name: "Chum Kiu (Seeking Bridge)", shortName: "CK" },
    { name: "Biu Jee (Thrusting Fingers)", shortName: "BJ" },
    { name: "Muk Yan Jong (Wooden Dummy)", shortName: "MYJ" },
    { name: "Luk Dim Boon Gwan (Six-and-a-Half Point Pole)", shortName: "LDB" },
    { name: "Baat Jaam Do (Eight Chopping Knives)", shortName: "BJD" },
    { name: "Instructor", shortName: "INS" },
    { name: "Master", shortName: "MAS" },
  ]
  await seedRankSystem(
    wingChun.id,
    "Wing Chun Forms Progression",
    "OTHER",
    true,
    null,
    wingChunRanks,
  )
  console.log("Created Wing Chun rank system (8 ranks)")

  // ---------------------------------------------------------------------------
  // Roles (6 system defaults)
  // ---------------------------------------------------------------------------
  await db.role.createMany({
    data: [
      {
        code: "STUDENT",
        name: "Student",
        description: "Standard member/student role",
        isSystem: true,
      },
      {
        code: "INSTRUCTOR",
        name: "Instructor",
        description: "Teaches classes and can verify curriculum completions",
        isSystem: true,
      },
      {
        code: "OWNER",
        name: "Owner",
        description: "Organization owner with full administrative access",
        isSystem: true,
      },
      {
        code: "COACH",
        name: "Coach",
        description: "Coaches students, can award ranks and manage rosters",
        isSystem: true,
      },
      {
        code: "ORG_ADMIN",
        name: "Organization Admin",
        description: "Administrative access to organization settings and membership",
        isSystem: true,
      },
      {
        code: "STYLE_APPROVER",
        name: "Style Approver",
        description: "Can approve user-submitted styles within their organization",
        isSystem: true,
      },
    ],
  })
  console.log("Created 6 system roles")

  // ---------------------------------------------------------------------------
  // Tournament Roles (4 system defaults)
  // ---------------------------------------------------------------------------
  await db.tournamentRole.createMany({
    data: [
      {
        code: "COMPETITOR",
        name: "Competitor",
        description: "Participates in divisions as a competitor",
        isSystem: true,
      },
      {
        code: "COACH",
        name: "Coach",
        description: "Corners/coaches competitors during events",
        isSystem: true,
      },
      {
        code: "JUDGE",
        name: "Judge",
        description: "Judges or referees matches/forms",
        isSystem: true,
      },
      {
        code: "VOLUNTEER",
        name: "Volunteer",
        description: "General volunteer staff",
        isSystem: true,
      },
    ],
  })
  console.log("Created 4 system tournament roles")

  // ---------------------------------------------------------------------------
  // Gamification Event Types (6 system defaults)
  // TODO(gamification-design): Needs a proper design pass — these are the
  // obvious event types derived from TuffBuffs behavioral needs. Point values,
  // badge triggers, and level thresholds are all TBD.
  // ---------------------------------------------------------------------------
  await db.gamificationEventType.createMany({
    data: [
      {
        code: "BELT_PROMOTION",
        name: "Belt/Rank Promotion",
        description: "Awarded when a student receives a new rank",
        defaultPoints: 100,
        isSystem: true,
      },
      {
        code: "CLASS_ATTENDANCE",
        name: "Class Attendance",
        description: "Awarded for attending a class session",
        defaultPoints: 10,
        isSystem: true,
      },
      {
        code: "TOURNAMENT_WIN",
        name: "Tournament Win",
        description: "Awarded for winning a division in a tournament",
        defaultPoints: 50,
        isSystem: true,
      },
      {
        code: "TOURNAMENT_PARTICIPATION",
        name: "Tournament Participation",
        description: "Awarded for participating in a tournament",
        defaultPoints: 25,
        isSystem: true,
      },
      {
        code: "COURSE_COMPLETION",
        name: "Course Completion",
        description: "Awarded for completing an entire course",
        defaultPoints: 75,
        isSystem: true,
      },
      {
        code: "CURRICULUM_ITEM_COMPLETION",
        name: "Curriculum Item Completion",
        description: "Awarded for completing a single curriculum item",
        defaultPoints: 5,
        isSystem: true,
      },
    ],
  })
  console.log("Created 6 system gamification event types")

  // ---------------------------------------------------------------------------
  // Subscription Tiers
  // ---------------------------------------------------------------------------
  await db.subscriptionTier.createMany({
    data: [
      // Universal (all brands)
      { code: "FREE", name: "Free", description: "Basic free tier", level: 0, isSystem: true },
      // BBL-specific tiers
      {
        code: "FREE",
        name: "Free",
        description: "BBL free tier",
        level: 0,
        isSystem: false,
        brand: "BBL",
      },
      {
        code: "PREMIUM",
        name: "Premium",
        description: "BBL premium membership",
        level: 10,
        isSystem: false,
        brand: "BBL",
      },
      {
        code: "INSTRUCTOR",
        name: "Instructor",
        description: "BBL instructor tier",
        level: 20,
        isSystem: false,
        brand: "BBL",
      },
      {
        code: "SCHOOL_OWNER",
        name: "School Owner",
        description: "BBL school owner tier",
        level: 30,
        isSystem: false,
        brand: "BBL",
      },
      {
        code: "LEGEND",
        name: "Legend",
        description: "BBL legend tier",
        level: 40,
        isSystem: false,
        brand: "BBL",
      },
    ],
  })
  console.log("Created 6 subscription tiers (1 universal + 5 BBL)")

  // ---------------------------------------------------------------------------
  // Karate Substyles (Style rows under Karate discipline)
  // Kajukenbo appears here as a substyle AND as a standalone discipline (Option C)
  // ---------------------------------------------------------------------------
  await db.style.createMany({
    data: [
      { code: "shotokan", name: "Shotokan Karate", status: "APPROVED", disciplineId: karate.id },
      { code: "wado-ryu", name: "Wado-Ryu", status: "APPROVED", disciplineId: karate.id },
      { code: "goju-ryu", name: "Goju-Ryu", status: "APPROVED", disciplineId: karate.id },
      {
        code: "hawaiian-kenpo",
        name: "Hawaiian Kenpo",
        status: "APPROVED",
        disciplineId: karate.id,
      },
      { code: "kajukenbo", name: "Kajukenbo", status: "APPROVED", disciplineId: karate.id },
    ],
  })
  console.log("Created 5 Karate substyles")

  // =========================================================================
  // TEST USERS + FULL IDENTITY GRAPH
  // =========================================================================
  // Creates realistic test practitioners with Passport, DirectoryProfile,
  // Organization, Membership, OrganizationDiscipline, and RankAward.
  // This exercises: auth → passport → directory → org → membership → rank.
  // =========================================================================

  // --- Organizations ---
  const baselineOrg = await db.organization.create({
    data: {
      brand: "BASELINE_MARTIAL_ARTS",
      name: "Baseline Martial Arts Academy",
      slug: "baseline-academy",
      type: "DOJO",
      city: "Boulder",
      state: "CO",
      country: "US",
    },
  })
  console.log("Created Baseline org")

  // Wire disciplines to org
  await db.organizationDiscipline.createMany({
    data: [
      { organizationId: baselineOrg.id, disciplineId: bjj.id },
      { organizationId: baselineOrg.id, disciplineId: muayThai.id },
      { organizationId: baselineOrg.id, disciplineId: eskrima.id },
    ],
  })
  console.log("Created org-discipline links")

  // --- Test users with full identity graph ---
  const testUsers = [
    {
      name: "Sensei Demo",
      email: "sensei@baseline.test",
      role: "user",
      passport: {
        displayName: "Sensei Demo",
        legalFirstName: "Demo",
        legalLastName: "Instructor",
        bio: "Head instructor at Baseline Academy.",
      },
      directory: {
        slug: "sensei-demo",
        visibility: "PUBLIC" as const,
        locationCity: "Boulder",
        locationRegion: "CO",
        locationCountry: "US",
        showEmail: true,
        showPhone: false,
        showOrgs: true,
        showRanks: true,
      },
      disciplineId: bjj.id,
      membershipStatus: "ACTIVE" as const,
    },
    {
      name: "Student Alpha",
      email: "alpha@baseline.test",
      role: "user",
      passport: {
        displayName: "Student Alpha",
        legalFirstName: "Alpha",
        legalLastName: "Student",
        bio: "BJJ and Muay Thai student.",
      },
      directory: {
        slug: "student-alpha",
        visibility: "PUBLIC" as const,
        locationCity: "Boulder",
        locationRegion: "CO",
        locationCountry: "US",
        showEmail: false,
        showPhone: false,
        showOrgs: true,
        showRanks: true,
      },
      disciplineId: bjj.id,
      membershipStatus: "ACTIVE" as const,
    },
    {
      name: "Student Beta",
      email: "beta@baseline.test",
      role: "user",
      passport: {
        displayName: "Student Beta",
        legalFirstName: "Beta",
        legalLastName: "Student",
        bio: "Eskrima practitioner.",
      },
      directory: {
        slug: "student-beta",
        visibility: "MEMBERS_ONLY" as const,
        locationCity: "Denver",
        locationRegion: "CO",
        locationCountry: "US",
        showEmail: true,
        showPhone: true,
        showOrgs: true,
        showRanks: true,
      },
      disciplineId: eskrima.id,
      membershipStatus: "ACTIVE" as const,
    },
    {
      name: "Ghost User",
      email: "ghost@baseline.test",
      role: "user",
      passport: { displayName: "Ghost User", legalFirstName: "Ghost", legalLastName: "Hidden" },
      directory: {
        slug: "ghost-user",
        visibility: "HIDDEN" as const,
        locationCity: "Boulder",
        locationRegion: "CO",
        locationCountry: "US",
        showEmail: false,
        showPhone: false,
        showOrgs: false,
        showRanks: false,
      },
      disciplineId: muayThai.id,
      membershipStatus: "ACTIVE" as const,
    },
    {
      name: "Pending Patty",
      email: "pending@baseline.test",
      role: "user",
      passport: {
        displayName: "Pending Patty",
        legalFirstName: "Patty",
        legalLastName: "Pending",
        bio: "Just signed up!",
      },
      directory: {
        slug: "pending-patty",
        visibility: "PUBLIC" as const,
        locationCity: "Longmont",
        locationRegion: "CO",
        locationCountry: "US",
        showEmail: false,
        showPhone: false,
        showOrgs: true,
        showRanks: true,
      },
      disciplineId: bjj.id,
      membershipStatus: "PENDING" as const,
    },
  ]

  // Fetch some ranks for awards
  const bjjBlue = await db.rank.findFirst({
    where: { rankSystem: { discipline: { code: "bjj" } }, shortName: "BL0" },
  })
  const bjjWhite = await db.rank.findFirst({
    where: { rankSystem: { discipline: { code: "bjj" } }, shortName: "W0" },
  })
  const eskrimaL3 = await db.rank.findFirst({
    where: {
      rankSystem: { discipline: { code: "eskrima" }, name: { contains: "PIMA Denver" } },
      shortName: "L3",
    },
  })

  for (const tu of testUsers) {
    const user = await db.user.create({
      data: {
        name: tu.name,
        email: tu.email,
        emailVerified: true,
        role: tu.role,
        lastActiveBrandId: "BASELINE_MARTIAL_ARTS",
      },
    })

    await db.passport.create({
      data: { userId: user.id, ...tu.passport },
    })

    await db.directoryProfile.create({
      data: { userId: user.id, ...tu.directory },
    })

    const membership = await db.membership.create({
      data: {
        brand: "BASELINE_MARTIAL_ARTS",
        status: tu.membershipStatus,
        userId: user.id,
        organizationId: baselineOrg.id,
        disciplineId: tu.disciplineId,
        joinedAt: tu.membershipStatus === "ACTIVE" ? now : undefined,
      },
    })

    // Rank awards for active members
    if (tu.membershipStatus === "ACTIVE") {
      let awardRank: typeof bjjBlue = null
      if (tu.disciplineId === bjj.id && tu.email === "sensei@baseline.test") awardRank = bjjBlue
      else if (tu.disciplineId === bjj.id) awardRank = bjjWhite
      else if (tu.disciplineId === eskrima.id) awardRank = eskrimaL3

      if (awardRank) {
        await db.rankAward.create({
          data: {
            userId: user.id,
            rankId: awardRank.id,
            awardedAt: now,
          },
        })
        // Update membership with current rank
        await db.membership.update({
          where: { id: membership.id },
          data: { rankId: awardRank.id },
        })
      }
    }

    console.log(
      `Created test user: ${tu.name} (${tu.directory.visibility}, ${tu.membershipStatus})`,
    )
  }

  // Set org owner
  const senseiUser = await db.user.findUnique({ where: { email: "sensei@baseline.test" } })
  if (senseiUser) {
    await db.organization.update({
      where: { id: baselineOrg.id },
      data: { ownerId: senseiUser.id },
    })

    const senseiMembership = await db.membership.findFirst({
      where: {
        userId: senseiUser.id,
        organizationId: baselineOrg.id,
      },
    })
    const ownerRole = await db.role.findFirst({ where: { code: "OWNER", isSystem: true } })

    if (senseiMembership && ownerRole) {
      await db.membershipRoleAssignment.create({
        data: {
          membershipId: senseiMembership.id,
          roleId: ownerRole.id,
        },
      })
    }
  }

  console.log("Created 5 test users with full identity graph")

  await db.program.createMany({
    data: [
      {
        brand: "BASELINE_MARTIAL_ARTS",
        organizationId: baselineOrg.id,
        disciplineId: bjj.id,
        name: "Adult Brazilian Jiu-Jitsu",
        slug: "adult-brazilian-jiu-jitsu",
        description: "Fundamentals, sparring, and rank progression for adult BJJ students.",
        status: "ACTIVE",
        sortOrder: 10,
      },
      {
        brand: "BASELINE_MARTIAL_ARTS",
        organizationId: baselineOrg.id,
        disciplineId: muayThai.id,
        name: "Muay Thai Striking",
        slug: "muay-thai-striking",
        description: "Pad work, clinch basics, conditioning, and safe technical sparring.",
        status: "ACTIVE",
        sortOrder: 20,
      },
    ],
  })
  console.log("Created 2 Baseline programs")

  // SESSION_0031: minimal schedule fixtures so the smoke and detail page have
  // something to work with. Idempotent via upsert on (brand, programId, name).
  const adultBjjProgram = await db.program.findFirst({
    where: { brand: "BASELINE_MARTIAL_ARTS", slug: "adult-brazilian-jiu-jitsu" },
    select: { id: true, organizationId: true, disciplineId: true },
  })
  if (adultBjjProgram) {
    const existingSchedule = await db.classSchedule.findFirst({
      where: {
        brand: "BASELINE_MARTIAL_ARTS",
        programId: adultBjjProgram.id,
        name: "Adult BJJ — Tue/Thu Evenings",
      },
      select: { id: true },
    })
    if (!existingSchedule) {
      await db.classSchedule.create({
        data: {
          brand: "BASELINE_MARTIAL_ARTS",
          organizationId: adultBjjProgram.organizationId,
          programId: adultBjjProgram.id,
          disciplineId: adultBjjProgram.disciplineId,
          name: "Adult BJJ — Tue/Thu Evenings",
          description: "Evening fundamentals and rolling for adult students.",
          status: "ACTIVE",
          daysOfWeek: ["TUE", "THU"],
          startTime: "18:30",
          endTime: "20:00",
          timezone: "America/Denver",
          locationName: "Main Mat",
          capacity: 30,
        },
      })
      console.log("Seeded 1 Baseline class schedule")
    }
  }

  console.log("Seeding completed!")
}

main()
  .catch(e => {
    console.error("Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
