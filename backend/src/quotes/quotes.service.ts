import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateQuoteNo() {
    const count = await this.prisma.quote.count();
    const next = count + 1;
    return `TKL-${String(next).padStart(6, '0')}`;
  }

  async create(userId: number, dto: CreateQuoteDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Teklif kalemi boş olamaz');
    }

    const quoteNo = await this.generateQuoteNo();

    let subtotal = 0;
    let discountTotal = 0;

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
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

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    return this.prisma.$transaction(async (tx) => {
      const quote = await tx.quote.create({
        data: {
          quoteNo,
          subtotal,
          discountTotal,
          grandTotal,
          note: dto.note,
          expiresAt,
          userId,
          currentAccountId: dto.currentAccountId,
        },
      });

      for (const item of dto.items) {
        const unitPrice = Number(item.unitPrice);
        const discount = Number(item.discount ?? 0);
        const lineTotal = unitPrice * item.quantity - discount;

        await tx.quoteItem.create({
          data: {
            quoteId: quote.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            discount,
            lineTotal,
          },
        });
      }

      return tx.quote.findUnique({
        where: { id: quote.id },
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
    return this.prisma.quote.findMany({
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
    const quote = await this.prisma.quote.findUnique({
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

    if (!quote) {
      throw new NotFoundException('Teklif bulunamadı');
    }

    return quote;
  }

  async markExpiredQuotes() {
    const now = new Date();

    const result = await this.prisma.quote.updateMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    return {
      updatedCount: result.count,
    };
  }
    async convertToSale(quoteId: number, userId: number) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        items: true,
      },
    });

    if (!quote) {
      throw new NotFoundException('Teklif bulunamadı');
    }

    if (quote.status !== 'ACTIVE') {
      throw new BadRequestException('Sadece aktif teklifler satışa çevrilebilir');
    }

    if (quote.expiresAt < new Date()) {
      throw new BadRequestException('Süresi geçmiş teklif satışa çevrilemez');
    }

    const saleCount = await this.prisma.sale.count();
    const saleNo = `SAT-${String(saleCount + 1).padStart(6, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      for (const item of quote.items) {
        const movements = await tx.stockMovement.findMany({
          where: { productId: item.productId },
        });

        let stock = 0;
        for (const movement of movements) {
          if (movement.type === 'IN') stock += movement.quantity;
          else if (movement.type === 'OUT') stock -= movement.quantity;
          else if (movement.type === 'ADJUSTMENT') stock += movement.quantity;
        }

        if (stock < item.quantity) {
          throw new BadRequestException(
            `Yetersiz stok. ProductId=${item.productId}, mevcut=${stock}, istenen=${item.quantity}`,
          );
        }
      }

      const sale = await tx.sale.create({
        data: {
          saleNo,
          paymentType: quote.currentAccountId ? 'ON_ACCOUNT' : 'CASH',
          subtotal: quote.subtotal,
          discountTotal: quote.discountTotal,
          grandTotal: quote.grandTotal,
          note: `Tekliften dönüştürüldü: ${quote.quoteNo}`,
          userId,
          currentAccountId: quote.currentAccountId,
        },
      });

      for (const item of quote.items) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            lineTotal: item.lineTotal,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            userId,
            type: 'OUT',
            quantity: item.quantity,
            note: `Teklif satış dönüşümü - ${quote.quoteNo}`,
          },
        });
      }

      if (quote.currentAccountId) {
        await tx.currentAccountMovement.create({
          data: {
            currentAccountId: quote.currentAccountId,
            userId,
            saleId: sale.id,
            type: 'DEBT',
            amount: quote.grandTotal,
            note: `Teklif satış dönüşümü borcu - ${quote.quoteNo}`,
          },
        });
      }

      await tx.quote.update({
        where: { id: quote.id },
        data: {
          status: 'CONVERTED',
          convertedAt: new Date(),
        },
      });

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
}
