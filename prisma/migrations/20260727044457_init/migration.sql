-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('SUCCESS', 'BLOCKED', 'TIMEOUT', 'INVALID');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('PIXEL', 'COMMERCE', 'RETENTION', 'TAG_MANAGER', 'UNIDENTIFIED');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('CONFIRMED', 'OPAQUE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('READY', 'GAPS', 'NOT_YET');

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" "ScanStatus" NOT NULL,
    "httpStatus" INTEGER,
    "server" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Detection" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "technology" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "confidence" "Confidence" NOT NULL,
    "matchedOn" TEXT NOT NULL,

    CONSTRAINT "Detection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "measurable" INTEGER NOT NULL,
    "commerce" INTEGER NOT NULL,
    "retention" INTEGER NOT NULL,
    "scale" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "verdict" "Verdict" NOT NULL,
    "rubricVersion" TEXT NOT NULL,
    "narrative" TEXT,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IcpProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weights" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IcpProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scan_domain_fetchedAt_idx" ON "Scan"("domain", "fetchedAt");

-- CreateIndex
CREATE INDEX "Detection_scanId_idx" ON "Detection"("scanId");

-- CreateIndex
CREATE INDEX "Detection_technology_idx" ON "Detection"("technology");

-- CreateIndex
CREATE UNIQUE INDEX "Score_scanId_key" ON "Score"("scanId");

-- CreateIndex
CREATE UNIQUE INDEX "IcpProfile_name_key" ON "IcpProfile"("name");

-- AddForeignKey
ALTER TABLE "Detection" ADD CONSTRAINT "Detection_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
