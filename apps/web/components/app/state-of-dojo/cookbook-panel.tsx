/**
 * CookbookPanel — the REAL "Cookbook" projection: SOT_Cookbook's router table + the
 * `docs/protocols/recipes/*` cards as browsable, pipeline-stage-tagged cards (SESSION_0607 WS-C,
 * G-023). Replaces the WS-A placeholder.
 *
 * Conforms to the FROZEN panel contract (`./_kernel/contract.ts`): named export, self-fetching
 * async RSC, placement-agnostic, `{ compact? }`, owns its own `<Suspense>` + empty state. Copies
 * `state-panel.tsx`'s Suspense+async wrapper shape.
 *
 * Unlike `StatePanel`, this panel is NOT brand-scoped — every recipe applies repo-wide (governance/
 * orchestration, not brand product work) — so it doesn't compose `_kernel/projection`'s `BrandTabs`
 * (typed to the brand `ProductLane`, which doesn't fit a pipeline stage). It instead filters by
 * `PipelineStage` using the SAME underlying `Tabs` L1 primitive `BrandTabs` wraps.
 */
import { Suspense } from "react"
import { Badge, type badgeVariants } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { EmptyList } from "~/components/common/empty-list"
import { Heading } from "~/components/common/heading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/common/tabs"
import {
  type CookbookEntry,
  groupEntriesByStage,
  PIPELINE_STAGE_LABEL,
  PIPELINE_STAGES,
  type PipelineStage,
} from "~/lib/state-of-dojo/cookbook-parse"
import { fetchCookbookFeed } from "~/lib/state-of-dojo/fetch-cookbook"
import { cx, type VariantProps } from "~/lib/utils"
import type { ProjectionPanelProps } from "./_kernel/contract"
import { PanelSkeleton, ProjectionSection } from "./_kernel/projection"

// ── contract entrypoint: sync wrapper owns the Suspense boundary ─────────────────────────────────

export function CookbookPanel({ compact }: ProjectionPanelProps) {
  return (
    <Suspense fallback={<PanelSkeleton compact={compact} />}>
      <CookbookPanelContent compact={compact} />
    </Suspense>
  )
}

// ── stage → badge variant (semantic, not brand-tinted — mirrors `phaseBadgeVariant` in `_kernel/phase.ts`) ──

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

const STAGE_BADGE_VARIANT: Record<PipelineStage, BadgeVariant> = {
  idea: "outline",
  plan: "soft",
  build: "primary",
  review: "info",
  ship: "success",
}

// ── async content ────────────────────────────────────────────────────────────────────────────────

async function CookbookPanelContent({ compact }: ProjectionPanelProps) {
  const feed = await fetchCookbookFeed()
  const { entries } = feed
  const { grouped, defaultStage } = groupEntriesByStage(entries)

  return (
    <div className="w-full space-y-4">
      <header className="space-y-1">
        <Heading size="h4">Cookbook</Heading>
        <p className="text-xs text-muted-foreground">
          {entries.length} recipe{entries.length === 1 ? "" : "s"} · SOT_Cookbook router +{" "}
          <code>docs/protocols/recipes</code>
          {feed.meta.degraded && " · feed degraded (reading main)"}
        </p>
      </header>

      {entries.length === 0 ? (
        <EmptyList className="text-sm">
          Cookbook feed unavailable — projects from <code>docs/protocols/SOT_Cookbook.md</code> +{" "}
          <code>docs/protocols/recipes/*</code> on <code>main</code>.
        </EmptyList>
      ) : (
        <Tabs defaultValue={defaultStage}>
          <TabsList>
            {PIPELINE_STAGES.map(stage => {
              const count = grouped.find(g => g.stage === stage)?.entries.length ?? 0
              return (
                <TabsTrigger key={stage} value={stage}>
                  {PIPELINE_STAGE_LABEL[stage]}
                  <Badge variant="soft" size="sm" className="ml-1.5 max-sm:hidden">
                    {count}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>
          {grouped.map(({ stage, entries: stageEntries }) => (
            <TabsContent key={stage} value={stage}>
              <ProjectionSection title={`${PIPELINE_STAGE_LABEL[stage]} recipes`}>
                <RecipeList entries={stageEntries} stage={stage} compact={compact} />
              </ProjectionSection>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}

// ── recipe list + card ───────────────────────────────────────────────────────────────────────────

function RecipeList({
  entries,
  stage,
  compact,
}: {
  entries: CookbookEntry[]
  stage: PipelineStage
  compact?: boolean
}) {
  if (!entries.length) {
    return (
      <EmptyList className="text-xs">
        No {PIPELINE_STAGE_LABEL[stage].toLowerCase()}-stage recipes yet.
      </EmptyList>
    )
  }
  return (
    <ul className={cx("grid gap-3", compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
      {entries.map(entry => (
        <li key={entry.path}>
          <RecipeCard entry={entry} compact={compact} />
        </li>
      ))}
    </ul>
  )
}

function RecipeCard({ entry, compact }: { entry: CookbookEntry; compact?: boolean }) {
  return (
    <Card hover={false} focus={false} className="gap-1.5 rounded-md p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={STAGE_BADGE_VARIANT[entry.stage]} size="sm">
          {PIPELINE_STAGE_LABEL[entry.stage]}
        </Badge>
        <span className="text-sm font-medium text-pretty">{entry.title}</span>
      </div>
      {!compact && entry.when && (
        <p className="text-xs text-muted-foreground text-pretty">{entry.when}</p>
      )}
      {!compact && entry.why && (
        <p className="text-2xs text-muted-foreground/80 italic text-pretty">{entry.why}</p>
      )}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.map(tag => (
            <Badge key={tag} variant="outline" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  )
}
