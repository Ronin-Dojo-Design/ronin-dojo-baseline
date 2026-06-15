-- AlterTable
ALTER TABLE "Affiliation" ADD COLUMN     "passportId" TEXT;

-- AlterTable
ALTER TABLE "DirectoryProfile" ADD COLUMN     "passportId" TEXT;

-- AlterTable
ALTER TABLE "FightRecord" ADD COLUMN     "passportId" TEXT;

-- AlterTable
ALTER TABLE "LineageNode" ADD COLUMN     "passportId" TEXT;

-- AlterTable
ALTER TABLE "Passport" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RankAward" ADD COLUMN     "passportId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryProfile_passportId_key" ON "DirectoryProfile"("passportId");

-- CreateIndex
CREATE UNIQUE INDEX "LineageNode_passportId_key" ON "LineageNode"("passportId");

-- AddForeignKey
ALTER TABLE "DirectoryProfile" ADD CONSTRAINT "DirectoryProfile_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankAward" ADD CONSTRAINT "RankAward_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageNode" ADD CONSTRAINT "LineageNode_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightRecord" ADD CONSTRAINT "FightRecord_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

