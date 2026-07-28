-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "supplierId" INTEGER;

-- CreateIndex
CREATE INDEX "StockMovement_supplierId_idx" ON "StockMovement"("supplierId");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "CurrentAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
