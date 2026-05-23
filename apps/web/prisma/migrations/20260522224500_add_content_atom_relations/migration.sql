-- Add canonical ContentAtom relationships for inherited variant rendering.

-- CreateTable
CREATE TABLE "_ContentAtomToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ContentAtomToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ContentAtomToTool" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ContentAtomToTool_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ContentAtomToTag_B_index" ON "_ContentAtomToTag"("B");

-- CreateIndex
CREATE INDEX "_ContentAtomToTool_B_index" ON "_ContentAtomToTool"("B");

-- AddForeignKey
ALTER TABLE "_ContentAtomToTag" ADD CONSTRAINT "_ContentAtomToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "ContentAtom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentAtomToTag" ADD CONSTRAINT "_ContentAtomToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentAtomToTool" ADD CONSTRAINT "_ContentAtomToTool_A_fkey" FOREIGN KEY ("A") REFERENCES "ContentAtom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentAtomToTool" ADD CONSTRAINT "_ContentAtomToTool_B_fkey" FOREIGN KEY ("B") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_contentAtomId_fkey" FOREIGN KEY ("contentAtomId") REFERENCES "ContentAtom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
