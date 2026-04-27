-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "website" TEXT,
    "entityType" TEXT NOT NULL,
    "appDomain" TEXT NOT NULL,
    "capacity" INTEGER,
    "recycleRate" REAL,
    "province" TEXT,
    "city" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CrawlSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'p2',
    "lang" TEXT NOT NULL DEFAULT 'zh',
    "contentType" TEXT NOT NULL DEFAULT 'news',
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastCrawledAt" DATETIME,
    "crawlCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Intelligence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "titleZh" TEXT,
    "titleEn" TEXT,
    "summaryZh" TEXT,
    "summaryEn" TEXT,
    "category" TEXT NOT NULL,
    "pillars" TEXT,
    "countryCode" TEXT,
    "importance" INTEGER NOT NULL DEFAULT 3,
    "translateStatus" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT,
    "sourceUrl" TEXT,
    "crawlSourceId" TEXT,
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Intelligence_crawlSourceId_fkey" FOREIGN KEY ("crawlSourceId") REFERENCES "CrawlSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntelligenceCompany" (
    "intelligenceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "relevanceScore" REAL NOT NULL DEFAULT 0.5,

    PRIMARY KEY ("intelligenceId", "companyId"),
    CONSTRAINT "IntelligenceCompany_intelligenceId_fkey" FOREIGN KEY ("intelligenceId") REFERENCES "Intelligence" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntelligenceCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "interests" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ServiceReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "author" TEXT,
    "pages" INTEGER,
    "isPremium" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ServiceEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "capacity" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'open',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ServiceApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "type" TEXT NOT NULL,
    "eventId" TEXT,
    "metadata" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceApplication_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ServiceEvent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_News" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "source" TEXT,
    "sourceUrl" TEXT,
    "author" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'published',
    "dataSource" TEXT NOT NULL DEFAULT 'manual',
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_News" ("author", "content", "coverImage", "createdAt", "id", "isPublished", "publishedAt", "source", "sourceUrl", "summary", "title", "updatedAt", "viewCount") SELECT "author", "content", "coverImage", "createdAt", "id", "isPublished", "publishedAt", "source", "sourceUrl", "summary", "title", "updatedAt", "viewCount" FROM "News";
DROP TABLE "News";
ALTER TABLE "new_News" RENAME TO "News";
CREATE INDEX "News_publishedAt_idx" ON "News"("publishedAt");
CREATE INDEX "News_viewCount_idx" ON "News"("viewCount");
CREATE INDEX "News_isPublished_idx" ON "News"("isPublished");
CREATE INDEX "News_status_idx" ON "News"("status");
CREATE INDEX "News_dataSource_idx" ON "News"("dataSource");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_entityType_idx" ON "Company"("entityType");

-- CreateIndex
CREATE INDEX "Company_appDomain_idx" ON "Company"("appDomain");

-- CreateIndex
CREATE INDEX "Company_province_idx" ON "Company"("province");

-- CreateIndex
CREATE UNIQUE INDEX "CrawlSource_name_key" ON "CrawlSource"("name");

-- CreateIndex
CREATE INDEX "CrawlSource_priority_idx" ON "CrawlSource"("priority");

-- CreateIndex
CREATE INDEX "CrawlSource_status_idx" ON "CrawlSource"("status");

-- CreateIndex
CREATE INDEX "CrawlSource_lang_idx" ON "CrawlSource"("lang");

-- CreateIndex
CREATE INDEX "Intelligence_publishedAt_idx" ON "Intelligence"("publishedAt");

-- CreateIndex
CREATE INDEX "Intelligence_category_idx" ON "Intelligence"("category");

-- CreateIndex
CREATE INDEX "Intelligence_isHot_idx" ON "Intelligence"("isHot");

-- CreateIndex
CREATE INDEX "Intelligence_pillars_idx" ON "Intelligence"("pillars");

-- CreateIndex
CREATE INDEX "Intelligence_countryCode_idx" ON "Intelligence"("countryCode");

-- CreateIndex
CREATE INDEX "Intelligence_importance_idx" ON "Intelligence"("importance");

-- CreateIndex
CREATE INDEX "Intelligence_translateStatus_idx" ON "Intelligence"("translateStatus");

-- CreateIndex
CREATE INDEX "IntelligenceCompany_companyId_idx" ON "IntelligenceCompany"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_phone_key" ON "Subscriber"("phone");

-- CreateIndex
CREATE INDEX "Subscriber_email_idx" ON "Subscriber"("email");

-- CreateIndex
CREATE INDEX "Subscriber_channel_idx" ON "Subscriber"("channel");

-- CreateIndex
CREATE INDEX "ServiceReport_category_idx" ON "ServiceReport"("category");

-- CreateIndex
CREATE INDEX "ServiceReport_isPremium_idx" ON "ServiceReport"("isPremium");

-- CreateIndex
CREATE INDEX "ServiceEvent_startDate_idx" ON "ServiceEvent"("startDate");

-- CreateIndex
CREATE INDEX "ServiceEvent_status_idx" ON "ServiceEvent"("status");

-- CreateIndex
CREATE INDEX "ServiceApplication_type_idx" ON "ServiceApplication"("type");

-- CreateIndex
CREATE INDEX "ServiceApplication_email_idx" ON "ServiceApplication"("email");

-- CreateIndex
CREATE INDEX "ServiceApplication_status_idx" ON "ServiceApplication"("status");

-- CreateIndex
CREATE INDEX "ServiceApplication_eventId_idx" ON "ServiceApplication"("eventId");

-- CreateIndex
CREATE INDEX "Tag_category_idx" ON "Tag"("category");
