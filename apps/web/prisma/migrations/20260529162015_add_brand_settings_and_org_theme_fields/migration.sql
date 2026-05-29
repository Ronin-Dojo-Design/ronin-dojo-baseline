-- AlterTable
ALTER TABLE "OrgSettings" ADD COLUMN     "accentColor" TEXT,
ADD COLUMN     "accentFgColor" TEXT,
ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "ogImageUrl" TEXT,
ADD COLUMN     "primaryColor" TEXT,
ADD COLUMN     "primaryFgColor" TEXT;

-- CreateTable
CREATE TABLE "BrandSettings" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "primaryColor" TEXT,
    "primaryFgColor" TEXT,
    "accentColor" TEXT,
    "accentFgColor" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "ogImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandSettings_brand_key" ON "BrandSettings"("brand");
