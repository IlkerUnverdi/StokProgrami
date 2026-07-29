import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddCompatibilityDto } from './dto/add-compatibility.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async addOemCode(
    productId: number,
    dto: { code: string; isPrimary?: boolean },
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    return this.prisma.productOemCode.create({
      data: {
        productId,
        code: dto.code,
        isPrimary: dto.isPrimary ?? false,
      },
    });
  }

  async addReferenceCode(productId: number, dto: { code: string }) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    return this.prisma.productReferenceCode.create({
      data: {
        productId,
        code: dto.code,
      },
    });
  }

  async create(dto: CreateProductDto) {
    try {
      const cleanedOemCodes = (dto.oemCodes ?? [])
        .map((code) => code.trim())
        .filter(
          (code, index, arr) => code.length > 0 && arr.indexOf(code) === index,
        );

      const cleanedReferenceCodes = (dto.referenceCodes ?? [])
        .map((code) => code.trim())
        .filter(
          (code, index, arr) => code.length > 0 && arr.indexOf(code) === index,
        );

      return await this.prisma.product.create({
        data: {
          name: dto.name,
          imageUrl: dto.imageUrl || null,
          barcode: dto.barcode,
          shelfCode: dto.shelfCode,
          lastPurchasePrice: dto.lastPurchasePrice,
          salePrice: dto.salePrice,
          minSalePrice: dto.minSalePrice,
          categoryId: dto.categoryId,
          partBrandId: dto.partBrandId,
          isActive: dto.isActive,

          oemCodes: cleanedOemCodes.length
            ? {
                create: cleanedOemCodes.map((code, index) => ({
                  code,
                  isPrimary: index === 0,
                })),
              }
            : undefined,

          referenceCodes: cleanedReferenceCodes.length
            ? {
                create: cleanedReferenceCodes.map((code) => ({
                  code,
                })),
              }
            : undefined,
        },
        include: {
          category: true,
          partBrand: true,
          oemCodes: true,
          referenceCodes: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Barkod, OEM veya reference kodlarından biri zaten kayıtlı.',
        );
      }

      throw error;
    }
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        partBrand: true,
        oemCodes: true,
        referenceCodes: true,
        vehicleCompatibilities: {
          include: {
            vehicleVariant: {
              include: {
                vehicleBrand: true,
              },
            },
          },
        },
        stock: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return products.map((product) => {
      const { stock, ...productWithoutStock } = product;

      return {
        ...productWithoutStock,
        currentStock: stock?.quantity ?? 0,
      };
    });
  }

  async getPurchaseHistory(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        partBrand: true,
        oemCodes: true,
        referenceCodes: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    const purchaseItems = await this.prisma.purchaseItem.findMany({
      where: { productId },
      include: {
        purchase: {
          include: {
            currentAccount: true,
            user: {
              select: {
                id: true,
                username: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
      take: 20,
    });

    const totalQuantity = purchaseItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const totalAmount = purchaseItems.reduce(
      (sum, item) => sum + Number(item.lineTotal),
      0,
    );

    const lastPurchase = purchaseItems[0] ?? null;

    return {
      product: {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        partBrand: product.partBrand,
        oemCodes: product.oemCodes,
        referenceCodes: product.referenceCodes,
      },
      summary: {
        purchaseCount: purchaseItems.length,
        totalQuantity,
        totalAmount,
        lastPurchasePrice: lastPurchase ? Number(lastPurchase.unitPrice) : null,
        lastPurchaseDate: lastPurchase?.purchase?.createdAt ?? null,
        lastSupplierName: lastPurchase?.purchase?.currentAccount?.name ?? null,
      },
      purchases: purchaseItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        purchase: item.purchase,
      })),
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        partBrand: true,
        oemCodes: true,
        referenceCodes: true,
        stock: {
          select: {
            quantity: true,
          },
        },
        vehicleCompatibilities: {
          include: {
            vehicleVariant: {
              include: {
                vehicleBrand: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    const { stock, ...productWithoutStock } = product;

    return {
      ...productWithoutStock,
      currentStock: stock?.quantity ?? 0,
    };
  }

  async searchIdentifiers(q: string) {
    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { barcode: q },
          {
            oemCodes: {
              some: {
                code: q,
              },
            },
          },
          {
            referenceCodes: {
              some: {
                code: q,
              },
            },
          },
        ],
      },
      include: {
        category: true,
        partBrand: true,
        oemCodes: true,
        referenceCodes: true,
        stock: {
          select: {
            quantity: true,
          },
        },
        vehicleCompatibilities: {
          include: {
            vehicleVariant: {
              include: {
                vehicleBrand: true,
              },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return products.map((product) => {
      const { stock, ...productWithoutStock } = product;

      return {
        ...productWithoutStock,
        currentStock: stock?.quantity ?? 0,
      };
    });
  }

  async searchList(q?: string) {
    const products = await this.prisma.product.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { barcode: { contains: q, mode: 'insensitive' } },
              {
                oemCodes: {
                  some: {
                    code: { contains: q, mode: 'insensitive' },
                  },
                },
              },
              {
                referenceCodes: {
                  some: {
                    code: { contains: q, mode: 'insensitive' },
                  },
                },
              },
            ],
          }
        : undefined,
      include: {
        category: true,
        partBrand: true,
        oemCodes: true,
        referenceCodes: true,
        stock: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return products.map((product) => {
      const { stock, ...productWithoutStock } = product;

      return {
        ...productWithoutStock,
        currentStock: stock?.quantity ?? 0,
      };
    });
  }

  async addCompatibility(productId: number, dto: AddCompatibilityDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    const vehicleVariant = await this.prisma.vehicleVariant.findUnique({
      where: { id: dto.vehicleVariantId },
    });

    if (!vehicleVariant) {
      throw new NotFoundException('Araç varyantı bulunamadı');
    }

    try {
      return await this.prisma.productVehicleCompatibility.create({
        data: {
          productId,
          vehicleVariantId: dto.vehicleVariantId,
        },
        include: {
          vehicleVariant: {
            include: {
              vehicleBrand: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Bu araç uyumluluğu zaten bu ürüne eklenmiş.',
        );
      }

      throw error;
    }
  }

  async updateOemCode(
    productId: number,
    oemCodeId: number,
    dto: { code: string },
  ) {
    const oemCode = await this.prisma.productOemCode.findFirst({
      where: {
        id: oemCodeId,
        productId,
      },
    });

    if (!oemCode) {
      throw new NotFoundException('OEM kodu bulunamadı');
    }

    return this.prisma.productOemCode.update({
      where: { id: oemCodeId },
      data: {
        code: dto.code.trim(),
      },
    });
  }

  async deleteOemCode(productId: number, oemCodeId: number) {
    const oemCount = await this.prisma.productOemCode.count({
      where: { productId },
    });

    if (oemCount <= 1) {
      throw new BadRequestException('En az 1 OEM kodu kalmalı.');
    }

    const oemCode = await this.prisma.productOemCode.findFirst({
      where: {
        id: oemCodeId,
        productId,
      },
    });

    if (!oemCode) {
      throw new NotFoundException('OEM kodu bulunamadı');
    }

    return this.prisma.productOemCode.delete({
      where: { id: oemCodeId },
    });
  }

  async updateReferenceCode(
    productId: number,
    referenceCodeId: number,
    dto: { code: string },
  ) {
    const referenceCode = await this.prisma.productReferenceCode.findFirst({
      where: {
        id: referenceCodeId,
        productId,
      },
    });

    if (!referenceCode) {
      throw new NotFoundException('Reference kodu bulunamadı');
    }

    return this.prisma.productReferenceCode.update({
      where: { id: referenceCodeId },
      data: {
        code: dto.code.trim(),
      },
    });
  }

  async deleteReferenceCode(productId: number, referenceCodeId: number) {
    const referenceCount = await this.prisma.productReferenceCode.count({
      where: { productId },
    });

    if (referenceCount <= 1) {
      throw new BadRequestException('En az 1 reference kodu kalmalı.');
    }

    const referenceCode = await this.prisma.productReferenceCode.findFirst({
      where: {
        id: referenceCodeId,
        productId,
      },
    });

    if (!referenceCode) {
      throw new NotFoundException('Reference kodu bulunamadı');
    }

    return this.prisma.productReferenceCode.delete({
      where: { id: referenceCodeId },
    });
  }

  async deleteCompatibility(productId: number, compatibilityId: number) {
    const compatibility =
      await this.prisma.productVehicleCompatibility.findFirst({
        where: {
          id: compatibilityId,
          productId,
        },
      });

    if (!compatibility) {
      throw new NotFoundException('Araç uyumluluğu bulunamadı');
    }

    return this.prisma.productVehicleCompatibility.delete({
      where: { id: compatibilityId },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data: dto,
        include: {
          category: true,
          partBrand: true,
          oemCodes: true,
          referenceCodes: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Bu barkod zaten başka bir üründe kayıtlı.',
        );
      }

      throw error;
    }
  }
}
