import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

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
  ) {}

  canActivate(context: ExecutionContext): boolean {
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
      const secret =
        this.configService.getOrThrow<string>('JWT_SECRET');

      request.user =
        this.jwtService.verify<AuthenticatedUser>(token, {
          secret,
        });

      return true;
    } catch {
      throw new UnauthorizedException(
        'Token geçersiz veya süresi dolmuş.',
      );
    }
  }
}