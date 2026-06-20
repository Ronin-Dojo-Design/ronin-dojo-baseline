"use client"

import { useAction } from "next-safe-action/hooks"
import { type FormEvent, useEffect, useState } from "react"
import { captureBblEmail } from "~/server/web/bbl/capture-email"
import { BBL_LOGO_BLACK, BBL_LOGO_WHITE } from "./bbl-teaser-types"

/**
 * BBL launch-teaser email capture (SESSION_0411).
 *
 * Submit persists to THIS app's DB via the public `captureBblEmail` server action.
 * Loading / success / error states are driven by `useAction`.
 *
 * `theme` (SESSION_0419 / SESSION_0420): the card was a dark cinematic card built for the teaser
 * holding page (dark bg). It is also rendered at the bottom of the LIGHT landing page
 * (`/lineage/join`, home), where the white logo + dark inputs disappeared on white. `theme="light"`
 * swaps to the black wordmark + a light card/inputs; `theme="dark"` keeps the teaser look.
 *
 * When `theme` is OMITTED (SESSION_0420), the card follows the user's system color-scheme
 * preference (`prefers-color-scheme`) — light system → light card, dark system → dark card. With
 * no preference (or SSR / no JS), it defaults to BLACK (dark). Callers that need a fixed look
 * (the dark teaser page, the light landing) still pass `theme` explicitly.
 */
type EmailCaptureProps = {
  theme?: "dark" | "light"
}

/**
 * Resolve the effective light/dark theme. An explicit `theme` prop always wins; otherwise track
 * the system `prefers-color-scheme`, defaulting to BLACK (dark) when there is no preference, during
 * SSR, or before hydration. We only flip to light when the system *explicitly* prefers light, so a
 * no-preference environment stays black.
 */
function useResolvedTheme(theme?: "dark" | "light"): "dark" | "light" {
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    if (theme) {
      return
    }
    const query = window.matchMedia("(prefers-color-scheme: light)")
    const apply = () => setSystemTheme(query.matches ? "light" : "dark")
    apply()
    query.addEventListener("change", apply)
    return () => query.removeEventListener("change", apply)
  }, [theme])

  return theme ?? systemTheme
}

export function EmailCapture({ theme }: EmailCaptureProps) {
  const resolvedTheme = useResolvedTheme(theme)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const { execute, status } = useAction(captureBblEmail)

  const isPending = status === "executing"
  const isSuccess = status === "hasSucceeded"
  const serverError =
    status === "hasErrored" ? "Something went wrong. Please try again." : undefined

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isPending) return
    execute({ email: email.trim(), name: name.trim() || undefined })
  }

  const isLight = resolvedTheme === "light"
  const s = {
    card: isLight
      ? "border-neutral-200 bg-white shadow-sm"
      : "border-white/10 bg-white/[0.04] backdrop-blur-sm",
    logo: isLight ? BBL_LOGO_BLACK : BBL_LOGO_WHITE,
    heading: isLight ? "text-neutral-900" : "text-white",
    sub: isLight ? "text-neutral-500" : "text-white/55",
    successSub: isLight ? "text-neutral-600" : "text-white/60",
    input: isLight
      ? "border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:border-red-500"
      : "border-white/10 bg-black/40 text-white placeholder-white/35 focus:border-red-500/70",
    fineprint: isLight ? "text-neutral-400" : "text-white/35",
  }

  return (
    <div className={`w-full max-w-md rounded-2xl border p-5 sm:p-6 ${s.card}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={s.logo}
        alt="Black Belt Legacy"
        width="96"
        height="55"
        className="mx-auto h-10 w-auto"
      />

      {isSuccess ? (
        <div className="mt-6 text-left" role="status" aria-live="polite">
          <h2
            className={`text-xl font-extrabold uppercase italic tracking-tight [font-family:var(--font-bbl-heading,var(--font-display))] ${s.heading}`}
          >
            You&apos;re on the list
          </h2>
          <p className={`mt-2 text-sm/6 ${s.successSub}`}>
            Thanks! We&apos;ll keep you posted on features, updates, and more.
          </p>
        </div>
      ) : (
        <>
          <h2
            className={`mt-6 text-xl font-extrabold uppercase italic tracking-tight [font-family:var(--font-bbl-heading,var(--font-display))] ${s.heading}`}
          >
            Join Our Mailing List
          </h2>
          <p className={`mt-2 text-sm/6 ${s.sub}`}>Get notified on features, updates, and more!</p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <div>
              <label htmlFor="bbl-capture-name" className="sr-only">
                Your name
              </label>
              <input
                id="bbl-capture-name"
                type="text"
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="Your name (optional)"
                autoComplete="name"
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors ${s.input}`}
              />
            </div>

            <div>
              <label htmlFor="bbl-capture-email" className="sr-only">
                Email address
              </label>
              <input
                id="bbl-capture-email"
                type="email"
                required
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors ${s.input}`}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-red-600 px-4 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:opacity-50"
            >
              {isPending ? "Enabling…" : "Enable Notifications"}
            </button>

            {serverError && (
              <p className="text-center text-sm text-red-500" role="alert">
                {serverError}
              </p>
            )}
          </form>

          <p className={`mt-4 text-center text-[0.7rem] ${s.fineprint}`}>
            No spam, ever. We respect your privacy.
          </p>
        </>
      )}
    </div>
  )
}
