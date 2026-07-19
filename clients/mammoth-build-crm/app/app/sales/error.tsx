"use client";

export default function SalesCockpitError({ reset }: { reset: () => void }) {
  return (
    <section role="alert" className="rounded-lg border border-primary/60 bg-surface p-6">
      <h1 className="font-display text-xl font-bold">Sales cockpit unavailable</h1>
      <p className="mt-2 text-sm text-muted">
        The route failed safely. Check the local session or database, then retry.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover"
      >
        Retry
      </button>
    </section>
  );
}
