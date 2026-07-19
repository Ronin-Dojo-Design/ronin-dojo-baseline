import Link from "next/link";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-6">
            <Link href="/app" className="font-display text-lg font-bold tracking-wide">
              MAMMOTH<span className="text-primary">.</span>crm
            </Link>
            <nav className="flex gap-5 text-sm">
              <Link href="/app" className="text-muted transition-colors hover:text-ink">
                Pipeline
              </Link>
              <Link href="/app/sales" className="text-muted transition-colors hover:text-ink">
                Sales cockpit
              </Link>
              <Link href="/app/leads" className="text-muted transition-colors hover:text-ink">
                Lead intake
              </Link>
              <Link href="/app/new" className="text-muted transition-colors hover:text-ink">
                New Job Order
              </Link>
            </nav>
          </div>
          <Link href="/" className="text-sm text-muted transition-colors hover:text-ink">
            ← Site
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-7">{children}</div>
    </div>
  );
}
