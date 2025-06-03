// backend/src/news/dto/update-news.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import {
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { CreateNewsDto } from './create-news.dto';
import { NewsStatus } from '../entities/news.entity';

/**
 * Обновление статьи:
 *  • наследуем ВСЕ поля из CreateNewsDto (они уже Optional благодаря `PartialType`)
 *  • дополнительно дублируем status / publishAt, чтобы явно подсветить
 *    взаимосвязь (можно не дублировать, но так понятнее при автогенерации OpenAPI).
 */
export class UpdateNewsDto extends PartialType(CreateNewsDto) {
  /** Смена статуса: draft / scheduled / published / archived */
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  /** Обновление плановой даты публикации */
  @IsOptional()
  @IsDateString()
  publishAt?: string;
}
