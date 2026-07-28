import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateSaleNo() {
    const count = await this.prisma.sale.count();
    const next = count + 1;
    return `SAT-${String(next).padStart(6, '0')}`;
  }

  async create(userId: number, dto: CreateSaleDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Satış kalemi boş olamaz');
    }

    const saleNo = await this.generateSaleNo();

    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0;

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw new NotFoundException(
            `Ürün bulunamadı veya pasif. ProductId=${item.productId}`,
          );
        }

        const movements = await tx.stockMovement.findMany({
          where: { productId: item.productId },
        });

        const stock = movements.reduce((total, movement) => {
          if (movement.type === 'IN') return total + movement.quantity;
          if (movement.type === 'OUT') return total - movement.quantity;
          return total + movement.quantity;
        }, 0);

        if (stock < item.quantity) {
          throw new BadRequestException(
            `Yetersiz stok. ProductId=${item.productId}, mevcut=${stock}, istenen=${item.quantity}`,
          );
        }

        const unitPrice = Number(item.unitPrice);

        if (product.minSalePrice && unitPrice < Number(product.minSalePrice)) {
          throw new BadRequestException(
            `Minimum satış fiyatı altına inilemez. ProductId=${item.productId}`,
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
        throw new BadRequestException('Ödeme toplamı satış toplamına eşit olmalı.');
      }

      let currentAccountId: number | null = null;

      if (onAccount > 0) {
        if (!dto.currentAccountName?.trim()) {
          throw new BadRequestException('Cari satış için cari adı girilmelidir.');
        }

        let currentAccount = await tx.currentAccount.findFirst({
          where: {
            name: dto.currentAccountName.trim(),
            type: 'CUSTOMER',
          },
        });

        if (!currentAccount) {
          currentAccount = await tx.currentAccount.create({
            data: {
              name: dto.currentAccountName.trim(),
              type: 'CUSTOMER',
              isActive: true,
            },
          });
        }

        currentAccountId = currentAccount.id;
      }

      const sale = await tx.sale.create({
        data: {
          saleNo,
          paymentType: onAccount > 0 ? 'ON_ACCOUNT' : 'MIXED',
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

      for (const item of dto.items) {
        const unitPrice = Number(item.unitPrice);
        const lineTotal = unitPrice * item.quantity;

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
            amount: subtotal,
            note: `Satış borcu - ${sale.saleNo}`,
          },
        });

        const collectedAmount = cash + card + transfer;

        if (collectedAmount > 0) {
          await tx.currentAccountMovement.create({
            data: {
              currentAccountId,
              userId,
              saleId: sale.id,
              type: 'PAYMENT',
              amount: collectedAmount,
              note: `Satış tahsilatı - ${sale.saleNo}`,
            },
          });
        }
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
