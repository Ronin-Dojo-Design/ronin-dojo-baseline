"use client"

import { useAction } from "next-safe-action/hooks"
import { type FormEvent, useState } from "react"
import { captureBblEmail } from "~/server/web/bbl/capture-email"
import { BBL_LOGO_WHITE } from "./bbl-teaser-types"

/**
 * BBL launch-teaser email capture (SESSION_0411).
 *
 * Dark cinematic card modeled on the legacy monorepo `EmailCaptureModal` UX, but
 * the submit now persists to THIS app's DB via the public `captureBblEmail` server
 * action (the legacy modal POSTed to a now-dead WordPress endpoint — that is the bug
 * this fixes). Loading / success / error states are driven by `useAction`.
 *
 * Inline (not a modal) — the capture is the primary CTA of the teaser, so it lives
 * in the hero rather than behind a click.
 */
export function EmailCapture() {
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

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BBL_LOGO_WHITE}
        alt="Black Belt Legacy"
        width="96"
        height="55"
        className="h-10 w-auto"
      />

      {isSuccess ? (
        <div className="mt-6 text-left" role="status" aria-live="polite">
          <h2 className="text-xl font-extrabold uppercase italic tracking-tight text-white [font-family:var(--font-bbl-heading,var(--font-display))]">
            You&apos;re on the list
          </h2>
          <p className="mt-2 text-sm/6 text-white/60">
            Thanks for joining Black Belt Legacy. We&apos;ll email you the moment early access
            opens.
          </p>
        </div>
      ) : (
        <>
          <h2 className="mt-6 text-xl font-extrabold uppercase italic tracking-tight text-white [font-family:var(--font-bbl-heading,var(--font-display))]">
            Join Black Belt Legacy
          </h2>
          <p className="mt-2 text-sm/6 text-white/55">
            Be the first in. Get early access to the lineage network.
          </p>

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
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-red-500/70"
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
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-red-500/70"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-red-600 px-4 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:opacity-50"
            >
              {isPending ? "Joining…" : "Get Early Access"}
            </button>

            {serverError && (
              <p className="text-center text-sm text-red-400" role="alert">
                {serverError}
              </p>
            )}
          </form>

          <p className="mt-4 text-center text-[0.7rem] text-white/35">
            No spam, ever. We respect your privacy.
          </p>
        </>
      )}
    </div>
  )
}
