import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type VehicleVariantInput = {
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
};

@Injectable()
export class VehicleVariantsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeAndValidateInput(body: VehicleVariantInput) {
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

    if (!Number.isInteger(yearStart) || yearStart <= 0) {
      throw new BadRequestException(
        'Başlangıç yılı pozitif bir tam sayı olmalıdır.',
      );
    }

    if (yearEnd !== null && (!Number.isInteger(yearEnd) || yearEnd <= 0)) {
      throw new BadRequestException(
        'Bitiş yılı pozitif bir tam sayı olmalıdır.',
      );
    }

    if (yearEnd !== null && yearEnd < yearStart) {
      throw new BadRequestException(
        'Bitiş yılı başlangıç yılından küçük olamaz.',
      );
    }

    return {
      brandName,
      modelName,
      engine,
      fuel,
      yearStart,
      yearEnd,
    };
  }

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

  async create(body: VehicleVariantInput) {
    const { brandName, modelName, engine, fuel, yearStart, yearEnd } =
      this.normalizeAndValidateInput(body);

    let brand = await this.prisma.vehicleBrand.findFirst({
      where: {
        name: {
          equals: brandName,
          mode: 'insensitive',
        },
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
        yearStart,
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
        yearStart,
        yearEnd,
      },
      include: {
        vehicleBrand: true,
      },
    });
  }

  async update(id: number, body: VehicleVariantInput) {
    const existing = await this.prisma.vehicleVariant.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Araç varyantı bulunamadı.');
    }

    const { brandName, modelName, engine, fuel, yearStart, yearEnd } =
      this.normalizeAndValidateInput(body);

    let brand = await this.prisma.vehicleBrand.findFirst({
      where: {
        name: {
          equals: brandName,
          mode: 'insensitive',
        },
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
        engine,
        fuel,
        yearStart,
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
        engine,
        fuel,
        yearStart,
        yearEnd,
      },
      include: {
        vehicleBrand: true,
      },
    });
  }

  async remove(id: number) {
    const variant = await this.prisma.vehicleVariant.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            productCompatibilities: true,
          },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Araç varyantı bulunamadı.');
    }

    if (variant._count.productCompatibilities > 0) {
      throw new BadRequestException(
        'Bu araç varyantına bağlı ürünler var. Önce ürünlerin araç uyumluluklarından kaldırın.',
      );
    }

    return this.prisma.vehicleVariant.delete({
      where: { id },
    });
  }
}
