-- AlterTable
ALTER TABLE "RankAward" ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE INDEX "RankAward_organizationId_idx" ON "RankAward"("organizationId");

-- AddForeignKey
ALTER TABLE "RankAward" ADD CONSTRAINT "RankAward_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
