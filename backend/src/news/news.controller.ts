// backend/src/news/news.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  ParseArrayPipe,
  Request,
  UseGuards,
  BadRequestException,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

/**
 * Контроллер новостей.
 * — CRUD + архив/публикация/переупорядочивание
 * — Preview‐режим
 * — Autosave для черновиков
 * — Пагинация и фильтры (status, category, tag)
 */
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  /* ---------- PUBLIC ENDPOINTS ---------- */

  /**
   * Публичная лента.
   *  GET /news?status=published&category=society&page=1&pageSize=20&tags=ai,robot
   */
  @Get()
  async findAll(
    @Query('status') status = 'published',
    @Query('category') category?: string,
    @Query('tags', new ParseArrayPipe({ items: String, optional: true, separator: ',' }))
    tags?: string[],
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize = 20,
  ) {
    const { data, total } = await this.newsService.findPaginated({
      status,
      category,
      tags,
      page,
      pageSize,
    });
    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        lastPage: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Публичное получение одной статьи (только опубликованных).
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findPublishedOrFail(id);
  }

  /**
   * Preview-режим: доступен только авторизованным пользователям (админам / редакторам).
   * Позволяет видеть draft / scheduled материалы до публикации.
   */
  @Get('preview/:id')
  @UseGuards(JwtAuthGuard)
  async preview(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOneOrFail(id);
  }

  /* ---------- ADMIN (JWT) ---------- */

  /**
   * Создание новости.
   *  status: draft | published | scheduled
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateNewsDto, @Request() req) {
    return this.newsService.create(dto, req.user);
  }

  /** Обновление новости */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsDto,
    @Request() req,
  ) {
    return this.newsService.update(id, dto, req.user);
  }

  /** Автосохранение черновика (PATCH /news/123/autosave body:{content}) */
  @Patch(':id/autosave')
  @UseGuards(JwtAuthGuard)
  async autosave(
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
    @Request() req,
  ) {
    if (!content?.trim()) throw new BadRequestException('empty content');
    return this.newsService.autosaveDraft(id, content, req.user);
  }

  /** Перевод в статус «опубликовано сейчас» */
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  async publishNow(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.publishNow(id);
  }

  /** Архивация */
  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard)
  async archive(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.archive(id);
  }

  /** Удаление (по-желанию soft-delete) */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.remove(id);
  }

  /* ---------- Drag-and-drop reorder ---------- */

  /**
   * Изменение порядка карточек: принимает массив id в нужной последовательности.
   * PATCH /news/reorder  body:{ ids:[5,3,1,...] }
   */
  @Patch('reorder')
  @UseGuards(JwtAuthGuard)
  async reorder(
    @Body('ids', new ParseArrayPipe({ items: Number, separator: ',', optional: false }))
    ids: number[],
  ) {
    return this.newsService.reorder(ids);
  }
}
