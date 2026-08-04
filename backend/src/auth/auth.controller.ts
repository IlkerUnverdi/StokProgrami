import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';
import { LoginDto } from './login.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

type AuthenticatedRequest = {
  user: {
    sub: number;
    username: string;
    role: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return request.user;
  }

  @Roles('Admin')
  @UseGuards(JwtGuard, RolesGuard)
  @Get('admin-only')
  adminOnly(@Req() request: AuthenticatedRequest) {
    return {
      message: 'Sadece admin girebilir',
      user: request.user,
    };
  }
}
