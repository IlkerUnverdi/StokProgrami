-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "barcode" TEXT,
    "shelfCode" TEXT,
    "lastPurchasePrice" DECIMAL(10,2),
    "salePrice" DECIMAL(10,2),
    "minSalePrice" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "partBrandId" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductOemCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ProductOemCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductReferenceCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ProductReferenceCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductEquivalent" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromProductId" INTEGER NOT NULL,
    "toProductId" INTEGER NOT NULL,

    CONSTRAINT "ProductEquivalent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_partBrandId_idx" ON "Product"("partBrandId");

-- CreateIndex
CREATE INDEX "ProductOemCode_code_idx" ON "ProductOemCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOemCode_productId_code_key" ON "ProductOemCode"("productId", "code");

-- CreateIndex
CREATE INDEX "ProductReferenceCode_code_idx" ON "ProductReferenceCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductReferenceCode_productId_code_key" ON "ProductReferenceCode"("productId", "code");

-- CreateIndex
CREATE INDEX "ProductEquivalent_fromProductId_idx" ON "ProductEquivalent"("fromProductId");

-- CreateIndex
CREATE INDEX "ProductEquivalent_toProductId_idx" ON "ProductEquivalent"("toProductId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductEquivalent_fromProductId_toProductId_key" ON "ProductEquivalent"("fromProductId", "toProductId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_partBrandId_fkey" FOREIGN KEY ("partBrandId") REFERENCES "PartBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOemCode" ADD CONSTRAINT "ProductOemCode_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReferenceCode" ADD CONSTRAINT "ProductReferenceCode_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductEquivalent" ADD CONSTRAINT "ProductEquivalent_fromProductId_fkey" FOREIGN KEY ("fromProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductEquivalent" ADD CONSTRAINT "ProductEquivalent_toProductId_fkey" FOREIGN KEY ("toProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
