import { Module } from '@nestjs/common';
import { PartBrandsService } from './part-brands.service';
import { PartBrandsController } from './part-brands.controller';

@Module({
  controllers: [PartBrandsController],
  providers: [PartBrandsService],
})
export class PartBrandsModule {}
