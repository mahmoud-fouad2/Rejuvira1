-- Add structured service categories while keeping Service.categoryKey as a
-- denormalized fallback/display value for existing pages and integrations.
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Service" ADD COLUMN "categoryId" TEXT;

CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");
CREATE INDEX "ServiceCategory_status_idx" ON "ServiceCategory"("status");
CREATE INDEX "ServiceCategory_sortOrder_idx" ON "ServiceCategory"("sortOrder");
CREATE INDEX "Service_categoryId_idx" ON "Service"("categoryId");
CREATE INDEX "Service_categoryKey_idx" ON "Service"("categoryKey");

INSERT INTO "ServiceCategory" (
    "id",
    "slug",
    "nameAr",
    "status",
    "sortOrder",
    "updatedAt"
)
SELECT
    'svc_cat_' || md5("categoryKey"),
    'category-' || left(md5("categoryKey"), 12),
    "categoryKey",
    'PUBLISHED',
    row_number() OVER (ORDER BY min("sortOrder"), "categoryKey")::integer,
    CURRENT_TIMESTAMP
FROM "Service"
WHERE trim("categoryKey") <> ''
GROUP BY "categoryKey";

UPDATE "Service" AS service
SET "categoryId" = category."id"
FROM "ServiceCategory" AS category
WHERE service."categoryKey" = category."nameAr";

ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
