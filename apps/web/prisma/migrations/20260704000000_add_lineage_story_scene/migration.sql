-- SESSION_0498 — Epic A (Lineage Journey) A0: LineageStoryScene, the per-person story-scene
-- satellite for the /directory/[slug] ancestry scroll story. 1:1 keyed by passportId (grill
-- fork #1 ratified — identity SoT per ADR 0025; survives node re-parenting / ADR 0037 tree
-- consolidation), ON DELETE CASCADE mirroring the DirectoryProfile/LineageNode satellites.
-- Purely additive story copy/media — never rank, visibility, or verification authority.
-- Hand-authored + verified via `migrate diff` shadow-replay (shared-local-DB discipline;
-- see docs/runbooks/database/schema-migration.md and the SESSION_0487 migrate-dev reset trap).
-- NOTE: the raw diff against the local prodsnap also emitted `DROP TABLE "playing_with_neon"`
-- (a Neon-starter artifact outside the datamodel) — intentionally excluded, not this lane.

-- CreateTable
CREATE TABLE "LineageStoryScene" (
    "id" TEXT NOT NULL,
    "quote" TEXT,
    "quoteAttribution" TEXT,
    "storyBio" TEXT,
    "heroImageUrl" TEXT,
    "heroVideoUrl" TEXT,
    "posterUrl" TEXT,
    "sceneOrder" INTEGER,
    "isBridge" BOOLEAN NOT NULL DEFAULT false,
    "bridgeCondition" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "passportId" TEXT NOT NULL,

    CONSTRAINT "LineageStoryScene_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LineageStoryScene_passportId_key" ON "LineageStoryScene"("passportId");

-- AddForeignKey
ALTER TABLE "LineageStoryScene" ADD CONSTRAINT "LineageStoryScene_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
