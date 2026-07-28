import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

type UserWithRole = {
  id: number;
  username: string;
  createdAt: Date;
  role: {
    name: string;
  };
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(user: UserWithRole) {
    return {
      id: user.id,
      username: user.username,
      role: user.role.name,
      isActive: true,
      createdAt: user.createdAt,
    };
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: {
        id: 'desc',
      },
      include: {
        role: true,
      },
    });

    return users.map((user) => this.toResponse(user));
  }

  async create(body: {
    username: string;
    password: string;
    role: string;
  }) {
    const username = body.username?.trim();
    const password = body.password?.trim();
    const roleName = body.role?.trim();

    if (!username || !password || !roleName) {
      throw new BadRequestException('Tüm alanlar zorunludur.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Bu kullanıcı adı zaten kullanılıyor.');
    }

    const role = await this.prisma.role.findFirst({
      where: {
        name: {
          equals: roleName,
          mode: 'insensitive',
        },
      },
    });

    if (!role) {
      throw new BadRequestException(
        'Seçilen rol bulunamadı. Önce Role tablosuna bu rol eklenmeli.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: {
          connect: {
            id: role.id,
          },
        },
      },
      include: {
        role: true,
      },
    });

    return this.toResponse(createdUser);
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    await this.prisma.user.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: 'Kullanıcı silindi.',
    };
  }
}
