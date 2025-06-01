import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ReqType } from 'express';

@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: ReqType) {
    const user = req.user;
    if (!user) throw new Error('User not found');

    // Используем 'as any' если TS ругается на отсутствие `password`
    const { password, ...rest } = user as any;
    return rest;
  }
}
