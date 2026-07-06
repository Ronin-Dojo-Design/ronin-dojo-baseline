import { NetworkIcon, RouteIcon, ShieldCheckIcon, UsersRoundIcon } from "lucide-react"
import { PremiumPanel, SOLID_PILL } from "./chrome"
import { cx } from "~/lib/utils"

function MetricPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className={cx("rounded-2xl px-4 py-3", SOLID_PILL)}>
      <div className="flex items-center gap-2 text-white/45">
        <span className="[&_svg]:size-4">{icon}</span>
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="mt-2 text-xl font-black tracking-[-0.04em] text-white">{value}</div>
    </div>
  )
}

// Compact mobile metric — value + label inline, for the slim header strip.
function MetricStat({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-sm font-black tabular-nums text-white">{value}</span>
      <span className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white/45">
        {label}
      </span>
    </span>
  )
}

/**
 * The explorer's heading panel: the "Focal lineage view" badge, the slim mobile
 * title + full desktop heading/lede, and the tree metrics. The metrics render
 * TWICE by design — a thin inline `MetricStat` strip on mobile (`sm:hidden`) and
 * a `MetricPill` grid on `sm+` — kept as two separate presentational functions
 * (Desi: the responsive split is justified; NOT a kind-union).
 */
export function MetricsHeader({
  memberCount,
  verifiedCount,
  rootCount,
}: {
  memberCount: number
  verifiedCount: number
  rootCount: number
}) {
  return (
    <PremiumPanel className="max-sm:p-3">
      <div className="flex flex-col gap-4 sm:gap-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/8 bg-[#141415] px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/60 sm:text-[0.65rem]">
              <RouteIcon className="size-3.5" />
              Focal lineage view
            </span>
          </div>

          {/* Slim mobile title (YouTube-app header); desktop keeps the full heading + lede. */}
          <h2 className="mt-3 text-xl uppercase italic tracking-[0.01em] text-white [font-family:var(--font-bbl-heading),system-ui,sans-serif] sm:hidden">
            Living lineage
          </h2>

          <h2 className="mt-4 hidden text-balance text-3xl uppercase italic tracking-[0.01em] text-white [font-family:var(--font-bbl-heading),system-ui,sans-serif] sm:block sm:text-4xl lg:text-5xl">
            Explore the living lineage.
          </h2>

          <p className="mt-3 hidden max-w-3xl text-pretty text-sm/6 text-white/60 sm:block sm:text-base/7">
            Click any practitioner to recenter the tree and trace their lineage. Instructors with
            students of their own branch into their own box; everyone else lists under their teacher
            — tap them to open their profile and full student roster.
          </p>
        </div>

        {/* Metrics — thin inline strip on mobile, MetricPill grid on sm+. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:hidden">
          <MetricStat label="Members" value={memberCount} />
          <span aria-hidden className="text-white/20">
            ·
          </span>
          <MetricStat label="Verified" value={verifiedCount} />
          <span aria-hidden className="text-white/20">
            ·
          </span>
          <MetricStat label="Roots" value={rootCount} />
        </div>

        <div className="hidden w-full shrink-0 grid-cols-3 gap-2 sm:grid md:w-auto md:max-w-[25rem]">
          <MetricPill icon={<UsersRoundIcon />} label="Members" value={memberCount} />
          <MetricPill icon={<ShieldCheckIcon />} label="Verified" value={verifiedCount} />
          <MetricPill icon={<NetworkIcon />} label="Roots" value={rootCount} />
        </div>
      </div>
    </PremiumPanel>
  )
}
