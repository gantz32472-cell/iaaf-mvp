-- Initial MVP schema for IAAF
CREATE TYPE "OfferCategory" AS ENUM ('internet', 'server', 'other');
CREATE TYPE "OfferStatus" AS ENUM ('active', 'paused', 'ended');
CREATE TYPE "PostFormat" AS ENUM ('carousel', 'reel');
CREATE TYPE "GeneratedPostStatus" AS ENUM ('draft', 'scheduled', 'posted', 'failed');
CREATE TYPE "DmMatchType" AS ENUM ('partial', 'exact');
CREATE TYPE "ConversionSource" AS ENUM ('manual', 'csv');

CREATE TABLE "Offer" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" "OfferCategory" NOT NULL,
  "aspName" TEXT NOT NULL,
  "destinationUrl" TEXT NOT NULL,
  "referenceUrl" TEXT,
  "targetPersona" TEXT,
  "angles" JSONB NOT NULL,
  "prLabelRequired" BOOLEAN NOT NULL,
  "ngWords" JSONB NOT NULL,
  "status" "OfferStatus" NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "GeneratedPost" (
  "id" TEXT PRIMARY KEY,
  "offerIds" JSONB NOT NULL,
  "category" TEXT NOT NULL,
  "format" "PostFormat" NOT NULL,
  "hookText" TEXT NOT NULL,
  "scriptText" TEXT NOT NULL,
  "captionText" TEXT NOT NULL,
  "hashtags" JSONB NOT NULL,
  "ctaKeyword" TEXT NOT NULL,
  "prNotationText" TEXT,
  "mediaAssetPath" TEXT,
  "status" "GeneratedPostStatus" NOT NULL DEFAULT 'draft',
  "scheduledAt" TIMESTAMP(3),
  "postedAt" TIMESTAMP(3),
  "instagramMediaId" TEXT,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "DmRule" (
  "id" TEXT PRIMARY KEY,
  "keyword" TEXT NOT NULL,
  "matchType" "DmMatchType" NOT NULL,
  "reply1" TEXT NOT NULL,
  "reply2" TEXT,
  "delayMinutesForReply2" INTEGER,
  "targetUrl" TEXT NOT NULL,
  "cooldownHours" INTEGER NOT NULL DEFAULT 24,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "DmConversation" (
  "id" TEXT PRIMARY KEY,
  "instagramUserIdHash" TEXT NOT NULL,
  "messageText" TEXT NOT NULL,
  "matchedKeyword" TEXT,
  "ruleId" TEXT,
  "replied" BOOLEAN NOT NULL DEFAULT FALSE,
  "generatedPostId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ClickEvent" (
  "id" TEXT PRIMARY KEY,
  "shortCode" TEXT NOT NULL,
  "generatedPostId" TEXT,
  "offerId" TEXT,
  "keyword" TEXT,
  "utmSource" TEXT,
  "utmCampaign" TEXT,
  "userAgent" TEXT,
  "ipHash" TEXT,
  "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ShortLink" (
  "shortCode" TEXT PRIMARY KEY,
  "targetUrl" TEXT NOT NULL,
  "generatedPostId" TEXT,
  "offerId" TEXT,
  "keyword" TEXT,
  "utmSource" TEXT,
  "utmMedium" TEXT,
  "utmCampaign" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ConversionReport" (
  "id" TEXT PRIMARY KEY,
  "date" DATE NOT NULL,
  "offerId" TEXT NOT NULL,
  "cvCount" INTEGER NOT NULL,
  "approvedCount" INTEGER NOT NULL,
  "revenueAmount" INTEGER NOT NULL,
  "source" "ConversionSource" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "DmConversation"
ADD CONSTRAINT "DmConversation_ruleId_fkey"
FOREIGN KEY ("ruleId") REFERENCES "DmRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ConversionReport"
ADD CONSTRAINT "ConversionReport_offerId_fkey"
FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
