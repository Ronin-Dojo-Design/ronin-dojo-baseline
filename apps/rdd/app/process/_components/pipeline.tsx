/**
 * The pipeline diagram — SESSION_0680.
 *
 * Deliberately CSS-grid + real DOM text, not a hand-authored SVG image: every stage is an actual
 * heading/paragraph (semantic, crawlable, quotable by a generative engine), and the fan-out /
 * converge shape comes from small decorative connector glyphs (aria-hidden) between the stage
 * cards. The grid-card pattern mirrors `app/page.tsx`'s MODEL/ENGAGEMENTS sections — same design
 * language, applied to a sequence instead of a set.
 *
 * No lane count, no reviewer count, no stage count appears in copy anywhere in this file — three
 * build-lane cards render because three is a legible number of boxes to draw, not because the
 * page claims "3 lanes." (RDD no-numbers rule — see `docs/product/rdd/brand-brief.md`.)
 */

type ConnectorVariant = "fan-out" | "converge" | "arrow" | "arrow-strong";

function Connector({ variant }: { variant: ConnectorVariant }) {
  if (variant === "arrow" || variant === "arrow-strong") {
    const strong = variant === "arrow-strong";
    return (
      <div className="flex justify-center py-3" aria-hidden="true">
        <svg
          width="20"
          height="36"
          viewBox="0 0 20 36"
          className={strong ? "text-primary" : "text-border"}
        >
          <line
            x1="10"
            y1="0"
            x2="10"
            y2="24"
            stroke="currentColor"
            strokeWidth={strong ? 2 : 1.5}
          />
          <path
            d="M3 20 L10 34 L17 20"
            stroke="currentColor"
            strokeWidth={strong ? 2 : 1.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  const converge = variant === "converge";
  return (
    <div className="flex justify-center py-3" aria-hidden="true">
      <svg width="200" height="40" viewBox="0 0 200 40" className="text-border">
        {[30, 100, 170].map(x => (
          <path
            key={x}
            d={converge ? `M${x} 2 L100 38` : `M100 2 L${x} 38`}
            stroke="currentColor"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
}

function StageCard({
  title,
  body,
  emphasize,
}: {
  title: string;
  body: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={
        emphasize
          ? "rounded-lg border-2 border-primary bg-surface p-6 text-center sm:p-8"
          : "rounded-lg border border-border bg-surface p-6"
      }
    >
      <h3
        className={
          emphasize
            ? "font-display text-xl font-semibold text-ink"
            : "font-display text-lg font-semibold text-ink"
        }
      >
        {title}
      </h3>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{body}</p>
      {emphasize && (
        <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          The gate that matters
        </p>
      )}
    </div>
  );
}

const LANE_BODY =
  "Builds in isolation, on its own branch, blind to what the other lanes are doing until the work converges.";

export function Pipeline() {
  return (
    <div className="mx-auto max-w-3xl">
      <StageCard
        title="Plan"
        body="A goal becomes a scoped plan before any code is touched — open decisions get resolved first, not discovered mid-build."
      />

      <Connector variant="fan-out" />

      <div className="grid gap-4 md:grid-cols-3">
        <StageCard title="Build lane" body={LANE_BODY} />
        <StageCard title="Build lane" body={LANE_BODY} />
        <StageCard title="Build lane" body={LANE_BODY} />
      </div>

      <Connector variant="converge" />

      <StageCard
        title="Gates"
        body="Type-checked. Tested. Checked against the design system. Every lane answers to the same gates on the way through — none of them optional, none of them skipped."
      />

      <Connector variant="arrow" />

      <StageCard
        title="Independent review"
        body="Verification, design, and architecture are checked as separate passes, by different eyes each time. The agent that built the change is never the one that clears it."
      />

      <Connector variant="arrow-strong" />

      <StageCard
        title="Human approval"
        body="One person reads the diff and decides. Everything before this stage prepares the decision; nothing after it happens without one."
        emphasize
      />

      <Connector variant="arrow" />

      <StageCard
        title="Ship"
        body="Only after approval does a change reach production — logged in the session record, on the record, traceable back to the decision that shipped it."
      />
    </div>
  );
}
