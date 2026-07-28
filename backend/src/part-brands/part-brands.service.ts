import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartBrandsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.partBrand.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
