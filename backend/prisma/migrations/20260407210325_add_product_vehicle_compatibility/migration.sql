-- CreateTable
CREATE TABLE "ProductVehicleCompatibility" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" INTEGER NOT NULL,
    "vehicleModelId" INTEGER NOT NULL,

    CONSTRAINT "ProductVehicleCompatibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductVehicleCompatibility_productId_idx" ON "ProductVehicleCompatibility"("productId");

-- CreateIndex
CREATE INDEX "ProductVehicleCompatibility_vehicleModelId_idx" ON "ProductVehicleCompatibility"("vehicleModelId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVehicleCompatibility_productId_vehicleModelId_key" ON "ProductVehicleCompatibility"("productId", "vehicleModelId");

-- AddForeignKey
ALTER TABLE "ProductVehicleCompatibility" ADD CONSTRAINT "ProductVehicleCompatibility_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVehicleCompatibility" ADD CONSTRAINT "ProductVehicleCompatibility_vehicleModelId_fkey" FOREIGN KEY ("vehicleModelId") REFERENCES "VehicleModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
