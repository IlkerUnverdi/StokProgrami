-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "CurrentAccountMovementType" ADD VALUE 'CREDIT';

-- AlterTable
ALTER TABLE "ProductStock"
ADD COLUMN "returnPendingQuantity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Return"
ADD COLUMN "status" "ReturnStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "completedAt" TIMESTAMP(3);

-- Existing returns were completed immediately by the previous workflow.
UPDATE "Return"
SET
  "status" = 'COMPLETED',
  "completedAt" = "createdAt";

-- AlterTable
ALTER TABLE "ReturnItem"
ADD COLUMN "lineTotal" DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CurrentAccountMovement"
ADD COLUMN "returnId" INTEGER;

-- CreateIndex
CREATE INDEX "CurrentAccountMovement_returnId_idx"
ON "CurrentAccountMovement"("returnId");

-- AddForeignKey
ALTER TABLE "CurrentAccountMovement"
ADD CONSTRAINT "CurrentAccountMovement_returnId_fkey"
FOREIGN KEY ("returnId") REFERENCES "Return"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
