/*
  Warnings:

  - A unique constraint covering the columns `[vehicleBrandId,modelName,engine,fuel,yearStart]` on the table `VehicleVariant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "VehicleVariant_vehicleBrandId_modelName_engine_key";

-- CreateIndex
CREATE UNIQUE INDEX "VehicleVariant_vehicleBrandId_modelName_engine_fuel_yearSta_key" ON "VehicleVariant"("vehicleBrandId", "modelName", "engine", "fuel", "yearStart");
