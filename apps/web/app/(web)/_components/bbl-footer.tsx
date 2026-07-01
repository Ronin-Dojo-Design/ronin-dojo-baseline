import { Link } from "~/components/common/link"
import { bblBodyFont, bblHeadingFont } from "~/lib/fonts"

/**
 * Black Belt Legacy site footer — a brand column (logo + tagline + socials), three
 * link columns, a contact bar, and a copyright bar. Dark, single-brand BBL.
 *
 * Recovered + extended from the reverted SESSION_0411 holding-page footer
 * (SESSION_0416): socials un-gated and the Lineage Network / Explore / Legal link
 * columns restored, pointed at live app routes.
 */

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com/blackbeltlegacy",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/blackbeltlegacy",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@blackbeltlegacy",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
] as const

// Live app routes (no programs link — SESSION_0416 operator).
const FOOTER_SECTIONS = [
  {
    title: "Lineage Network",
    links: [
      { label: "Build Your Lineage", href: "/lineage/join" },
      { label: "Member Directory", href: "/directory" },
      { label: "School Directory", href: "/schools" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Lineage", href: "/lineage" },
      { label: "Changelog", href: "/changelog" },
      // Curriculum + Techniques hidden for launch (SESSION_0417).
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
] as const

export function BblFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      className={`${bblHeadingFont.variable} ${bblBodyFont.variable} mt-auto border-t border-white/10 bg-[#0a0a0a] text-white/60 [font-family:var(--font-bbl-body),system-ui,sans-serif]`}
    >
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/blackbeltlegacy/bbl-logo-white.png"
              alt="Black Belt Legacy"
              width="120"
              height="69"
              className="h-9 w-auto"
            />
            <p className="mt-4 max-w-md text-sm/6 text-white/50">
              Building the definitive lineage network for martial artists — track your journey,
              verify your credentials, and connect with instructors from Rigan Machado&apos;s
              legendary black belt lineage.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/55 transition-colors hover:border-red-500/40 hover:text-red-500"
                >
                  <svg
                    className="size-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map(section => (
            <div key={section.title}>
              <h3 className="text-xs font-extrabold uppercase italic tracking-[0.14em] text-white [font-family:var(--font-bbl-heading),system-ui,sans-serif]">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Contact bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 text-sm text-white/50 sm:flex-row sm:px-10">
          <span>Network of verified schools worldwide</span>
          <a
            href="mailto:welcome@blackbeltlegacy.com"
            className="text-red-500 transition-colors hover:text-red-400"
          >
            welcome@blackbeltlegacy.com
          </a>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/10 bg-black">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-white/40 sm:flex-row sm:px-10">
          <p>© {year} Black Belt Legacy. All rights reserved.</p>
          <p>A Ronin Dojo Design production</p>
        </div>
      </div>
    </footer>
  )
}
