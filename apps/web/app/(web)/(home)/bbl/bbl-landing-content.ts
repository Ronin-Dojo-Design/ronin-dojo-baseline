/**
 * BBL landing copy + data, lifted from the legacy
 * `ronin-dojo-monorepo/src/brands/blackbeltlegacy/BlackBeltLegacyLanding.jsx`
 * (content/IA only — UI rebuilt on current primitives, SESSION_0367).
 *
 * Routes are mapped to the current platform:
 * legacy register modal → /auth/login · profile/tree links → /lineage ·
 * posts → /posts · schools → /schools · school register → /organizations/new ·
 * techniques → /techniques. Email-capture "More Info" → /about.
 */

export const BBL_ROUTES = {
  register: "/auth/login",
  moreInfo: "/about",
  join: "/lineage/join",
  lineage: "/lineage",
  directory: "/directory",
  posts: "/posts",
  schools: "/schools",
  schoolRegister: "/organizations/new",
  techniques: "/techniques",
} as const

const IMG = "/brand/blackbeltlegacy"

export const BBL_IMAGES = {
  logoWhite: `${IMG}/bbl-logo-white.png`,
  heroTeaching: `${IMG}/hero-teaching.jpg`,
  heroNoGi: `${IMG}/hero-no-gi.jpg`,
  heroClinch: `${IMG}/hero-clinch.jpg`,
  riganMachado: `${IMG}/rigan-machado.jpg`,
  riganAcademy: `${IMG}/rigan-academy.png`,
  bobAndRigan: `${IMG}/bob-and-rigan.jpg`,
  communityGroup: `${IMG}/community-group.jpg`,
  celebration: `${IMG}/coral-belt-celebration.jpg`,
} as const

export const heroContent = {
  eyebrow: "The Official Lineage Network",
  titleLead: "Build Your",
  titleAccent: "Legacy",
  description:
    "Connect with verified instructors, document your journey, and preserve your martial arts lineage for the next generation.",
  card: {
    image: BBL_IMAGES.riganMachado,
    badge: "8th Degree Coral Belt",
    logo: BBL_IMAGES.riganAcademy,
    name: "Rigan Machado",
    role: "Head of Machado Lineage",
    credentials:
      "Pan American Champion · ADCC Veteran · Training generations of world-class practitioners",
  },
}

export const videoContent = {
  eyebrow: "Hear from the source",
  title: "Rigan Machado on Black Belt Legacy",
  description: "Learn why lineage matters and what makes the Black Belt Legacy network special.",
  embedUrl: "https://www.youtube.com/embed/EGGPLxKtYZ8",
  embedTitle: "Rigan Machado explains Black Belt Legacy",
  caption: "8th Degree Coral Belt · Pan American Champion · ADCC Veteran",
}

export type DirtyDozenMember = {
  name: string
  rank: string
  dirtyDozenRank: number | null
  school: string
  location: string
  image?: string
}

export const dirtyDozen: DirtyDozenMember[] = [
  {
    name: "Bob Bass",
    rank: "8th Degree Coral Belt",
    dirtyDozenRank: 1,
    school: "South Bay Jiu Jitsu",
    location: "Los Angeles, CA",
    image: `${IMG}/bob-bass-classic.jpg`,
  },
  {
    name: "Rick Williams",
    rank: "Black Belt",
    dirtyDozenRank: 9,
    school: "South Bay Jiu Jitsu",
    location: "Los Angeles, CA",
    image: `${IMG}/rick-williams.jpg`,
  },
  {
    name: "David Meyer",
    rank: "8th Degree Coral Belt",
    dirtyDozenRank: 10,
    school: "David Meyer BJJ",
    location: "Los Angeles, CA",
    image: `${IMG}/david-meyer.jpg`,
  },
  {
    name: "Chris Haueter",
    rank: "Black Belt",
    dirtyDozenRank: 11,
    school: "Combat Base",
    location: "Los Angeles, CA",
    image: `${IMG}/chris-haueter.jpg`,
  },
  {
    name: "John Will",
    rank: "6th Degree Black Belt",
    dirtyDozenRank: 12,
    school: "John Will Martial Arts",
    location: "Australia",
    image: `${IMG}/john-will.jpg`,
  },
  {
    name: "Renato Magno",
    rank: "Black Belt",
    dirtyDozenRank: null,
    school: "Street Sports",
    location: "Santa Monica, CA",
  },
]

export const dirtyDozenSection = {
  pill: "America's BJJ Pioneers",
  eyebrow: "Rigan Machado's Black Belts",
  title: "The Dirty Dozen Legacy",
  footerTitle: "Join a Verified Network of Martial Artists",
  footerCopy: "Training partners, instructors, and academies connected through authentic lineage.",
}

export const heritageContent = {
  eyebrow: "The Foundation",
  title: "Built on Authentic Lineage",
  badge: "Coral Belt Lineage",
  lead: "Bob Bass, the first American promoted to coral belt by Rigan Machado, represents the bridge between Brazil's founding masters and America's next generation of practitioners.",
  body: "This direct lineage — from Carlos Gracie Sr to Rigan Machado to Bob Bass — is what makes Black Belt Legacy different. Every instructor in our network traces their credentials back through verified, documented training relationships.",
  ctaLabel: "Learn About Bob Bass",
}

export const valuePropsSection = {
  eyebrow: "Why Train Here",
  title: "Track Your Lineage. Elevate Your Jiu Jitsu.",
  description:
    "Coral-belt leadership, structured progressions, and a lineage tracker that keeps your journey credible.",
}

export const valueProps = [
  {
    icon: "trophy",
    title: "Official Rigan Machado Lineage",
    description:
      "Train under the official lineage of Rigan Machado and his black belts in Brazilian Jiu Jitsu, backed by coral-belt leadership.",
  },
  {
    icon: "chart",
    title: "Membership Paths for Every Role",
    description:
      "Free members explore lineage and profiles, Premium unlocks full content and progress tools, and Instructor/School Owner tiers add student and academy management.",
  },
  {
    icon: "swords",
    title: "Track Your Legacy",
    description:
      "Document promotions, instructors, and seminar time so your lineage remains traceable and credible for the next generation.",
  },
] as const

export const featuresSection = {
  eyebrow: "New Member Features",
  title: "Modernized experience, lineage-first design",
  description:
    "Explore the refreshed interface and tools rolling out to members and school owners.",
  membersHeading: "What's new for members",
  ownersHeading: "School owner features",
  ownersFootnote: "AND MORE being added constantly—tell us what you need next.",
}

export const featureHighlights = [
  {
    kicker: "Verified Lineage",
    title: "Profiles that prove your path",
    description:
      "Connect belt history, instructors, and schools into a single verified profile that travels with you.",
    image: BBL_IMAGES.heroTeaching,
  },
  {
    kicker: "Technique Library",
    title: "Curriculum with belt-level clarity",
    description:
      "Save the techniques you train, review progress by belt level, and keep your growth visible.",
    image: BBL_IMAGES.heroNoGi,
  },
  {
    kicker: "Legacy Network",
    title: "Drop in with trusted schools",
    description:
      "Find verified academies, view lineage ties, and stay connected wherever you train.",
    image: BBL_IMAGES.heroClinch,
  },
]

export const newMemberFeatures = [
  {
    title: "Updated Interface",
    description:
      "Streamlined flows that spotlight lineage, programs, and calls to action without clutter.",
  },
  {
    title: "Modernized Design",
    description:
      "Sharper contrast, elevated typography, and an easy-to-navigate layout across devices.",
  },
  {
    title: "Improved Lineage Tree",
    description: "Redesigned tracker with clearer branches, ranks, and instructor callouts.",
  },
  {
    title: "Customizable Profiles",
    description: "Editable member profiles with space for achievements, media, and progress.",
  },
  {
    title: "School Owner Profile",
    description: "Dedicated admin view for owners to manage their academies and lineage.",
  },
]

export const schoolOwnerFeatures = [
  "Create your own lineage tree",
  "Add and invite your students",
  "Track ranks, belts, and progress",
  "Highlight and feature your instructors",
  "Share your location and class times",
  "Create seminars and invite members",
  "Curriculum and technique libraries with custom filters",
  "Technique breakdowns and video libraries",
  "Save favorites and student lists",
  "Add students directly to your tree",
  "Ongoing feature drops—more coming constantly",
]

export const timelineSection = {
  eyebrow: "Lineage",
  title: "Crafted Through Generations",
  description:
    "Carlos Gracie Sr → Carlos Gracie Jr → Rigan Machado → Bob Bass. Track where you learn and who taught your instructors.",
}

export type TimelineEntry = {
  name: string
  rank: string
  belt: "founder" | "red" | "coral"
  copy: string
  image: string
}

export const timeline: TimelineEntry[] = [
  {
    name: "Carlos Gracie Sr",
    rank: "Founder of Gracie Jiu Jitsu",
    belt: "founder",
    copy: "Built the framework that empowered the Gracie family to share Brazilian Jiu Jitsu worldwide.",
    image: `${IMG}/carlos-gracie-sr.jpg`,
  },
  {
    name: "Carlos Gracie Jr",
    rank: "9th Degree Red Belt",
    belt: "red",
    copy: "Mentored Rigan Machado and guided the next wave of instructors carrying the family legacy forward.",
    image: `${IMG}/carlos-gracie-jr.jpg`,
  },
  {
    name: "Rigan Machado",
    rank: "8th Degree Coral Belt",
    belt: "coral",
    copy: "Pan American Champion, ADCC veteran, and coach to notable students. Leads the lineage celebrated as Black Belt Legacy.",
    image: `${IMG}/rigan-machado.jpg`,
  },
  {
    name: "Bob Bass",
    rank: "8th Degree Coral Belt",
    belt: "coral",
    copy: "Historic Pan Am wins over Márcio Feitosa and first American promoted to coral belt by Rigan Machado in 2024.",
    image: `${IMG}/bob-bass.jpg`,
  },
]

export const testimonialsSection = {
  eyebrow: "Community",
  title: "Students Carry the Story",
  description: "Hear from members of the Black Belt Legacy network.",
  groupPhotoTitle: "Join a Verified Network of Martial Artists",
  groupPhotoCopy:
    "Training partners, instructors, and academies connected through authentic lineage.",
}

export const testimonials = [
  {
    name: "Bill Hosken",
    role: "Black Belt",
    quote:
      "Every class connects technique to the lineage. Knowing exactly who taught my coach makes promotions feel earned and real.",
    image: `${IMG}/bill-hosken.jpg`,
  },
  {
    name: "David Meyer",
    role: "Dirty Dozen #10 · Instructor",
    quote:
      "The coaches back up the talk with coral-belt credentials and patience. Training under this lineage has elevated my teaching.",
    image: `${IMG}/david-meyer.jpg`,
  },
  {
    name: "Chris Haueter",
    role: "Dirty Dozen #11 · Combat Base Founder",
    quote:
      "Black Belt Legacy preserves what matters — the direct connection between teacher and student that makes jiu jitsu real.",
    image: `${IMG}/chris-haueter.jpg`,
  },
  {
    name: "John Will",
    role: "Dirty Dozen #12 · Pioneer of BJJ in Australasia",
    quote:
      "This network represents the authentic lineage we've built over decades. It's about credibility and connection.",
    image: `${IMG}/john-will.jpg`,
  },
]

export const faqSection = {
  eyebrow: "Getting Started",
  title: "Signing Up for Black Belt Legacy",
}

export const faqs = [
  {
    question: "What is Black Belt Legacy?",
    answer:
      "Black Belt Legacy is a network connecting practitioners to verified martial arts lineages, starting with Rigan Machado's Brazilian Jiu Jitsu family tree.",
  },
  {
    question: "How do I track my lineage?",
    answer:
      "Use our Lineage Builder tool to map your instructors, belt promotions, and training history back through the generations.",
  },
  {
    question: "Who is Rigan Machado?",
    answer:
      "Rigan Machado is an 8th Degree Coral Belt, Pan American Champion, and ADCC veteran. He leads the Black Belt Legacy network with decades of teaching experience.",
  },
  {
    question: "How do I find a school in my lineage?",
    answer:
      "Use the school directory and map view to discover academies in the Black Belt Legacy network near you, with verified instructor credentials.",
  },
  {
    question: "Is there a cost to join?",
    answer:
      "Basic lineage tracking is free. Premium features for school owners and advanced tracking are coming soon.",
  },
]

export const finalCta = {
  title: "Register Now",
  description:
    "Track your lineage, connect with coral-belt instructors, and join a verified network of martial artists worldwide.",
}

export const celebrationContent = {
  opener: "Today we celebrate greatness.",
  titleLead: "Congratulations",
  titleAccent: "Dave Meyer",
  titleTail: "on Joining the Legends",
  image: BBL_IMAGES.celebration,
}

export const treeSection = {
  eyebrow: "Explore the Lineage",
  title: "The Rigan Machado Family Tree",
  description:
    "Trace the direct lineage from Carlos Gracie Sr through Rigan Machado to the Dirty Dozen and beyond.",
  ctaLabel: "View the Family Tree",
}

export type PromoContent = {
  eyebrow: string
  title: string
  description: string
  image: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  benefitsHeading: string
  benefits: string[]
  /** Feature gated off at launch (SESSION_0368) — render a Coming Soon badge, no dead links. */
  comingSoon?: boolean
}

export const promos: PromoContent[] = [
  {
    eyebrow: "Community Feed",
    title: "The BBL Posts Feed",
    description:
      "Members share techniques, tips, seminars, and Q&A in one verified feed. Follow instructors, save favorites, and stay connected to your lineage as it evolves.",
    image: BBL_IMAGES.heroNoGi,
    primaryCta: { label: "Browse Posts", href: BBL_ROUTES.posts },
    secondaryCta: { label: "Register Now", href: BBL_ROUTES.register },
    benefitsHeading: "Member Benefits",
    benefits: [
      "Technique breakdowns, event recaps, and academy updates in one place.",
      "Verified posts from lineage-approved instructors and schools.",
      "Save and revisit the content that matches your belt path.",
    ],
  },
  {
    eyebrow: "School Directory",
    title: "Register Your School",
    description:
      "Add your academy to the Black Belt Legacy directory and connect with verified instructors, students, and lineage branches across the globe.",
    image: BBL_IMAGES.heroTeaching,
    primaryCta: { label: "Register Your School", href: BBL_ROUTES.schoolRegister },
    secondaryCta: { label: "Explore Schools", href: BBL_ROUTES.schools },
    benefitsHeading: "Why Register",
    benefits: [
      "Get discovered by students searching verified academies.",
      "Join the lineage network for events, promotions, and collaborations.",
      "Highlight your instructors, history, and unique curriculum.",
    ],
  },
  {
    eyebrow: "Premium Library",
    title: "Technique Library Access",
    description:
      "Premium members unlock the full technique library — belt-level filters, saved favorites, and curated lesson paths built by verified instructors.",
    image: BBL_IMAGES.heroClinch,
    primaryCta: { label: "Register Now", href: BBL_ROUTES.register },
    secondaryCta: { label: "More Info", href: BBL_ROUTES.moreInfo },
    benefitsHeading: "Premium Benefits",
    comingSoon: true,
    benefits: [
      "Full access to belt-specific technique collections and drills.",
      "Save favorites, track progress, and build your own study list.",
      "Instructor-led pathways that map directly to your lineage.",
    ],
  },
]
