-- AlterTable
ALTER TABLE "Return" ADD COLUMN     "sourcePurchaseId" INTEGER;

-- CreateIndex
CREATE INDEX "Return_sourcePurchaseId_idx" ON "Return"("sourcePurchaseId");

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_sourcePurchaseId_fkey" FOREIGN KEY ("sourcePurchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
