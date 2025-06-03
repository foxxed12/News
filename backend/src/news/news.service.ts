// backend/src/news/news.service.ts
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  In,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { News } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { User } from '../users/entities/user.entity';
import { Tag } from '../tags/entities/tag.entity';

/**
 * NewsService покрывает:
 *  • CRUD-операции для новостей
 *  • Пагинацию + фильтры (status/category/tags)
 *  • Autosave черновиков
 *  • Publish-Now / Archive
 *  • Drag-and-drop reorder (поле `order`)
 */
@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News) private newsRepo: Repository<News>,
    @InjectRepository(Tag) private tagRepo: Repository<Tag>,
    private readonly dataSource: DataSource,
  ) {}

  /* ------------------------------------------------------------------
   * helpers
   * ---------------------------------------------------------------- */

  private qbBase(): SelectQueryBuilder<News> {
    return this.newsRepo
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.author', 'author')
      .leftJoinAndSelect('n.tags', 'tag');
  }

  private async attachTags(entity: News, tagNames?: string[]) {
    if (!tagNames?.length
