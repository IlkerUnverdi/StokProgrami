/*
  Warnings:

  - You are about to drop the column `discountTotal` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `PurchaseItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "discountTotal";

-- AlterTable
ALTER TABLE "PurchaseItem" DROP COLUMN "discount";
