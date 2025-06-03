// backend/src/tags/tags.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { IsString, MinLength } from 'class-validator';

/* ------------------------------------------------------------------
 * DTO для создания тега
 * ---------------------------------------------------------------- */
class CreateTagDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

/**
 * TagsController
 * --------------
 *  • `GET /tags`          — публичный список всех тегов  
 *  • `GET /tags/:slug`    — получить один тег по slug  
 *  • `POST /tags`         — создать тег (только c JWT-авторизацией)  
 *  • `DELETE /tags/:id`   — удалить тег (JWT)  
 */
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /* ---------- PUBLIC ---------- */

  /** Список всех тегов (отсортирован по name ASC) */
  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  /** Получить тег по slug (`/tags/ai`) */
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.tagsService.findOneBySlug(slug);
  }

  /* ---------- ADMIN-ONLY ---------- */

  /** Создание тега — доступно только авторизованным */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto.name);
  }

  /** Удаление тега по id (JWT) */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }
}
