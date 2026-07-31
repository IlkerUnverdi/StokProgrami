import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { JwtGuard } from '../auth/jwt.guard';

type AuthenticatedRequest = Request & {
  user: {
    sub: number;
  };
};

@UseGuards(JwtGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateStockMovementDto,
  ) {
    return this.stockMovementsService.create(dto, request.user.sub);
  }

  @Get()
  findAll() {
    return this.stockMovementsService.findAll();
  }
}
