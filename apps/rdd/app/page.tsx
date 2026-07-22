/**
 * RDD — hello-route (SESSION_0601, Slice A scaffold proof).
 *
 * Deliberately minimal: proves the workspace peer builds/renders on the shared
 * brand-token surface (app/globals.css). The real marketing/portfolio surface
 * (mission, philosophy, brand showcase) is Slice B3 — not built here.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-bg px-5 text-center">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Ronin Dojo Design</h1>
      <p className="text-muted">Scaffold live — apps/rdd (Slice A, G-027).</p>
    </main>
  );
}
