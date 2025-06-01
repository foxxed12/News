import { Controller, Post, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ReqType } from 'express';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateNewsDto, @Request() req: ReqType) {
    return this.newsService.create(dto, req.user!);
  }

  @Get()
  findAll() {
    return this.newsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(+id);
  }
}
