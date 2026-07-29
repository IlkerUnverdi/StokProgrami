import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddCompatibilityDto } from './dto/add-compatibility.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AddOemCodeDto } from './dto/add-oem-code.dto';
import { AddReferenceCodeDto } from './dto/add-reference-code.dto';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles('Admin', 'Mudur')
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
  @Roles('Admin', 'Mudur')
  @UseGuards(JwtGuard, RolesGuard)
  @Post(':id/oem-codes')
  addOemCode(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddOemCodeDto,
  ) {
    return this.productsService.addOemCode(id, dto);
  }

  @Roles('Admin', 'Mudur')
  @UseGuards(JwtGuard, RolesGuard)
  @Post(':id/reference-codes')
  addReferenceCode(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddReferenceCodeDto,
  ) {
    return this.productsService.addReferenceCode(id, dto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('search')
  searchIdentifiers(@Query('q') q: string) {
    return this.productsService.searchIdentifiers(q);
  }

  @Get('search/list')
  searchList(@Query('q') q?: string) {
    return this.productsService.searchList(q);
  }

  @Get(':id/purchase-history')
  getPurchaseHistory(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getPurchaseHistory(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Roles('Admin', 'Mudur')
  @UseGuards(JwtGuard, RolesGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Roles('Admin', 'Mudur')
  @UseGuards(JwtGuard, RolesGuard)
  @Post(':id/compatibilities')
  addCompatibility(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddCompatibilityDto,
  ) {
    return this.productsService.addCompatibility(id, dto);
  }
  @Roles('Admin', 'Mudur')
  @UseGuards(JwtGuard, RolesGuard)
  @Patch(':id/oem-codes/:oemCodeId')
  updateOemCode(
    @Param('id', ParseIntPipe) id: number,
    @Param('oemCodeId', ParseIntPipe) oemCodeId: number,
    @Body() dto: { code: string },
  ) {
    return this.productsService.updateOemCode(id, oemCodeId, dto);
  }

  @Roles('Admin', 'Mudur')
  @UseGuards(JwtGuard, RolesGuard)
  @Delete(':id/oem-codes/:oemCodeId')
  deleteOemCode(
    @Param('id', ParseIntPipe) id: number,
    @Param('oemCodeId', ParseIntPipe) oemCodeId: number,
  ) {
    return this.productsService.deleteOemCode(id, oemCodeId);
  }

  @Roles('Admin', 'Mudur')
  @UseGuards(JwtGuard, RolesGuard)
  @Patch(':id/reference-codes/:referenceCodeId')
  updateReferenceCode(
    @Param('id', ParseIntPipe) id: number,
    @Param('referenceCodeId', ParseIntPipe) referenceCodeId: number,
    @Body() dto: { code: string },
  ) {
    return this.productsService.updateReferenceCode(id, referenceCodeId, dto);
  }

  @Roles('Admin', 'Mudur')
  @UseGuards(JwtGuard, RolesGuard)
  @Delete(':id/reference-codes/:referenceCodeId')
  deleteReferenceCode(
    @Param('id', ParseIntPipe) id: number,
    @Param('referenceCodeId', ParseIntPipe) referenceCodeId: number,
  ) {
    return this.productsService.deleteReferenceCode(id, referenceCodeId);
  }

  @Roles('Admin', 'Mudur')
  @UseGuards(JwtGuard, RolesGuard)
  @Delete(':id/compatibilities/:compatibilityId')
  deleteCompatibility(
    @Param('id', ParseIntPipe) id: number,
    @Param('compatibilityId', ParseIntPipe) compatibilityId: number,
  ) {
    return this.productsService.deleteCompatibility(id, compatibilityId);
  }
}
