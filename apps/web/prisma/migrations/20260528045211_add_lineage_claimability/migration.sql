-- AlterTable
ALTER TABLE "LineageTree" ADD COLUMN     "isClaimable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "LineageTreeMember" ADD COLUMN     "isClaimable" BOOLEAN NOT NULL DEFAULT true;
