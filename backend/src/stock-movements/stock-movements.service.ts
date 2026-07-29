import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStockMovementDto, userId = 1) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: dto.productId,
      },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Ürün bulunamadı veya pasif');
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException('Adet 0 veya negatif olamaz.');
    }

    if (dto.type === 'IN') {
      if (!dto.supplierId) {
        throw new BadRequestException(
          'Stok girişi için tedarikçi seçilmelidir.',
        );
      }

      const supplierId = dto.supplierId;

      const supplier = await this.prisma.currentAccount.findUnique({
        where: {
          id: supplierId,
        },
      });

      if (!supplier || supplier.type !== 'SUPPLIER' || !supplier.isActive) {
        throw new BadRequestException(
          'Geçerli bir aktif tedarikçi seçilmelidir.',
        );
      }

      if (!dto.unitCost || Number(dto.unitCost) <= 0) {
        throw new BadRequestException(
          'Stok girişi için birim alış fiyatı zorunludur.',
        );
      }

      const unitCost = Number(dto.unitCost);
      const lineTotal = unitCost * dto.quantity;

      return this.prisma.$transaction(async (tx) => {
        const counter = await tx.documentCounter.upsert({
          where: {
            key: 'PURCHASE',
          },
          create: {
            key: 'PURCHASE',
            value: 1,
          },
          update: {
            value: {
              increment: 1,
            },
          },
        });

        const purchaseNo = `ALS-${String(counter.value).padStart(6, '0')}`;

        const purchase = await tx.purchase.create({
          data: {
            purchaseNo,
            currentAccountId: supplierId,
            userId,
            paymentType: 'ON_ACCOUNT',
            subtotal: lineTotal,
            discountTotal: 0,
            grandTotal: lineTotal,
            note: [
              dto.reference ? `Referans: ${dto.reference}` : null,
              dto.note || null,
            ]
              .filter(Boolean)
              .join(' | '),
          },
        });

        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: dto.productId,
            quantity: dto.quantity,
            unitPrice: unitCost,
            discount: 0,
            lineTotal,
          },
        });

        await tx.currentAccountMovement.create({
          data: {
            currentAccountId: supplierId,
            userId,
            purchaseId: purchase.id,
            type: 'DEBT',
            amount: lineTotal,
            paymentMethod: 'ON_ACCOUNT',
            note: [
              `Alış kaydı - ${purchase.purchaseNo}`,
              `Ürün: ${product.name}`,
              `Adet: ${dto.quantity}`,
              `Birim alış: ${unitCost}`,
              dto.reference ? `Referans: ${dto.reference}` : null,
              dto.note || null,
            ]
              .filter(Boolean)
              .join(' | '),
          },
        });

        await tx.productStock.upsert({
          where: {
            productId: dto.productId,
          },
          create: {
            productId: dto.productId,
            quantity: dto.quantity,
          },
          update: {
            quantity: {
              increment: dto.quantity,
            },
          },
        });

        return tx.stockMovement.create({
          data: {
            productId: dto.productId,
            userId,
            supplierId,
            type: 'IN',
            quantity: dto.quantity,
            note: [
              `Alış girişi - ${purchase.purchaseNo}`,
              `Tedarikçi: ${supplier.name}`,
              `Alış No: ${purchase.purchaseNo}`,
              dto.reference ? `Referans: ${dto.reference}` : null,
              `Birim alış: ${dto.unitCost}`,
              dto.note || null,
            ]
              .filter(Boolean)
              .join(' | '),
          },
          include: {
            product: {
              include: {
                partBrand: true,
                oemCodes: true,
                referenceCodes: true,
              },
            },
            user: true,
            supplier: true,
          },
        });
      });
    }

    if (dto.type === 'OUT') {
      return this.prisma.$transaction(async (tx) => {
        const stockUpdate = await tx.productStock.updateMany({
          where: {
            productId: dto.productId,
            quantity: {
              gte: dto.quantity,
            },
          },
          data: {
            quantity: {
              decrement: dto.quantity,
            },
          },
        });

        if (stockUpdate.count === 0) {
          const currentStock = await tx.productStock.findUnique({
            where: {
              productId: dto.productId,
            },
          });

          throw new BadRequestException(
            `Yetersiz stok. ProductId=${dto.productId}, mevcut=${currentStock?.quantity ?? 0}, istenen=${dto.quantity}`,
          );
        }

        return tx.stockMovement.create({
          data: {
            productId: dto.productId,
            userId,
            type: 'OUT',
            quantity: dto.quantity,
            note: [
              dto.reference ? `Referans: ${dto.reference}` : null,
              dto.note || null,
            ]
              .filter(Boolean)
              .join(' | '),
          },
          include: {
            product: {
              include: {
                partBrand: true,
                oemCodes: true,
                referenceCodes: true,
              },
            },
            user: true,
          },
        });
      });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.productStock.upsert({
        where: {
          productId: dto.productId,
        },
        create: {
          productId: dto.productId,
          quantity: dto.quantity,
        },
        update: {
          quantity: {
            increment: dto.quantity,
          },
        },
      });

      return tx.stockMovement.create({
        data: {
          productId: dto.productId,
          userId,
          type: dto.type,
          quantity: dto.quantity,
          note: [
            dto.reference ? `Referans: ${dto.reference}` : null,
            dto.note || null,
          ]
            .filter(Boolean)
            .join(' | '),
        },
        include: {
          product: {
            include: {
              partBrand: true,
              oemCodes: true,
              referenceCodes: true,
            },
          },
          user: true,
          supplier: true,
        },
      });
    });
  }

  findAll() {
    return this.prisma.stockMovement.findMany({
      include: {
        product: {
          include: {
            partBrand: true,
            oemCodes: true,
            referenceCodes: true,
          },
        },
        user: true,
        supplier: true,
      },
      orderBy: { id: 'desc' },
    });
  }
}
