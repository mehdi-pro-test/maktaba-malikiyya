-- Preserve the unique owner slot while permitting normal accounts without a slot.
-- Existing owner remains slot 1; no commerce/quiz data is changed.
ALTER TABLE "User" ALTER COLUMN "ownerSlot" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "ownerSlot" DROP DEFAULT;
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "User" ADD COLUMN "displayUsername" TEXT;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
ALTER TABLE "User" ADD CONSTRAINT "User_username_format" CHECK ("username" IS NULL OR ("username" ~ '^[a-z0-9_]{3,30}$' AND "ownerSlot" IS NULL));
