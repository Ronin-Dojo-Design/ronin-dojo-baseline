/**
 * Inbox (Mammoth) — surface-first, gated on Resend setup.
 *
 * The admin inbox for inbound email lands here once a Resend account is
 * connected for Mammoth (Michael). Until then the surface renders live with a
 * clear setup-gate banner — deliberately NOT blocking; wire it when ready.
 * Mirrors the BBL inbox module (G-033, apps/web) which is already built + dark.
 */

export const metadata = {
  title: "Inbox — Mammoth Build CRM",
};

export default function InboxPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-7">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        Communications
      </p>
      <h1 className="font-display text-2xl font-bold">Inbox</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Inbound email to your Mammoth addresses will land here automatically — read/unread
        triage, searchable, owned in the CRM instead of lost in a personal inbox.
      </p>

      {/* Setup-gate banner — prominent, non-blocking */}
      <div
        role="status"
        className="mt-6 flex items-start gap-3 rounded-lg border border-primary bg-surface px-4 py-3"
        style={{ background: "rgba(255,106,26,0.08)" }}
      >
        <span aria-hidden="true" className="text-lg leading-none">
          📬
        </span>
        <div className="text-sm">
          <p className="font-semibold text-ink">Pending Resend setup</p>
          <p className="mt-1 text-muted">
            Once a <strong className="text-ink">Resend account is connected for Mammoth</strong>,
            inbound mail starts flowing into this inbox — no extra work on your side. This
            isn&rsquo;t blocking anything; we&rsquo;ll wire it whenever you&rsquo;re ready.
          </p>
        </div>
      </div>

      {/* Empty state */}
      <div className="mt-6 rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center">
        <p className="font-display text-base font-semibold text-ink">No messages yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Connect Resend to start receiving. Delivered messages will show sender, subject,
          received time, and a read/unread triage state.
        </p>
      </div>
    </div>
  );
}
