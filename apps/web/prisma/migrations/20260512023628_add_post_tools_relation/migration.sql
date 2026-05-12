-- DropIndex
DROP INDEX "Post_brand_status_idx";

-- CreateTable
CREATE TABLE "_PostToTool" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostToTool_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PostToTool_B_index" ON "_PostToTool"("B");

-- AddForeignKey
ALTER TABLE "_PostToTool" ADD CONSTRAINT "_PostToTool_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToTool" ADD CONSTRAINT "_PostToTool_B_fkey" FOREIGN KEY ("B") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
