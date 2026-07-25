import type { ReactNode } from "react";

/**
 * Shared section shell for the `/industries` route tree — the exact pattern from
 * `app/page.tsx` (SESSION_0625), lifted here so the index page and each per-industry
 * page render with the identical eyebrow/title/border rhythm instead of drifting.
 * Not shared with `app/page.tsx` itself (that file is owned by SESSION_0625's PR and
 * is off-limits to this lane) — this is a parallel copy, not a refactor.
 */
export function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-t border-border px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto w-full max-w-5xl">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-3 max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
