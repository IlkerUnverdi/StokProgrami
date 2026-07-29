import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Roles('Admin', 'Mudur', 'SatisElemani')
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateQuoteDto) {
    return this.quotesService.create(req.user.sub, dto);
  }

  @Get()
  findAll() {
    return this.quotesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.findOne(id);
  }

  @Roles('Admin', 'Mudur')
  @UseGuards(JwtGuard, RolesGuard)
  @Post('expire/run')
  markExpiredQuotes() {
    return this.quotesService.markExpiredQuotes();
  }
  @Roles('Admin', 'Mudur', 'SatisElemani')
  @UseGuards(JwtGuard, RolesGuard)
  @Post(':id/convert-to-sale')
  convertToSale(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.quotesService.convertToSale(id, req.user.sub);
  }
}
