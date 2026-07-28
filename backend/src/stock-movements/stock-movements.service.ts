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
      where: { id: dto.productId },
      include: {
        stockMovements: {
          select: {
            type: true,
            quantity: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    const currentStock = product.stockMovements.reduce((total, movement) => {
      if (movement.type === 'IN') return total + movement.quantity;
      if (movement.type === 'OUT') return total - movement.quantity;
      return total + movement.quantity;
    }, 0);

    if (dto.quantity <= 0) {
      throw new BadRequestException('Adet 0 veya negatif olamaz.');
    }

    if (dto.type === 'OUT' && currentStock < dto.quantity) {
      throw new BadRequestException('Yetersiz stok.');
    }

    if (dto.type === 'IN') {
      if (!dto.supplierId) {
        throw new BadRequestException('Stok girişi için tedarikçi seçilmelidir.');
      }

      const supplierId = dto.supplierId;

      const supplier = await this.prisma.currentAccount.findUnique({
        where: { id: supplierId },
      });

      if (!supplier || supplier.type !== 'SUPPLIER' || !supplier.isActive) {
        throw new BadRequestException('Geçerli bir aktif tedarikçi seçilmelidir.');
      }

      if (!dto.unitCost || Number(dto.unitCost) <= 0) {
        throw new BadRequestException('Stok girişi için birim alış fiyatı zorunludur.');
      }

      const unitCost = Number(dto.unitCost);
      const lineTotal = unitCost * dto.quantity;

      return this.prisma.$transaction(async (tx) => {
        const purchaseCount = await tx.purchase.count();
        const purchaseNo = `ALS-${String(purchaseCount + 1).padStart(6, '0')}`;

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

        return tx.stockMovement.create({
          data: {
            productId: dto.productId,
            userId,
            supplierId,
            type: dto.type,
            quantity: dto.quantity,
            note: [
              `Alış girişi - ${purchase.purchaseNo}`,
              `Tedarikçi: ${supplier.name}`,
              `Alış No: ${purchase.purchaseNo}`,
              dto.reference ? `Referans: ${dto.reference}` : null,
              dto.unitCost ? `Birim alış: ${dto.unitCost}` : null,
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

    return this.prisma.stockMovement.create({
      data: {
        productId: dto.productId,
        userId,
        type: dto.type,
        quantity: dto.quantity,
        note: [
          dto.reference ? `Referans: ${dto.reference}` : null,
          dto.unitCost ? `Birim alış: ${dto.unitCost}` : null,
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
