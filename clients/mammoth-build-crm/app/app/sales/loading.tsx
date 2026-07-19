export default function SalesCockpitLoading() {
  return (
    <div role="status" aria-label="Loading sales cockpit" className="animate-pulse space-y-4">
      <div className="h-8 w-56 rounded bg-elevated" />
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((value) => <div key={value} className="h-72 rounded-lg bg-surface" />)}
      </div>
      <span className="sr-only">Loading sales cockpit…</span>
    </div>
  );
}
