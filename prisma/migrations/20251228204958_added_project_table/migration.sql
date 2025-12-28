-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('UPLOADED', 'PREPROCESSING', 'PREVIEW_READY', 'READY_FOR_CLIPS', 'FAILED', 'NEW');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rawVideoS3Key" TEXT,
    "rawDurationSec" INTEGER,
    "rawWidth" INTEGER,
    "rawHeight" INTEGER,
    "st360pS3Key" TEXT,
    "st460pS3Key" TEXT,
    "hq720pS3Key" TEXT,
    "status" "ProjectStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
