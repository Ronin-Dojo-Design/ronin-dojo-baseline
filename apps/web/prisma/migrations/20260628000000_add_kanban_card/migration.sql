-- CreateEnum
CREATE TYPE "KanbanCardSource" AS ENUM ('ledger', 'task', 'manual');

-- CreateTable
CREATE TABLE "KanbanCard" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "source" "KanbanCardSource" NOT NULL DEFAULT 'manual',
    "sourceRef" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT,
    "lane" TEXT,
    "owner" TEXT,
    "due" TEXT,
    "nextStep" TEXT,
    "value" INTEGER,
    "badges" JSONB,
    "fields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanbanCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KanbanCard_configId_stage_order_idx" ON "KanbanCard"("configId", "stage", "order");

-- CreateIndex
CREATE UNIQUE INDEX "KanbanCard_configId_source_sourceRef_key" ON "KanbanCard"("configId", "source", "sourceRef");
