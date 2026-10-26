-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "adminStatus" TEXT NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "coverAssetId" TEXT,
ADD COLUMN     "descriptionAr" TEXT,
ADD COLUMN     "descriptionFr" TEXT,
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "carrier" TEXT,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "fulfillmentStatus" TEXT NOT NULL DEFAULT 'UNFULFILLED',
ADD COLUMN     "fulfillmentVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "internalNote" TEXT,
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "trackingNumber" TEXT;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "ownerSlot" INTEGER NOT NULL DEFAULT 1,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwoFactor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "failedVerificationCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),

    CONSTRAINT "TwoFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequest" BIGINT NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminMfaProof" (
    "sessionId" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminMfaProof_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "AdminAuditEvent" (
    "id" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "priorSummary" JSONB,
    "nextSummary" JSONB,
    "reason" TEXT,
    "correlationId" TEXT NOT NULL,

    CONSTRAINT "AdminAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "beforeOnHand" INTEGER NOT NULL,
    "afterOnHand" INTEGER NOT NULL,
    "reservedAtChange" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT NOT NULL,
    "relatedOrderId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "requestDigest" TEXT NOT NULL,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderFulfillmentEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "requestDigest" TEXT NOT NULL,

    CONSTRAINT "OrderFulfillmentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCoverAsset" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "alt" TEXT NOT NULL,
    "usageRightsAttested" BOOLEAN NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCoverAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestionRecord" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "originId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "archivedAt" TIMESTAMP(3),
    "activeRevisionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizQuestionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestionRevision" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "content" JSONB NOT NULL,
    "globalEligible" BOOLEAN NOT NULL DEFAULT false,
    "sourceVerification" TEXT NOT NULL DEFAULT 'NOT_ATTESTED',
    "ownerPublishedAt" TIMESTAMP(3),
    "ownerApprovedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "QuizQuestionRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_ownerSlot_key" ON "User"("ownerSlot");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactor_userId_key" ON "TwoFactor"("userId");

-- CreateIndex
CREATE INDEX "TwoFactor_secret_idx" ON "TwoFactor"("secret");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_key_key" ON "RateLimit"("key");

-- CreateIndex
CREATE INDEX "AdminAuditEvent_occurredAt_idx" ON "AdminAuditEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "AdminAuditEvent_entityType_entityId_idx" ON "AdminAuditEvent"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryMovement_idempotencyKey_key" ON "InventoryMovement"("idempotencyKey");

-- CreateIndex
CREATE INDEX "InventoryMovement_productId_createdAt_idx" ON "InventoryMovement"("productId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrderFulfillmentEvent_idempotencyKey_key" ON "OrderFulfillmentEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "OrderFulfillmentEvent_orderId_createdAt_idx" ON "OrderFulfillmentEvent"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCoverAsset_storageKey_key" ON "ProductCoverAsset"("storageKey");

-- CreateIndex
CREATE INDEX "ProductCoverAsset_productId_createdAt_idx" ON "ProductCoverAsset"("productId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestionRecord_originId_key" ON "QuizQuestionRecord"("originId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestionRecord_activeRevisionId_key" ON "QuizQuestionRecord"("activeRevisionId");

-- CreateIndex
CREATE INDEX "QuizQuestionRecord_bookId_idx" ON "QuizQuestionRecord"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestionRevision_recordId_revision_key" ON "QuizQuestionRevision"("recordId", "revision");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_coverAssetId_fkey" FOREIGN KEY ("coverAssetId") REFERENCES "ProductCoverAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFactor" ADD CONSTRAINT "TwoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminMfaProof" ADD CONSTRAINT "AdminMfaProof_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderFulfillmentEvent" ADD CONSTRAINT "OrderFulfillmentEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCoverAsset" ADD CONSTRAINT "ProductCoverAsset_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionRecord" ADD CONSTRAINT "QuizQuestionRecord_activeRevisionId_fkey" FOREIGN KEY ("activeRevisionId") REFERENCES "QuizQuestionRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionRevision" ADD CONSTRAINT "QuizQuestionRevision_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "QuizQuestionRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Singleton identity and business invariants, additive only.
ALTER TABLE "User" ADD CONSTRAINT "User_owner_singleton" CHECK ("ownerSlot" = 1);
ALTER TABLE "Product" ADD CONSTRAINT "Product_admin_limits" CHECK ("lowStockThreshold" >= 0 AND "version" >= 0 AND "adminStatus" IN ('DRAFT','PUBLISHED','ARCHIVED'));
ALTER TABLE "Order" ADD CONSTRAINT "Order_fulfillment_values" CHECK ("fulfillmentStatus" IN ('UNFULFILLED','PREPARING','SHIPPED','DELIVERED','CANCELLED'));
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_balanced" CHECK ("afterOnHand" = "beforeOnHand" + "delta" AND "afterOnHand" >= "reservedAtChange" AND "reservedAtChange" >= 0);
ALTER TABLE "QuizQuestionRevision" ADD CONSTRAINT "QuizQuestionRevision_status_values" CHECK ("status" IN ('DRAFT','PUBLISHED'));
CREATE FUNCTION "maktaba_admin_append_only"() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Append-only journal'; END $$;
CREATE TRIGGER "AdminAuditEvent_append_only" BEFORE UPDATE OR DELETE ON "AdminAuditEvent" FOR EACH ROW EXECUTE FUNCTION "maktaba_admin_append_only"();
CREATE TRIGGER "InventoryMovement_append_only" BEFORE UPDATE OR DELETE ON "InventoryMovement" FOR EACH ROW EXECUTE FUNCTION "maktaba_admin_append_only"();
CREATE TRIGGER "OrderFulfillmentEvent_append_only" BEFORE UPDATE OR DELETE ON "OrderFulfillmentEvent" FOR EACH ROW EXECUTE FUNCTION "maktaba_admin_append_only"();
