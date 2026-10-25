-- Owner approved 15 EUR, 15 copies and edition Maktaba Malikiyya on 25 October 2026.
-- Move only the Akhdari draft; never reset an existing product or any commerce data.
INSERT INTO "Product" ("id","slug","titleFr","titleAr","category","categoryId","imagePath","priceCents","stockOnHand","active","updatedAt")
SELECT "id","slug","titleFr","titleAr",'fiqh',"categoryId","imagePath",1500,15,true,now()
FROM "CatalogDraft" WHERE "id"='mukhtasar-al-akhdari'
ON CONFLICT ("id") DO NOTHING;
DELETE FROM "CatalogDraft" d WHERE d."id"='mukhtasar-al-akhdari'
AND EXISTS (SELECT 1 FROM "Product" p WHERE p."id"=d."id" AND p."slug"=d."slug" AND p."active"=true);
