-- SESSION_0518 — additive RankEntry compatibility anchor.
--
-- RankAward remains live during the first read/write cutover. Every existing award
-- receives one stable RankEntry mirror; no legacy row is changed or removed here.

CREATE TYPE "RankEntryStatus" AS ENUM ('PENDING', 'UNVERIFIED', 'VERIFIED', 'DISPUTED');
CREATE TYPE "RankEntryReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');
CREATE TYPE "RankEntryReviewReason" AS ENUM ('NEW_RANK', 'PROMOTER_CHANGED', 'SCHOOL_CHANGED', 'DISPUTE');

CREATE TABLE "RankEntry" (
    "id" TEXT NOT NULL,
    "status" "RankEntryStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "passportId" TEXT NOT NULL,
    "rankId" TEXT NOT NULL,
    "rankAwardId" TEXT NOT NULL,

    CONSTRAINT "RankEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RankEntryReview" (
    "id" TEXT NOT NULL,
    "status" "RankEntryReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reason" "RankEntryReviewReason" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rankEntryId" TEXT NOT NULL,

    CONSTRAINT "RankEntryReview_pkey" PRIMARY KEY ("id")
);

INSERT INTO "RankEntry" ("id", "status", "createdAt", "updatedAt", "passportId", "rankId", "rankAwardId")
SELECT
    'rank-entry-' || "id",
    CASE "verificationStatus"
        WHEN 'VERIFIED' THEN 'VERIFIED'::"RankEntryStatus"
        WHEN 'DISPUTED' THEN 'DISPUTED'::"RankEntryStatus"
        ELSE 'UNVERIFIED'::"RankEntryStatus"
    END,
    "createdAt",
    "updatedAt",
    "passportId",
    "rankId",
    "id"
FROM "RankAward";

CREATE UNIQUE INDEX "RankEntry_rankAwardId_key" ON "RankEntry"("rankAwardId");
CREATE UNIQUE INDEX "RankEntry_passportId_rankId_key" ON "RankEntry"("passportId", "rankId");
CREATE INDEX "RankEntry_passportId_status_idx" ON "RankEntry"("passportId", "status");
CREATE INDEX "RankEntry_rankId_idx" ON "RankEntry"("rankId");
CREATE INDEX "RankEntryReview_rankEntryId_status_idx" ON "RankEntryReview"("rankEntryId", "status");
CREATE INDEX "RankEntryReview_status_reason_idx" ON "RankEntryReview"("status", "reason");

ALTER TABLE "RankEntry" ADD CONSTRAINT "RankEntry_passportId_fkey"
  FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RankEntry" ADD CONSTRAINT "RankEntry_rankId_fkey"
  FOREIGN KEY ("rankId") REFERENCES "Rank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RankEntry" ADD CONSTRAINT "RankEntry_rankAwardId_fkey"
  FOREIGN KEY ("rankAwardId") REFERENCES "RankAward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RankEntryReview" ADD CONSTRAINT "RankEntryReview_rankEntryId_fkey"
  FOREIGN KEY ("rankEntryId") REFERENCES "RankEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
