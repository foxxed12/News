// backend/src/news/dto/create-news.dto.ts

import {
  IsString,
  IsOptional,
  IsIn,
  IsEnum,
  MinLength,
  MaxLength,
  IsDateString,
  IsUrl,
  IsArray,
  ArrayUnique,
} from 'class-validator';
import { NewsStatus } from '../entities/news.entity';

export class CreateNewsDto {
  /* ------------------------------------------------------------------
   *  Основные поля
   * ---------------------------------------------------------------- */

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  /** HTML-контент из WYSIWYG-редактора */
  @IsString()
  @MinLength(10)
  content!: string;

  @IsString()
  @IsIn(['economy', 'society', 'science', 'military'])
  category!: 'economy' | 'society' | 'science' | 'military';

  /** Обложка (URL).  Optional */
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  /* ------------------------------------------------------------------
   *  SEO-метаданные
   * ---------------------------------------------------------------- */

  /** slug можно указать явно; если не передан — сгенерируется из title */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  keywords?: string;

  /* ------------------------------------------------------------------
   *  Теги
   * ---------------------------------------------------------------- */

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[]; // например: ["ai", "robotics"]

  /* ------------------------------------------------------------------
   *  Публикация / Черновик / Расписание
   * ---------------------------------------------------------------- */

  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus; // default — draft (см. entity)

  @IsOptional()
  @IsDateString()
  publishAt?: string; // ISO-строка (только если status==='scheduled')
}
