import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

type AuthenticatedUser = {
  sub: number;
  username: string;
  role: string;
};

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: {
        authorization?: string;
      };
      user?: AuthenticatedUser;
    }>();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token bulunamadı.');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Geçersiz token formatı.');
    }

    try {
      const secret = this.configService.getOrThrow<string>('JWT_SECRET');

      const payload = this.jwtService.verify<AuthenticatedUser>(token, {
        secret,
      });

      const user = await this.prisma.user.findFirst({
        where: {
          id: payload.sub,
          isActive: true,
        },
        select: {
          id: true,
          username: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      request.user = {
        sub: user.id,
        username: user.username,
        role: user.role.name,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Token geçersiz veya süresi dolmuş.');
    }
  }
}
