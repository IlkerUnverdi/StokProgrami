import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateDocumentNumber } from '../common/document-number';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateQuoteDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Teklif kalemi boş olamaz');
    }

    const productIds = dto.items.map((item) => item.productId);

    if (new Set(productIds).size !== productIds.length) {
      throw new BadRequestException(
        'Aynı ürün teklife birden fazla kez eklenemez',
      );
    }

    if (dto.currentAccountId) {
      const currentAccount = await this.prisma.currentAccount.findUnique({
        where: { id: dto.currentAccountId },
      });

      if (!currentAccount || !currentAccount.isActive) {
        throw new BadRequestException('Geçersiz cari hesap');
      }

      if (currentAccount.type !== 'CUSTOMER') {
        throw new BadRequestException(
          'Teklif için müşteri tipinde bir cari hesap seçilmelidir',
        );
      }
    }

    let subtotal = 0;
    let discountTotal = 0;

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) {
        throw new BadRequestException(`Geçersiz ürün: ${item.productId}`);
      }

      if (item.quantity <= 0) {
        throw new BadRequestException(
          `Miktar sıfırdan büyük olmalıdır: ${item.productId}`,
        );
      }

      const unitPrice = Number(item.unitPrice);
      const discount = Number(item.discount ?? 0);
      const lineSubtotal = unitPrice * item.quantity;

      if (unitPrice <= 0) {
        throw new BadRequestException(
          `Birim fiyat sıfırdan büyük olmalıdır: ${item.productId}`,
        );
      }

      if (discount < 0 || discount > lineSubtotal) {
        throw new BadRequestException(
          `İndirim, satır toplamından büyük veya negatif olamaz: ${item.productId}`,
        );
      }

      subtotal += lineSubtotal;
      discountTotal += discount;
    }

    const grandTotal = subtotal - discountTotal;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    return this.prisma.$transaction(async (tx) => {
      const quoteNo = await generateDocumentNumber(tx, 'QUOTE');

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
    return this.prisma.$transaction(async (tx) => {
      const quote = await tx.quote.findUnique({
        where: { id: quoteId },
        include: {
          items: true,
          currentAccount: true,
        },
      });

      if (!quote) {
        throw new NotFoundException('Teklif bulunamadı');
      }

      if (quote.status !== 'ACTIVE') {
        throw new BadRequestException('Teklif geçerli değil');
      }

      if (quote.expiresAt < new Date()) {
        throw new BadRequestException('Teklif süresi dolmuş');
      }

      if (quote.currentAccount && !quote.currentAccount.isActive) {
        throw new BadRequestException('Cari hesap aktif değil');
      }

      if (quote.currentAccount && quote.currentAccount.type !== 'CUSTOMER') {
        throw new BadRequestException(
          'Satış için müşteri tipinde bir cari hesap seçilmelidir',
        );
      }

      const statusUpdate = await tx.quote.updateMany({
        where: {
          id: quote.id,
          status: 'ACTIVE',
        },
        data: {
          status: 'CONVERTED',
          convertedAt: new Date(),
        },
      });

      if (statusUpdate.count === 0) {
        throw new BadRequestException('Teklif geçerli değil');
      }

      const saleNo = await generateDocumentNumber(tx, 'SALE');

      for (const item of quote.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            isActive: true,
          },
        });

        if (!product || !product.isActive) {
          throw new BadRequestException(
            `Ürün geçerli değil: ${item.productId}`,
          );
        }

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
            where: { productId: item.productId },
          });

          throw new BadRequestException(
            `Yeterli stok yok: ${item.productId}. Mevcut stok: ${
              currentStock ? currentStock.quantity : 0
            }`,
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

      await tx.salePayment.create({
        data: {
          saleId: sale.id,
          method: quote.currentAccountId ? 'ON_ACCOUNT' : 'CASH',
          amount: quote.grandTotal,
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

      return tx.sale.findUnique({
        where: { id: sale.id },
        include: {
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
}
