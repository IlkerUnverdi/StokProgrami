import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Roles('Admin', 'Mudur', 'Depo')
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreatePurchaseDto) {
    return this.purchasesService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Query('currentAccountId') currentAccountId?: string) {
    if (!currentAccountId) {
      return this.purchasesService.findAll();
    }

    const parsedCurrentAccountId = Number(currentAccountId);

    if (
      !Number.isInteger(parsedCurrentAccountId) ||
      parsedCurrentAccountId <= 0
    ) {
      throw new BadRequestException(
        'Geçerli bir cari hesap ID değeri girilmelidir.',
      );
    }

    return this.purchasesService.findAll(parsedCurrentAccountId);
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchasesService.findOne(id);
  }
}
