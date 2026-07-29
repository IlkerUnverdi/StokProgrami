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

  async create(userId: number, dto: CreatePurchaseDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Alış kalemi boş olamaz');
    }

    const supplier = await this.prisma.currentAccount.findUnique({
      where: { id: dto.currentAccountId },
    });

    if (!supplier || !supplier.isActive) {
      throw new NotFoundException(
        'Tedarikçi cari bulunamadı veya pasif',
      );
    }

    if (supplier.type !== 'SUPPLIER') {
      throw new BadRequestException('Alış için cari tipi SUPPLIER olmalı');
    }

    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      let discountTotal = 0;

      const counter = await tx.documentCounter.upsert({
        where: { key: 'PURCHASE' },
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

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw new NotFoundException(
            `Ürün bulunamadı veya pasif: ${item.productId}`,
          );
        }

        const unitPrice = Number(item.unitPrice);
        const discount = Number(item.discount ?? 0);
        const grossLineTotal = unitPrice * item.quantity;

        if (discount > grossLineTotal) {
          throw new BadRequestException(
            `İndirim, satır toplamını geçemez. ProductId=${item.productId}`,
          );
        }

        subtotal += grossLineTotal;
        discountTotal += discount;
      }

      if (discountTotal > subtotal) {
        throw new BadRequestException(
          'Toplam indirim, toplam tutarı geçemez',
        );
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

        await tx.productStock.upsert({
          where: {
            productId: item.productId,
          },
          create: {
            productId: item.productId,
            quantity: item.quantity,
          },
          update: {
            quantity: {
              increment: item.quantity,
            },
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
