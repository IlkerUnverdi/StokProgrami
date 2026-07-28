import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  private async generatePurchaseNo() {
    const count = await this.prisma.purchase.count();
    const next = count + 1;
    return `ALS-${String(next).padStart(6, '0')}`;
  }

  async create(userId: number, dto: CreatePurchaseDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Alış kalemi boş olamaz');
    }

    const supplier = await this.prisma.currentAccount.findUnique({
      where: { id: dto.currentAccountId },
    });

    if (!supplier) {
      throw new NotFoundException('Tedarikçi cari bulunamadı');
    }

    if (supplier.type !== 'SUPPLIER') {
      throw new BadRequestException('Alış için cari tipi SUPPLIER olmalı');
    }

    const purchaseNo = await this.generatePurchaseNo();

    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      let discountTotal = 0;

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Ürün bulunamadı: ${item.productId}`);
        }

        const unitPrice = Number(item.unitPrice);
        const discount = Number(item.discount ?? 0);

        subtotal += unitPrice * item.quantity;
        discountTotal += discount;
      }

      const grandTotal = subtotal - discountTotal;

      const purchase = await tx.purchase.create({
        data: {
          purchaseNo,
          paymentType: dto.paymentType,
          subtotal,
          discountTotal,
          grandTotal,
          note: dto.note,
          userId,
          currentAccountId: dto.currentAccountId,
        },
      });

      for (const item of dto.items) {
        const unitPrice = Number(item.unitPrice);
        const discount = Number(item.discount ?? 0);
        const lineTotal = unitPrice * item.quantity - discount;

        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            discount,
            lineTotal,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            userId,
            type: 'IN',
            quantity: item.quantity,
            note: `Alış girişi - ${purchase.purchaseNo}`,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            lastPurchasePrice: unitPrice,
          },
        });
      }

      if (dto.paymentType === 'ON_ACCOUNT') {
        await tx.currentAccountMovement.create({
          data: {
            currentAccountId: dto.currentAccountId,
            userId,
            type: 'DEBT',
            amount: grandTotal,
            note: `Alış borcu - ${purchase.purchaseNo}`,
          },
        });
      }

      return tx.purchase.findUnique({
        where: { id: purchase.id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: { select: { id: true, name: true } },
            },
          },
          currentAccount: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  findAll() {
    return this.prisma.purchase.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: { select: { id: true, name: true } },
          },
        },
        currentAccount: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: { select: { id: true, name: true } },
          },
        },
        currentAccount: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Alış bulunamadı');
    }

    return purchase;
  }
}
