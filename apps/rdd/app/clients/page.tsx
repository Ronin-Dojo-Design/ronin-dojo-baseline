import type { Metadata } from "next";

/**
 * `/clients` — neutral index for the v0 client-preview area (SESSION_0678).
 *
 * No client names on this page, by design: it's the page someone lands on if they guess the
 * path or drop the trailing segment off a real link. `robots` (noindex/nofollow) comes from
 * `app/clients/layout.tsx`.
 */
export const metadata: Metadata = {
  title: "Client previews",
};

export default function ClientsIndexPage() {
  return (
    <main className="flex min-h-screen items-center bg-bg px-5 py-24 sm:px-8">
      <div className="mx-auto w-full max-w-2xl text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Ronin Dojo Design
        </p>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Client previews
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          This area holds project-status pages for active clients. Access is provided by your RDD
          contact &mdash; if you have a link, follow it directly.
        </p>
        <p className="mt-10 text-sm text-muted">
          Looking for something else?{" "}
          <a href="/" className="text-primary hover:underline">
            Back to ronindojodesign.com
          </a>
        </p>
      </div>
    </main>
  );
}
