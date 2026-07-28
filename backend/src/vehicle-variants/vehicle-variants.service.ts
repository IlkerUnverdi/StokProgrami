import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehicleVariantsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.vehicleVariant.findMany({
      include: {
        vehicleBrand: true,
      },
      orderBy: [
        { vehicleBrand: { name: 'asc' } },
        { modelName: 'asc' },
        { engine: 'asc' },
      ],
    });
  }

  async create(body: {
    brand?: string;
    brandName?: string;
    model?: string;
    modelName?: string;
    engine: string;
    fuel?: string;
    fuelType?: string;
    startYear?: number;
    yearStart?: number;
    endYear?: number | null;
    yearEnd?: number | null;
  }) {
    const brandName = (body.brandName ?? body.brand ?? '').trim();
    const modelName = (body.modelName ?? body.model ?? '').trim();
    const engine = body.engine?.trim();
    const fuel = (body.fuel ?? body.fuelType ?? '').trim();
    const yearStart = body.yearStart ?? body.startYear;
    const yearEnd = body.yearEnd ?? body.endYear ?? null;

    if (!brandName) {
      throw new BadRequestException('Araç markası zorunludur.');
    }

    if (!modelName) {
      throw new BadRequestException('Araç modeli zorunludur.');
    }

    if (!engine) {
      throw new BadRequestException('Motor bilgisi zorunludur.');
    }

    if (!fuel) {
      throw new BadRequestException('Yakıt tipi zorunludur.');
    }

    if (!yearStart) {
      throw new BadRequestException('Başlangıç yılı zorunludur.');
    }

    let brand = await this.prisma.vehicleBrand.findFirst({
      where: {
        name: brandName,
      },
    });

    if (!brand) {
      brand = await this.prisma.vehicleBrand.create({
        data: {
          name: brandName,
        },
      });
    }

    const existing = await this.prisma.vehicleVariant.findFirst({
      where: {
        vehicleBrandId: brand.id,
        modelName,
        engine,
        fuel,
        yearStart: Number(yearStart),
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Bu araç varyantı zaten kayıtlı. Aynı marka, model, motor, yakıt ve başlangıç yılı tekrar eklenemez.',
      );
    }

    return this.prisma.vehicleVariant.create({
      data: {
        vehicleBrandId: brand.id,
        modelName,
        engine,
        fuel,
        yearStart: Number(yearStart),
        yearEnd: yearEnd ? Number(yearEnd) : null,
      },
      include: {
        vehicleBrand: true,
      },
    });
  }

  async update(
    id: number,
    body: {
      brand?: string;
      brandName?: string;
      model?: string;
      modelName?: string;
      engine: string;
      fuel?: string;
      fuelType?: string;
      startYear?: number;
      yearStart?: number;
      endYear?: number | null;
      yearEnd?: number | null;
    },
  ) {
    const existing = await this.prisma.vehicleVariant.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Araç varyantı bulunamadı.');
    }

    const brandName = (body.brandName ?? body.brand ?? '').trim();
    const modelName = (body.modelName ?? body.model ?? '').trim();
    const fuel = (body.fuel ?? body.fuelType ?? '').trim();
    const yearStart = body.yearStart ?? body.startYear;
    const yearEnd = body.yearEnd ?? body.endYear ?? null;

    let brand = await this.prisma.vehicleBrand.findFirst({
      where: {
        name: brandName,
      },
    });

    if (!brand) {
      brand = await this.prisma.vehicleBrand.create({
        data: {
          name: brandName,
        },
      });
    }

    const duplicate = await this.prisma.vehicleVariant.findFirst({
      where: {
        id: {
          not: id,
        },
        vehicleBrandId: brand.id,
        modelName,
        engine: body.engine.trim(),
        fuel,
        yearStart: yearStart ? Number(yearStart) : null,
      },
    });

    if (duplicate) {
      throw new BadRequestException(
        'Bu araç varyantı zaten kayıtlı. Aynı marka, model, motor, yakıt ve başlangıç yılı tekrar kullanılamaz.',
      );
    }

    return this.prisma.vehicleVariant.update({
      where: {
        id,
      },
      data: {
        vehicleBrandId: brand.id,
        modelName,
        engine: body.engine.trim(),
        fuel,
        yearStart: yearStart ? Number(yearStart) : null,
        yearEnd: yearEnd ? Number(yearEnd) : null,
      },
      include: {
        vehicleBrand: true,
      },
    });
  }
}