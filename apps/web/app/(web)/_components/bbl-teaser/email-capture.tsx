"use client"

import { useAction } from "next-safe-action/hooks"
import { type FormEvent, useState } from "react"
import { captureBblEmail } from "~/server/web/bbl/capture-email"

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
function CaptureBrandmark({ logoUrl, brandName }: { logoUrl: string | null; brandName: string }) {
  // Always show the BBL logo image (never a text wordmark): default to the bundled
  // BBL logo asset since prod BrandSettings.logoUrl is null. A BrandSettings logo
  // still overrides it. BrandSettings logos may be remote; keep this native until
  // remote image optimization is configured for customer-owned brand assets.
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={logoUrl ?? "/brand/blackbeltlegacy/bbl-logo-white.png"}
      alt={brandName}
      width="96"
      height="55"
      className="h-10 w-auto"
    />
  )
}

export function EmailCapture({
  logoUrl,
  brandName,
}: {
  logoUrl: string | null
  brandName: string
}) {
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
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm sm:p-6">
      <CaptureBrandmark logoUrl={logoUrl} brandName={brandName} />

      {isSuccess ? (
        <div className="mt-6 text-left" role="status" aria-live="polite">
          <h2 className="text-xl font-extrabold uppercase italic tracking-tight text-foreground [font-family:var(--font-bbl-heading,var(--font-display))]">
            You&apos;re on the list
          </h2>
          <p className="mt-2 text-sm/6 text-muted-foreground">
            Thanks! We&apos;ll keep you posted on features, updates, and more.
          </p>
        </div>
      ) : (
        <>
          <h2 className="mt-6 text-xl font-extrabold uppercase italic tracking-tight text-foreground [font-family:var(--font-bbl-heading,var(--font-display))]">
            Join Our Mailing List
          </h2>
          <p className="mt-2 text-sm/6 text-muted-foreground">
            Get notified on features, updates, and more!
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
                className="w-full rounded-lg border border-input bg-background/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/70 motion-reduce:transition-none"
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
                className="w-full rounded-lg border border-input bg-background/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/70 motion-reduce:transition-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 motion-reduce:transition-none"
            >
              {isPending ? "Enabling…" : "Enable Notifications"}
            </button>

            {serverError && (
              <p className="text-center text-sm text-destructive" role="alert">
                {serverError}
              </p>
            )}
          </form>

          <p className="mt-4 text-center text-[0.7rem] text-muted-foreground">
            No spam, ever. We respect your privacy.
          </p>
        </>
      )}
    </div>
  )
}
