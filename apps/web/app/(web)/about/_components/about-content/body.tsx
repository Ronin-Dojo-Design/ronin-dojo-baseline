import { Card } from "~/components/common/card"
import { H2 } from "~/components/common/heading"

/**
 * The /about story + tech-stack sections, in Black Belt Legacy product voice.
 * Replaces the former dirstarter boilerplate (tools-for-developers) — content is
 * brand/martial-arts voice, no platform-boilerplate language.
 */

const TECH_STACK: { name: string; role: string }[] = [
  { name: "Next.js 16", role: "React App Router — server-first, the whole experience." },
  {
    name: "PostgreSQL + Prisma 7",
    role: "One typed model for lineage, ranks, claims, and entitlements.",
  },
  { name: "Better Auth", role: "Passwordless magic-link and social sign-in." },
  { name: "Stripe", role: "Checkout, billing portal, and signed-webhook entitlements." },
  { name: "Resend", role: "Transactional and lifecycle email." },
  { name: "Cloudflare R2", role: "Member photos and media, served fast." },
  { name: "React 19 + Tailwind", role: "A fast, responsive, accessible interface." },
  { name: "Vercel", role: "Hosting, preview deploys, and continuous delivery." },
]

export const AboutBody = ({ siteName }: { siteName: string }) => (
  <>
    <section className="space-y-4">
      <H2>What is {siteName}?</H2>
      <div className="space-y-4 leading-relaxed text-muted-foreground">
        <p>
          {siteName} is the heritage-and-community home for martial artists — the place where
          identity, lineage, rank history, instructors, schools, stories, and trust signals come
          together.
        </p>
        <p>
          Martial arts history is scattered across personal sites, gym pages, social posts, old
          photos, and fading memories. A practitioner can be real, influential, and historically
          important — and still be impossible to verify online. {siteName} fixes that: a verifiable
          profile, a provable promotion timeline, and a living lineage network, built to be worthy
          of the arts it records.
        </p>
      </div>
    </section>

    <section className="space-y-5">
      <H2>Built on a modern stack</H2>
      <p className="text-muted-foreground">
        Typed, tested, and auditable end to end — no legacy plugins, no guesswork.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {TECH_STACK.map(item => (
          <Card key={item.name} hover={false} className="p-4">
            <p className="font-semibold">{item.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.role}</p>
          </Card>
        ))}
      </div>
    </section>
  </>
)
