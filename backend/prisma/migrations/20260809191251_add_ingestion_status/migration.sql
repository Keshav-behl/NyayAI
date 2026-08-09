-- CreateEnum
CREATE TYPE "IngestionStage" AS ENUM ('PENDING', 'DOWNLOADED', 'VALIDATED', 'CHUNKED', 'ENRICHED', 'REVIEWED', 'INGESTED');

-- CreateTable
CREATE TABLE "ingestion_status" (
    "id" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "shortTitle" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "stage" "IngestionStage" NOT NULL DEFAULT 'PENDING',
    "sectionsIngested" INTEGER NOT NULL DEFAULT 0,
    "sectionsTarget" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingestion_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ingestion_status_namespace_shortTitle_key" ON "ingestion_status"("namespace", "shortTitle");
