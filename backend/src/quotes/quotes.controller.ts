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

@UseGuards(JwtGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @UseGuards(JwtGuard, new RolesGuard(['Admin', 'Mudur', 'SatisElemani']))
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

  @UseGuards(JwtGuard, new RolesGuard(['Admin', 'Mudur']))
  @Post('expire/run')
  markExpiredQuotes() {
    return this.quotesService.markExpiredQuotes();
  }
  @UseGuards(JwtGuard, new RolesGuard(['Admin', 'Mudur', 'SatisElemani']))
  @Post(':id/convert-to-sale')
  convertToSale(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.quotesService.convertToSale(id, req.user.sub);
  }
}
