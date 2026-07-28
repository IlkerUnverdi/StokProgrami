import { Module } from '@nestjs/common';
import { VehicleVariantsController } from './vehicle-variants.controller';
import { VehicleVariantsService } from './vehicle-variants.service';

@Module({
  controllers: [VehicleVariantsController],
  providers: [VehicleVariantsService],
})
export class VehicleVariantsModule {}