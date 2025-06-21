// backend/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

import { RegisterDto } from './dto/register.dto';

/**
 * AuthController
 * --------------
 *  • POST /auth/register   — регистрация пользователя  
 *  • POST /auth/login      — логин (LocalStrategy) → access + refresh  
 *  • POST /auth/refresh    — обновление access-токена по refresh-токену  
 *  • GET  /auth/profile    — текущий пользователь (JWT)  
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* ------------------------------------------------------------------
   *  Регистрация
   * ---------------------------------------------------------------- */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /* ------------------------------------------------------------------
   *  Логин (LocalStrategy: email + password)
   * ---------------------------------------------------------------- */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: ExpressRequest) {
    // LocalStrategy кладёт user в req
    return this.authService.login(req.user);
  }

  /* ------------------------------------------------------------------
   *  Обновление access-токена
   * ---------------------------------------------------------------- */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') token: string) {
    return this.authService.refreshAccessToken(token);
  }

  /* ------------------------------------------------------------------
   *  Профиль текущего пользователя
   * ---------------------------------------------------------------- */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Request() req: ExpressRequest) {
    const user = req.user as any;
    const { password, ...safeUser } = user || {};
    return safeUser;
  }
}
