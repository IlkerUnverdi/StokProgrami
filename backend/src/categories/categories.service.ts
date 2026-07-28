import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      include: {
        categoryGroup: true,
      },
      orderBy: [{ categoryGroup: { name: 'asc' } }, { name: 'asc' }],
    });
  }


  findGroups() {
    return this.prisma.categoryGroup.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createGroup(data: { name?: string }) {
    const name = data.name?.trim();

    if (!name) {
      throw new BadRequestException('Kategori grubu adı zorunludur.');
    }

    const existing = await this.prisma.categoryGroup.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Bu kategori grubu zaten kayıtlı.');
    }

    return this.prisma.categoryGroup.create({
      data: { name },
    });
  }

  async updateGroup(id: number, data: { name?: string }) {
    const name = data.name?.trim();

    if (!name) {
      throw new BadRequestException('Kategori grubu adı zorunludur.');
    }

    const group = await this.prisma.categoryGroup.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Kategori grubu bulunamadı.');
    }

    const existing = await this.prisma.categoryGroup.findFirst({
      where: {
        id: { not: id },
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Bu kategori grubu zaten kayıtlı.');
    }

    return this.prisma.categoryGroup.update({
      where: { id },
      data: { name },
    });
  }

  async deleteGroup(id: number) {
    const group = await this.prisma.categoryGroup.findUnique({
      where: { id },
      include: { categories: true },
    });

    if (!group) {
      throw new NotFoundException('Kategori grubu bulunamadı.');
    }

    if (group.categories.length > 0) {
      throw new BadRequestException(
        'Bu kategori grubuna bağlı alt kategoriler var. Önce alt kategorileri taşıyın veya silin.',
      );
    }

    return this.prisma.categoryGroup.delete({
      where: { id },
    });
  }

  async createCategory(data: { name?: string; categoryGroupId?: number }) {
    const name = data.name?.trim();
    const categoryGroupId = Number(data.categoryGroupId);

    if (!name) {
      throw new BadRequestException('Alt kategori adı zorunludur.');
    }

    if (!categoryGroupId) {
      throw new BadRequestException('Kategori grubu seçilmelidir.');
    }

    const group = await this.prisma.categoryGroup.findUnique({
      where: { id: categoryGroupId },
    });

    if (!group) {
      throw new NotFoundException('Kategori grubu bulunamadı.');
    }

    const existing = await this.prisma.category.findFirst({
      where: {
        categoryGroupId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Bu alt kategori seçilen grup altında zaten kayıtlı.');
    }

    return this.prisma.category.create({
      data: {
        name,
        categoryGroupId,
      },
      include: { categoryGroup: true },
    });
  }

  async updateCategory(
    id: number,
    data: { name?: string; categoryGroupId?: number },
  ) {
    const name = data.name?.trim();
    const categoryGroupId = Number(data.categoryGroupId);

    if (!name) {
      throw new BadRequestException('Alt kategori adı zorunludur.');
    }

    if (!categoryGroupId) {
      throw new BadRequestException('Kategori grubu seçilmelidir.');
    }

    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Alt kategori bulunamadı.');
    }

    const group = await this.prisma.categoryGroup.findUnique({
      where: { id: categoryGroupId },
    });

    if (!group) {
      throw new NotFoundException('Kategori grubu bulunamadı.');
    }

    const existing = await this.prisma.category.findFirst({
      where: {
        id: { not: id },
        categoryGroupId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Bu alt kategori seçilen grup altında zaten kayıtlı.');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name,
        categoryGroupId,
      },
      include: { categoryGroup: true },
    });
  }

  async deleteCategory(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) {
      throw new NotFoundException('Alt kategori bulunamadı.');
    }

    if (category.products.length > 0) {
      throw new BadRequestException(
        'Bu alt kategoriye bağlı ürünler var. Ürünleri başka kategoriye taşımeden silinemez.',
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}