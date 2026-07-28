-- AlterTable
ALTER TABLE "CurrentAccountMovement" ADD COLUMN     "purchaseId" INTEGER;

-- CreateIndex
CREATE INDEX "CurrentAccountMovement_purchaseId_idx" ON "CurrentAccountMovement"("purchaseId");

-- AddForeignKey
ALTER TABLE "CurrentAccountMovement" ADD CONSTRAINT "CurrentAccountMovement_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
