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
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

type AuthenticatedRequest = {
  user: {
    sub: number;
  };
};

@UseGuards(JwtGuard)
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Roles('Admin', 'Mudur', 'Depo', 'Kasa')
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateReturnDto) {
    return this.returnsService.create(req.user.sub, dto);
  }

  @Get()
  findAll() {
    return this.returnsService.findAll();
  }

  @Roles('Admin', 'Mudur', 'Depo', 'Kasa')
  @UseGuards(JwtGuard, RolesGuard)
  @Post(':id/complete')
  complete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.returnsService.complete(id, req.user.sub);
  }

  @Roles('Admin', 'Mudur', 'Depo', 'Kasa')
  @UseGuards(JwtGuard, RolesGuard)
  @Post(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.returnsService.cancel(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.returnsService.findOne(id);
  }
}
