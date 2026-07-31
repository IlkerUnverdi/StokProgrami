import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateDocumentNumber } from '../common/document-number';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateSaleDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Satış kalemi boş olamaz');
    }

    const productIds = dto.items.map((item) => item.productId);
    const uniqueProductIds = new Set(productIds);

    if (uniqueProductIds.size !== productIds.length) {
      throw new BadRequestException('Aynı ürün birden fazla kez eklenemez');
    }

    return this.prisma.$transaction(async (tx) => {
      const saleNo = await generateDocumentNumber(tx, 'SALE');

      let subtotal = 0;

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw new NotFoundException(
            `Ürün bulunamadı veya aktif değil. ProductId=${item.productId}`,
          );
        }

        const unitPrice = Number(item.unitPrice);

        if (product.minSalePrice && unitPrice < Number(product.minSalePrice)) {
          throw new BadRequestException(
            `Minimum satış fiyatının altında satış yapılamaz. ProductId=${item.productId}`,
          );
        }

        subtotal += unitPrice * item.quantity;
      }

      const cash = Number(dto.payments?.CASH ?? 0);
      const card = Number(dto.payments?.CARD ?? 0);
      const transfer = Number(dto.payments?.TRANSFER ?? 0);
      const onAccount = Number(dto.payments?.ON_ACCOUNT ?? 0);
      const paidTotal = cash + card + transfer + onAccount;

      if (Math.abs(subtotal - paidTotal) > 0.01) {
        throw new BadRequestException(
          'Ödeme toplamı satış toplamına eşit olmalı.',
        );
      }

      const activePayments = [
        { method: 'CASH' as const, amount: cash },
        { method: 'CARD' as const, amount: card },
        { method: 'TRANSFER' as const, amount: transfer },
        { method: 'ON_ACCOUNT' as const, amount: onAccount },
      ].filter((payment) => payment.amount > 0);

      if (activePayments.length === 0) {
        throw new BadRequestException('En az bir ödeme yöntemi seçilmelidir.');
      }

      const paymentType =
        activePayments.length === 1 ? activePayments[0].method : 'MIXED';

      let currentAccountId: number | null = null;

      if (onAccount > 0) {
        if (!dto.currentAccountId) {
          throw new BadRequestException(
            'Cari satış için cari hesap seçilmelidir.',
          );
        }

        const currentAccount = await tx.currentAccount.findUnique({
          where: {
            id: dto.currentAccountId,
          },
        });

        if (!currentAccount) {
          throw new NotFoundException('Cari hesap bulunamadı.');
        }

        if (!currentAccount.isActive) {
          throw new BadRequestException('Seçilen cari hesap aktif değildir.');
        }

        if (currentAccount.type !== 'CUSTOMER') {
          throw new BadRequestException(
            'Satış için müşteri tipinde bir cari hesap seçilmelidir.',
          );
        }

        currentAccountId = currentAccount.id;
      }

      const sale = await tx.sale.create({
        data: {
          saleNo,
          paymentType,
          subtotal,
          discountTotal: 0,
          grandTotal: subtotal,
          note: [
            cash > 0 ? `Nakit: ${cash}` : null,
            card > 0 ? `Kart: ${card}` : null,
            transfer > 0 ? `Havale/EFT: ${transfer}` : null,
            onAccount > 0 ? `Cari borç: ${onAccount}` : null,
            dto.note || null,
          ]
            .filter(Boolean)
            .join(' | '),
          userId,
          currentAccountId,
        },
      });

      await tx.salePayment.createMany({
        data: activePayments.map((payment) => ({
          saleId: sale.id,
          method: payment.method,
          amount: payment.amount,
        })),
      });

      for (const item of dto.items) {
        const unitPrice = Number(item.unitPrice);
        const lineTotal = unitPrice * item.quantity;

        const stockUpdate = await tx.productStock.updateMany({
          where: {
            productId: item.productId,
            quantity: {
              gte: item.quantity,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        if (stockUpdate.count === 0) {
          const currentStock = await tx.productStock.findUnique({
            where: {
              productId: item.productId,
            },
          });

          throw new BadRequestException(
            `Yetersiz stok. ProductId=${item.productId}, mevcut=${currentStock?.quantity ?? 0}, istenen=${item.quantity}`,
          );
        }

        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            discount: 0,
            lineTotal,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            userId,
            type: 'OUT',
            quantity: item.quantity,
            note: `Satış çıkışı - ${sale.saleNo}`,
          },
        });
      }

      if (currentAccountId && onAccount > 0) {
        await tx.currentAccountMovement.create({
          data: {
            currentAccountId,
            userId,
            saleId: sale.id,
            type: 'DEBT',
            amount: onAccount,
            note: `Veresiye satış borcu - ${sale.saleNo}`,
          },
        });
      }

      return tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: { select: { id: true, name: true } },
            },
          },
          currentAccount: true,
          payments: true,
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
    return this.prisma.sale.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: { select: { id: true, name: true } },
          },
        },
        currentAccount: true,
        payments: true,
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
    const sale = await this.prisma.sale.findUnique({
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
        payments: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Satış bulunamadı');
    }

    return sale;
  }
}
