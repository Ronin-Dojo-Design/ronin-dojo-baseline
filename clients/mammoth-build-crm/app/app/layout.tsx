import Link from "next/link";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-y-1 px-5 py-2">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <Link href="/app" className="font-display text-lg font-bold tracking-wide">
              MAMMOTH<span className="text-primary">.</span>crm
            </Link>
            <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <Link href="/app" className="text-muted transition-colors hover:text-ink">
                Pipeline
              </Link>
              <Link href="/app/sales" className="text-muted transition-colors hover:text-ink">
                Sales cockpit
              </Link>
              <Link href="/app/leads" className="text-muted transition-colors hover:text-ink">
                Lead intake
              </Link>
              <Link href="/app/intake" className="text-muted transition-colors hover:text-ink">
                Discovery
              </Link>
              <Link href="/app/new" className="text-muted transition-colors hover:text-ink">
                New Job Order
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/login" className="text-muted transition-colors hover:text-ink">
              Sign in
            </Link>
            <Link href="/" className="text-muted transition-colors hover:text-ink">
              ← Site
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-7">{children}</div>
    </div>
  );
}
