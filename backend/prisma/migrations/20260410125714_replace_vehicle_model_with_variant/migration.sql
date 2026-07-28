/*
  Warnings:

  - You are about to drop the column `vehicleModelId` on the `ProductVehicleCompatibility` table. All the data in the column will be lost.
  - You are about to drop the `VehicleModel` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[productId,vehicleVariantId]` on the table `ProductVehicleCompatibility` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vehicleVariantId` to the `ProductVehicleCompatibility` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductVehicleCompatibility" DROP CONSTRAINT "ProductVehicleCompatibility_vehicleModelId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleModel" DROP CONSTRAINT "VehicleModel_vehicleBrandId_fkey";

-- DropIndex
DROP INDEX "ProductVehicleCompatibility_productId_vehicleModelId_key";

-- DropIndex
DROP INDEX "ProductVehicleCompatibility_vehicleModelId_idx";

-- AlterTable
ALTER TABLE "ProductVehicleCompatibility" DROP COLUMN "vehicleModelId",
ADD COLUMN     "vehicleVariantId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "VehicleModel";

-- CreateTable
CREATE TABLE "VehicleVariant" (
    "id" SERIAL NOT NULL,
    "modelName" TEXT NOT NULL,
    "engine" TEXT NOT NULL,
    "fuel" TEXT,
    "yearStart" INTEGER,
    "yearEnd" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleBrandId" INTEGER NOT NULL,

    CONSTRAINT "VehicleVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VehicleVariant_vehicleBrandId_idx" ON "VehicleVariant"("vehicleBrandId");

-- CreateIndex
CREATE INDEX "VehicleVariant_modelName_idx" ON "VehicleVariant"("modelName");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleVariant_vehicleBrandId_modelName_engine_key" ON "VehicleVariant"("vehicleBrandId", "modelName", "engine");

-- CreateIndex
CREATE INDEX "ProductVehicleCompatibility_vehicleVariantId_idx" ON "ProductVehicleCompatibility"("vehicleVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVehicleCompatibility_productId_vehicleVariantId_key" ON "ProductVehicleCompatibility"("productId", "vehicleVariantId");

-- AddForeignKey
ALTER TABLE "VehicleVariant" ADD CONSTRAINT "VehicleVariant_vehicleBrandId_fkey" FOREIGN KEY ("vehicleBrandId") REFERENCES "VehicleBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVehicleCompatibility" ADD CONSTRAINT "ProductVehicleCompatibility_vehicleVariantId_fkey" FOREIGN KEY ("vehicleVariantId") REFERENCES "VehicleVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
