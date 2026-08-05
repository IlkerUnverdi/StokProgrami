import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateDocumentNumber } from '../common/document-number';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';

type ReturnInvoiceFile = {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
};

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateReturnDto) {
    const productIds = dto.items.map((item) => item.productId);

    if (new Set(productIds).size !== productIds.length) {
      throw new BadRequestException(
        'Aynı ürün iadeye birden fazla kez eklenemez',
      );
    }

    const currentAccountId = dto.currentAccountId;
    const sourceSaleId = dto.sourceSaleId;

    if (!currentAccountId) {
      throw new BadRequestException('Bu iade tipi için cari seçilmelidir');
    }

    return this.prisma.$transaction(async (tx) => {
      const currentAccount = await tx.currentAccount.findUnique({
        where: {
          id: currentAccountId,
        },
      });

      if (!currentAccount || !currentAccount.isActive) {
        throw new BadRequestException('Seçilen cari bulunamadı veya pasif');
      }

      const isCustomerReturn = dto.type === 'CUSTOMER_RETURN';

      if (isCustomerReturn && currentAccount.type !== 'CUSTOMER') {
        throw new BadRequestException(
          'Müşteri iadesi için müşteri carisi seçilmelidir',
        );
      }

      if (!isCustomerReturn && currentAccount.type !== 'SUPPLIER') {
        throw new BadRequestException(
          'Tedarikçi iadesi için tedarikçi carisi seçilmelidir',
        );
      }

      if (isCustomerReturn && !sourceSaleId) {
        throw new BadRequestException(
          'Müşteri iadesi için kaynak satış seçilmelidir',
        );
      }

      const sourceSale =
        isCustomerReturn && sourceSaleId
          ? await tx.sale.findUnique({
              where: {
                id: sourceSaleId,
              },
              include: {
                items: true,
              },
            })
          : null;

      if (
        isCustomerReturn &&
        (!sourceSale || sourceSale.currentAccountId !== currentAccountId)
      ) {
        throw new BadRequestException(
          'Seçilen satış bu müşteriye ait değil veya bulunamadı',
        );
      }

      const previousReturnQuantities =
        isCustomerReturn && sourceSale
          ? await tx.returnItem.groupBy({
              by: ['productId'],
              where: {
                productId: {
                  in: productIds,
                },
                return: {
                  sourceSaleId: sourceSale.id,
                  type: 'CUSTOMER_RETURN',
                  status: {
                    not: 'CANCELLED',
                  },
                },
              },
              _sum: {
                quantity: true,
              },
            })
          : [];
      const previousReturnQuantityByProductId = new Map(
        previousReturnQuantities.map((item) => [
          item.productId,
          item._sum.quantity ?? 0,
        ]),
      );

      const returnNo = await generateDocumentNumber(tx, 'RETURN');
      const returnDoc = await tx.return.create({
        data: {
          returnNo,
          type: dto.type,
          status: isCustomerReturn ? 'COMPLETED' : 'PENDING',
          note: dto.note?.trim() || null,
          returnInvoiceNo: dto.returnInvoiceNo?.trim() || null,
          returnInvoiceDate: dto.returnInvoiceDate
            ? new Date(dto.returnInvoiceDate)
            : null,
          userId,
          currentAccountId,
          sourceSaleId: sourceSale?.id,
          completedAt: isCustomerReturn ? new Date() : null,
        },
      });

      let returnTotal = 0;

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw new NotFoundException(
            `Ürün bulunamadı veya pasif: ${item.productId}`,
          );
        }

        let unitPrice: number;

        if (isCustomerReturn) {
          const sourceSaleItem = sourceSale?.items.find(
            (saleItem) => saleItem.productId === item.productId,
          );

          if (!sourceSaleItem) {
            throw new BadRequestException(
              `${product.name} seçilen satışta bulunmuyor`,
            );
          }

          const previouslyReturned =
            previousReturnQuantityByProductId.get(item.productId) ?? 0;
          const returnableQuantity =
            sourceSaleItem.quantity - previouslyReturned;

          if (item.quantity > returnableQuantity) {
            throw new BadRequestException(
              `${product.name} için en fazla ${returnableQuantity} adet iade edilebilir`,
            );
          }

          unitPrice = Number(sourceSaleItem.unitPrice);
        } else {
          if (product.lastPurchasePrice === null) {
            throw new BadRequestException(
              `${product.name} için son alış fiyatı bulunamadı`,
            );
          }

          unitPrice = Number(product.lastPurchasePrice);
        }

        const lineTotal = unitPrice * item.quantity;
        returnTotal += lineTotal;

        await tx.returnItem.create({
          data: {
            returnId: returnDoc.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            lineTotal,
            note: item.note?.trim() || null,
          },
        });

        if (isCustomerReturn) {
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
              note: `Müşteri iadesi - ${returnNo}`,
            },
          });
        } else {
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
              returnPendingQuantity: {
                increment: item.quantity,
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
        }
      }

      if (isCustomerReturn) {
        await tx.currentAccountMovement.create({
          data: {
            currentAccountId,
            userId,
            returnId: returnDoc.id,
            type: 'CREDIT',
            amount: returnTotal,
            note: `Müşteri iadesi mahsubu - ${returnNo}`,
          },
        });
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
          sourceSale: {
            select: {
              id: true,
              saleNo: true,
              createdAt: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  async complete(id: number, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      const returnDoc = await tx.return.findUnique({
        where: { id },
        include: {
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

      if (returnDoc.status !== 'PENDING') {
        throw new BadRequestException(
          'Yalnızca bekleyen iadeler tamamlanabilir.',
        );
      }

      const supplierId = returnDoc.currentAccountId;

      if (
        !supplierId ||
        !returnDoc.currentAccount ||
        returnDoc.currentAccount.type !== 'SUPPLIER' ||
        !returnDoc.currentAccount.isActive
      ) {
        throw new BadRequestException(
          'İade için geçerli ve aktif bir tedarikçi bulunamadı.',
        );
      }

      const statusUpdate = await tx.return.updateMany({
        where: {
          id,
          status: 'PENDING',
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      if (statusUpdate.count === 0) {
        throw new BadRequestException('İade daha önce işleme alınmış.');
      }

      let returnTotal = 0;

      for (const item of returnDoc.items) {
        const stockUpdate = await tx.productStock.updateMany({
          where: {
            productId: item.productId,
            returnPendingQuantity: {
              gte: item.quantity,
            },
          },
          data: {
            returnPendingQuantity: {
              decrement: item.quantity,
            },
          },
        });

        if (stockUpdate.count === 0) {
          throw new BadRequestException(
            `${item.product.name} için bekleyen iade stoğu yetersiz.`,
          );
        }

        returnTotal += Number(item.lineTotal);

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            userId,
            supplierId,
            type: 'OUT',
            quantity: item.quantity,
            note: `Tedarikçiye iade - ${returnDoc.returnNo}`,
          },
        });
      }

      await tx.currentAccountMovement.create({
        data: {
          currentAccountId: supplierId,
          userId,
          returnId: returnDoc.id,
          type: 'CREDIT',
          amount: returnTotal,
          note: `Tedarikçi iade mahsubu - ${returnDoc.returnNo}`,
        },
      });

      return tx.return.findUnique({
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
          sourceSale: {
            select: {
              id: true,
              saleNo: true,
              createdAt: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          currentAccountMovements: true,
        },
      });
    });
  }

  async cancel(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const returnDoc = await tx.return.findUnique({
        where: { id },
        include: {
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

      if (returnDoc.status !== 'PENDING') {
        throw new BadRequestException(
          'Yalnızca bekleyen iadeler iptal edilebilir.',
        );
      }

      const statusUpdate = await tx.return.updateMany({
        where: {
          id,
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
        },
      });

      if (statusUpdate.count === 0) {
        throw new BadRequestException('İade daha önce işleme alınmış.');
      }

      for (const item of returnDoc.items) {
        const stockUpdate = await tx.productStock.updateMany({
          where: {
            productId: item.productId,
            returnPendingQuantity: {
              gte: item.quantity,
            },
          },
          data: {
            quantity: {
              increment: item.quantity,
            },
            returnPendingQuantity: {
              decrement: item.quantity,
            },
          },
        });

        if (stockUpdate.count === 0) {
          throw new BadRequestException(
            `${item.product.name} için bekleyen iade stoğu yetersiz.`,
          );
        }
      }

      return tx.return.findUnique({
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
          sourceSale: {
            select: {
              id: true,
              saleNo: true,
              createdAt: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  async attachInvoiceFile(id: number, file: ReturnInvoiceFile) {
    const returnDoc = await this.prisma.return.findUnique({
      where: {
        id,
      },
    });

    if (!returnDoc) {
      throw new NotFoundException('İade bulunamadı');
    }

    if (returnDoc.type === 'CUSTOMER_RETURN') {
      throw new BadRequestException('Müşteri iadelerine fatura eklenemez');
    }

    return this.prisma.return.update({
      where: { id },
      data: {
        returnInvoiceFileUrl: `/uploads/return-invoices/${file.filename}`,
        returnInvoiceFileName: file.originalname,
      },
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
        sourceSale: {
          select: {
            id: true,
            saleNo: true,
            createdAt: true,
          },
        },
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
        sourceSale: {
          select: {
            id: true,
            saleNo: true,
            createdAt: true,
          },
        },
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
