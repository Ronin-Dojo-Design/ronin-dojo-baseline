-- AlterTable
ALTER TABLE "User" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isPlaceholder" BOOLEAN NOT NULL DEFAULT false;
