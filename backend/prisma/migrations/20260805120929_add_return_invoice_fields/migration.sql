/*
  Warnings:

  - You are about to drop the column `sourcePurchaseId` on the `Return` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Return" DROP CONSTRAINT "Return_sourcePurchaseId_fkey";

-- DropIndex
DROP INDEX "Return_sourcePurchaseId_idx";

-- AlterTable
ALTER TABLE "Return" DROP COLUMN "sourcePurchaseId",
ADD COLUMN     "returnInvoiceDate" TIMESTAMP(3),
ADD COLUMN     "returnInvoiceFileName" TEXT,
ADD COLUMN     "returnInvoiceFileUrl" TEXT,
ADD COLUMN     "returnInvoiceNo" TEXT;
