-- Additive V1.1 expansion. Existing product identifiers, prices, stock and commerce tables remain intact.
CREATE TABLE "Category" (
 "id" TEXT PRIMARY KEY,
 "slug" TEXT NOT NULL UNIQUE,
 "nameFr" TEXT NOT NULL,
 "parentId" TEXT REFERENCES "Category"("id") ON DELETE RESTRICT,
 "sortOrder" INTEGER NOT NULL DEFAULT 0,
 "active" BOOLEAN NOT NULL DEFAULT true,
 CONSTRAINT "Category_not_own_parent" CHECK ("parentId" IS NULL OR "parentId" <> "id")
);
INSERT INTO "Category" ("id","slug","nameFr","parentId","sortOrder") VALUES
 ('livres','livres','Livres',NULL,0),
 ('coran','coran','Coran','livres',1),
 ('hadith','hadith','Hadith','livres',2),
 ('fiqh','fiqh','Fiqh','livres',3);
ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT REFERENCES "Category"("id") ON DELETE RESTRICT;
UPDATE "Product" p SET "categoryId" = c."id" FROM "Category" c WHERE c."slug"=p."category" AND c."parentId"='livres' AND p."categoryId" IS NULL;
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE TABLE "CatalogDraft" (
 "id" TEXT PRIMARY KEY,
 "slug" TEXT NOT NULL UNIQUE,
 "titleFr" TEXT NOT NULL,
 "titleAr" TEXT NOT NULL,
 "categoryId" TEXT NOT NULL REFERENCES "Category"("id") ON DELETE RESTRICT,
 "imagePath" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'DRAFT',
 "priceCents" INTEGER,
 "stockOnHand" INTEGER,
 CONSTRAINT "CatalogDraft_unpriced" CHECK ("status"='DRAFT' AND "priceCents" IS NULL AND "stockOnHand" IS NULL)
);
INSERT INTO "CatalogDraft" ("id","slug","titleFr","titleAr","categoryId","imagePath") VALUES
 ('mukhtasar-al-akhdari','mukhtasar-al-akhdari','Mukhtasar al-Akhdari','مختصر الأخضري','fiqh','/images/akhdari.svg');
