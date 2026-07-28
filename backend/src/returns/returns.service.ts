import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateReturnNo() {
    const count = await this.prisma.return.count();
    const next = count + 1;
    return `IAD-${String(next).padStart(6, '0')}`;
  }

  async create(userId: number, dto: CreateReturnDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('İade kalemi boş olamaz');
    }

    if (
      (dto.type === 'CUSTOMER_RETURN' ||
        dto.type === 'SUPPLIER_RETURN' ||
        dto.type === 'DEFECTIVE_RETURN' ||
        dto.type === 'WRONG_ITEM_RETURN') &&
      !dto.currentAccountId
    ) {
      throw new BadRequestException('Bu iade tipi için cari seçilmelidir');
    }

    const returnNo = await this.generateReturnNo();

    return this.prisma.$transaction(async (tx) => {
      const returnDoc = await tx.return.create({
        data: {
          returnNo,
          type: dto.type,
          note: dto.note,
          userId,
          currentAccountId: dto.currentAccountId,
        },
      });

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Ürün bulunamadı: ${item.productId}`);
        }

        await tx.returnItem.create({
          data: {
            returnId: returnDoc.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            note: item.note,
          },
        });

        // Stok etkisi
        if (dto.type === 'CUSTOMER_RETURN') {
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              userId,
              type: 'IN',
              quantity: item.quantity,
              note: `Müşteri iadesi - ${returnNo}`,
            },
          });
        } else if (
          dto.type === 'SUPPLIER_RETURN' ||
          dto.type === 'DEFECTIVE_RETURN' ||
          dto.type === 'WRONG_ITEM_RETURN'
        ) {
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              userId,
              type: 'OUT',
              quantity: item.quantity,
              note: `Tedarikçi/bozuk/yanlış ürün iadesi - ${returnNo}`,
            },
          });
        }
      }

      return tx.return.findUnique({
        where: { id: returnDoc.id },
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
    return this.prisma.return.findMany({
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
    const returnDoc = await this.prisma.return.findUnique({
      where: { id },
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
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!returnDoc) {
      throw new NotFoundException('İade bulunamadı');
    }

    return returnDoc;
  }
}
