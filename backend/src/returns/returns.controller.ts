import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

type AuthenticatedRequest = {
  user: {
    sub: number;
  };
};

type UploadedReturnInvice = {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
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
  @Roles('Admin', 'Mudur', 'Depo', 'Kasa')
  @UseGuards(JwtGuard, RolesGuard)
  @Post(':id/invoice')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/returns-invoices',
        filename: (_reg, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1_000_000_000,
          )}`;
          const extension = extname(file.originalname).toLowerCase();
          callback(null, `return-${uniqueName}${extension}`);
        },
      }),

      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
      },
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Geçersiz dosya türü. Sadece PDF, JPEG ve PNG dosyalarına izin verilir.',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadInvoice(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file?: UploadedReturnInvice,
  ) {
    if (!file) {
      throw new BadRequestException('Fatura dosyası yüklenmedi.');
    }
    return this.returnsService.attachInvoiceFile(id, file);
  }
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
