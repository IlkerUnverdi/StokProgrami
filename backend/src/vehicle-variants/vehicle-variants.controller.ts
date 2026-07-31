import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { VehicleVariantsService } from './vehicle-variants.service';
import { JwtGuard } from '../auth/jwt.guard';

@UseGuards(JwtGuard)
@Controller('vehicle-variants')
export class VehicleVariantsController {
  constructor(
    private readonly vehicleVariantsService: VehicleVariantsService,
  ) {}

  @Get()
  findAll() {
    return this.vehicleVariantsService.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      brand?: string;
      brandName?: string;
      model?: string;
      modelName?: string;
      engine: string;
      fuel?: string;
      fuelType?: string;
      startYear?: number;
      yearStart?: number;
      endYear?: number | null;
      yearEnd?: number | null;
    },
  ) {
    return this.vehicleVariantsService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      brand?: string;
      brandName?: string;
      model?: string;
      modelName?: string;
      engine: string;
      fuel?: string;
      fuelType?: string;
      startYear?: number;
      yearStart?: number;
      endYear?: number | null;
      yearEnd?: number | null;
    },
  ) {
    return this.vehicleVariantsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vehicleVariantsService.remove(id);
  }
}
