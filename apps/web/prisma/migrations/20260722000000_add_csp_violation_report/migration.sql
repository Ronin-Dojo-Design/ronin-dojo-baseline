-- SESSION_0617 (Fork 1B) — durable CSP violation rollup store.
--
-- Additive, non-destructive: ONE new table (`CspViolationReport`) + a unique dedupe-hash index and
-- two read indexes. No enum, no FK, no existing table is touched, so prod applies this cleanly during
-- `prebuild -> migrate deploy`.
--
-- Hand-authored (never `migrate dev` — worktrees share ONE local dev DB). The `id` column has no DB
-- default because `@default(cuid(2))` is generated client-side (matches `PlanningIntake`); `count`
-- starts at 1 (first sighting) and is incremented on every subsequent report of the same shape.

-- CreateTable
CREATE TABLE "CspViolationReport" (
    "id" TEXT NOT NULL,
    "dedupeHash" TEXT NOT NULL,
    "violatedDirective" TEXT,
    "blockedUri" TEXT,
    "documentUri" TEXT,
    "disposition" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CspViolationReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CspViolationReport_dedupeHash_key" ON "CspViolationReport"("dedupeHash");

-- CreateIndex
CREATE INDEX "CspViolationReport_count_idx" ON "CspViolationReport"("count");

-- CreateIndex
CREATE INDEX "CspViolationReport_lastSeenAt_idx" ON "CspViolationReport"("lastSeenAt");
