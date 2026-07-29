import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private getTodayRange() {
    return this.getDateRange();
  }

  private getDateRange(date?: string) {
    const selected = date ? new Date(`${date}T00:00:00`) : new Date();

    const start = new Date(selected);
    start.setHours(0, 0, 0, 0);

    const end = new Date(selected);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  async getSummary() {
    const { start, end } = this.getTodayRange();

    const [
      salesToday,
      purchasesToday,
      paymentsToday,
      productCount,
      currentAccountCount,
    ] = await Promise.all([
      this.prisma.sale.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        select: {
          grandTotal: true,
        },
      }),
      this.prisma.purchase.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        select: {
          grandTotal: true,
        },
      }),
      this.prisma.currentAccountMovement.findMany({
        where: {
          type: 'PAYMENT',
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        select: {
          amount: true,
        },
      }),
      this.prisma.product.count(),
      this.prisma.currentAccount.count(),
    ]);

    const salesTotal = salesToday.reduce(
      (sum, item) => sum + Number(item.grandTotal),
      0,
    );

    const purchasesTotal = purchasesToday.reduce(
      (sum, item) => sum + Number(item.grandTotal),
      0,
    );

    const paymentsTotal = paymentsToday.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    return {
      today: {
        salesTotal,
        purchasesTotal,
        paymentsTotal,
      },
      totals: {
        productCount,
        currentAccountCount,
      },
    };
  }

  async getLowStockProducts(threshold = 5) {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        partBrand: true,
        stock: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return products
      .map((product) => ({
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        category: product.category,
        partBrand: product.partBrand,
        stock: product.stock?.quantity ?? 0,
      }))
      .filter((item) => item.stock <= threshold)
      .sort((a, b) => a.stock - b.stock);
  }

  findRecentSales() {
    return this.prisma.sale.findMany({
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
      take: 10,
    });
  }

  findRecentPurchases() {
    return this.prisma.purchase.findMany({
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
      take: 10,
    });
  }

  async getSalesDaily(date?: string) {
    const { start, end } = this.getDateRange(date);

    const [sales, manualPayments] = await Promise.all([
      this.prisma.sale.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          currentAccount: true,
          items: {
            include: {
              product: {
                include: {
                  partBrand: true,
                  oemCodes: true,
                  referenceCodes: true,
                },
              },
            },
          },
          currentAccountMovements: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.currentAccountMovement.findMany({
        where: {
          type: 'PAYMENT',
          saleId: null,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          currentAccount: true,
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const salesTotal = sales.reduce(
      (sum, sale) => sum + Number(sale.grandTotal),
      0,
    );

    const totalItems = sales.reduce(
      (sum, sale) =>
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );

    const cariDebtTotal = sales.reduce((sum, sale) => {
      const debt = sale.currentAccountMovements
        .filter((movement) => movement.type === 'DEBT')
        .reduce(
          (movementSum, movement) => movementSum + Number(movement.amount),
          0,
        );

      const payment = sale.currentAccountMovements
        .filter((movement) => movement.type === 'PAYMENT')
        .reduce(
          (movementSum, movement) => movementSum + Number(movement.amount),
          0,
        );

      return sum + Math.max(0, debt - payment);
    }, 0);

    const salesCollectedTotal = salesTotal - cariDebtTotal;

    const manualPaymentTotal = manualPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    return {
      summary: {
        salesCount: sales.length,
        totalItems,
        salesTotal,
        collectedTotal: salesCollectedTotal + manualPaymentTotal,
        cariDebtTotal,
        manualPaymentTotal,
      },
      sales,
      manualPayments,
    };
  }

  findRecentPayments() {
    return this.prisma.currentAccountMovement.findMany({
      where: {
        type: 'PAYMENT',
      },
      include: {
        currentAccount: true,
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
        sale: true,
      },
      orderBy: { id: 'desc' },
      take: 10,
    });
  }
}
