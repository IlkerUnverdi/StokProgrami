import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCurrentAccountDto } from './dto/create-current-account.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdateCurrentAccountDto } from './dto/update-current-account.dto';

@Injectable()
export class CurrentAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCurrentAccountDto) {
    return this.prisma.currentAccount.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        taxNumber: dto.taxNumber,
        address: dto.address,
        type: dto.type,
      },
    });
  }
  async update(id: number, dto: UpdateCurrentAccountDto) {
    const currentAccount = await this.prisma.currentAccount.findUnique({
      where: { id },
    });

    if (!currentAccount) {
      throw new NotFoundException('Cari bulunamadı');
    }

    return this.prisma.currentAccount.update({
      where: { id },
      data: dto,
    });
  }

  findAll() {
    return this.prisma.currentAccount.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const currentAccount = await this.prisma.currentAccount.findUnique({
      where: { id },
      include: {
        sales: {
          include: {
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
          },
          orderBy: { id: 'desc' },
        },
        currentAccountMovements: {
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
            sale: {
              include: {
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
              },
            },
            purchase: {
              include: {
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
              },
            },
          },
          orderBy: { id: 'desc' },
        },
      },
    });

    if (!currentAccount) {
      throw new NotFoundException('Cari bulunamadı');
    }

    return currentAccount;
  }

  async getBalance(id: number) {
    const currentAccount = await this.prisma.currentAccount.findUnique({
      where: { id },
    });

    if (!currentAccount) {
      throw new NotFoundException('Cari bulunamadı');
    }

    const movements = await this.prisma.currentAccountMovement.findMany({
      where: { currentAccountId: id },
    });

    let balance = 0;

    for (const movement of movements) {
      if (movement.type === 'DEBT') {
        balance += Number(movement.amount);
      } else if (movement.type === 'PAYMENT') {
        balance -= Number(movement.amount);
      }
    }

    return {
      currentAccountId: id,
      balance,
    };
  }

  async createPayment(
    currentAccountId: number,
    userId: number,
    dto: CreatePaymentDto,
  ) {
    const currentAccount = await this.prisma.currentAccount.findUnique({
      where: { id: currentAccountId },
    });

    if (!currentAccount) {
      throw new NotFoundException('Cari bulunamadı');
    }

    if (!currentAccount.isActive) {
      throw new BadRequestException('Cari aktif değil');
    }

    if (Number(dto.amount) <= 0) {
      throw new BadRequestException('Ödeme miktarı sıfırdan büyük olmalıdır');
    }

    return this.prisma.currentAccountMovement.create({
      data: {
        currentAccountId,
        userId,
        type: 'PAYMENT',
        amount: Number(dto.amount),
        paymentMethod: dto.paymentMethod,
        note: dto.note,
      },
    });
  }
}
