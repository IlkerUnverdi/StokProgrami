import { Controller, Get, UseGuards } from '@nestjs/common';
import { PartBrandsService } from './part-brands.service';
import { JwtGuard } from '../auth/jwt.guard';

@UseGuards(JwtGuard)
@Controller('part-brands')
export class PartBrandsController {
  constructor(private readonly service: PartBrandsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
