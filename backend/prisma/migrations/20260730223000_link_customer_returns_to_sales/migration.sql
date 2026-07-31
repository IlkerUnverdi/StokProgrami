-- AlterTable
ALTER TABLE "Return"
ADD COLUMN "sourceSaleId" INTEGER;

-- CreateIndex
CREATE INDEX "Return_sourceSaleId_idx"
ON "Return"("sourceSaleId");

-- AddForeignKey
ALTER TABLE "Return"
ADD CONSTRAINT "Return_sourceSaleId_fkey"
FOREIGN KEY ("sourceSaleId") REFERENCES "Sale"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
