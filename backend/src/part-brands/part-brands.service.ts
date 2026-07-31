import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartBrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const brands = await this.prisma.partBrand.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return brands.map(({ _count, ...brand }) => ({
      ...brand,
      productCount: _count.products,
    }));
  }

  async create(data: { name?: string }) {
    const name = data.name?.trim();

    if (!name) {
      throw new BadRequestException('Marka adı zorunludur.');
    }

    const existing = await this.prisma.partBrand.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Bu marka zaten kayıtlı.');
    }

    return this.prisma.partBrand.create({
      data: { name },
    });
  }

  async update(id: number, data: { name?: string }) {
    const name = data.name?.trim();

    if (!name) {
      throw new BadRequestException('Marka adı zorunludur.');
    }

    const brand = await this.prisma.partBrand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Marka bulunamadı.');
    }

    const existing = await this.prisma.partBrand.findFirst({
      where: {
        id: { not: id },
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Bu marka zaten kayıtlı.');
    }

    return this.prisma.partBrand.update({
      where: { id },
      data: { name },
    });
  }

  async remove(id: number) {
    const brand = await this.prisma.partBrand.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Marka bulunamadı.');
    }

    if (brand._count.products > 0) {
      throw new BadRequestException(
        'Bu markaya bağlı ürünler var. Ürünleri başka markaya taşımadan silinemez.',
      );
    }

    return this.prisma.partBrand.delete({
      where: { id },
    });
  }
}
