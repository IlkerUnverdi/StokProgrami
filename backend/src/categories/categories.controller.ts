import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
    @Param('id') id: string,
    @Body() body: { name?: string },
  ) {
    return this.service.updateGroup(Number(id), body);
  }

  @Delete('groups/:id')
  deleteGroup(@Param('id') id: string) {
    return this.service.deleteGroup(Number(id));
  }

  @Post()
  createCategory(@Body() body: { name?: string; categoryGroupId?: number }) {
    return this.service.createCategory(body);
  }

  @Patch(':id')
  updateCategory(
    @Param('id') id: string,
    @Body() body: { name?: string; categoryGroupId?: number },
  ) {
    return this.service.updateCategory(Number(id), body);
  }

  @Delete(':id')
  deleteCategory(@Param('id') id: string) {
    return this.service.deleteCategory(Number(id));
  }
}
