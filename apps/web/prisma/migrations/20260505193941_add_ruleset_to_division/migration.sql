-- AlterTable
ALTER TABLE "Division" ADD COLUMN     "ruleSetId" TEXT;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "RuleSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
