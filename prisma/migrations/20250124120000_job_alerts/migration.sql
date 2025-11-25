-- CreateEnum
CREATE TYPE "AlertFrequency" AS ENUM ('IMMEDIATE', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY', 'MID', 'SENIOR');

-- CreateEnum
CREATE TYPE "RemotePreference" AS ENUM ('REMOTE', 'ONSITE', 'HYBRID', 'FLEXIBLE');

-- CreateTable
CREATE TABLE "JobAlertSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titleQuery" TEXT NOT NULL,
    "location" TEXT,
    "remotePreference" "RemotePreference" NOT NULL DEFAULT 'FLEXIBLE',
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'MID',
    "frequency" "AlertFrequency" NOT NULL DEFAULT 'DAILY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobAlertSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobListing" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'adzuna',
    "title" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "country" TEXT,
    "url" TEXT NOT NULL,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "raw" JSONB,

    CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentJobAlert" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "jobListingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentJobAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobAlertSubscription_userId_idx" ON "JobAlertSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JobAlertSubscription_userId_titleQuery_key" ON "JobAlertSubscription"("userId", "titleQuery");

-- CreateIndex
CREATE UNIQUE INDEX "JobListing_url_key" ON "JobListing"("url");

-- CreateIndex
CREATE UNIQUE INDEX "SentJobAlert_subscriptionId_jobListingId_key" ON "SentJobAlert"("subscriptionId", "jobListingId");

-- CreateIndex
CREATE INDEX "SentJobAlert_userId_idx" ON "SentJobAlert"("userId");

-- AddForeignKey
ALTER TABLE "JobAlertSubscription" ADD CONSTRAINT "JobAlertSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentJobAlert" ADD CONSTRAINT "SentJobAlert_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "JobAlertSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentJobAlert" ADD CONSTRAINT "SentJobAlert_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentJobAlert" ADD CONSTRAINT "SentJobAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

