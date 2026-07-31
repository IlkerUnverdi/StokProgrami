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
import { CategoriesService } from './categories.service';
import { JwtGuard } from '../auth/jwt.guard';

@UseGuards(JwtGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('groups')
  findGroups() {
    return this.service.findGroups();
  }

  @Post('groups')
  createGroup(@Body() body: { name?: string }) {
    return this.service.createGroup(body);
  }

  @Patch('groups/:id')
  updateGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string },
  ) {
    return this.service.updateGroup(id, body);
  }

  @Delete('groups/:id')
  deleteGroup(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteGroup(id);
  }

  @Post()
  createCategory(@Body() body: { name?: string; categoryGroupId?: number }) {
    return this.service.createCategory(body);
  }

  @Patch(':id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; categoryGroupId?: number },
  ) {
    return this.service.updateCategory(id, body);
  }

  @Delete(':id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteCategory(id);
  }
}
