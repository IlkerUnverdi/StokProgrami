import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CurrentAccountsService } from './current-accounts.service';
import { CreateCurrentAccountDto } from './dto/create-current-account.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateCurrentAccountDto } from './dto/update-current-account.dto';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtGuard)
@Controller('current-accounts')
export class CurrentAccountsController {
  constructor(
    private readonly currentAccountsService: CurrentAccountsService,
  ) {}

  @Roles('Admin', 'Mudur')
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  create(@Body() dto: CreateCurrentAccountDto) {
    return this.currentAccountsService.create(dto);
  }

  @Get()
  findAll() {
    return this.currentAccountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.currentAccountsService.findOne(id);
  }

  @Get(':id/balance')
  getBalance(@Param('id', ParseIntPipe) id: number) {
    return this.currentAccountsService.getBalance(id);
  }
  @Roles('Admin', 'Mudur')
  @UseGuards(JwtGuard, RolesGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCurrentAccountDto,
  ) {
    return this.currentAccountsService.update(id, dto);
  }

  @Roles('Admin', 'Mudur', 'Kasa')
  @UseGuards(JwtGuard, RolesGuard)
  @Post(':id/payments')
  createPayment(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.currentAccountsService.createPayment(id, req.user.sub, dto);
  }
}
