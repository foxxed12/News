// backend/src/tags/tags.service.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Tag } from './entities/tag.entity';

/**
 * TagsService
 * ----------
 *  • CRUD-операции для тегов (create / list / delete)  
 *  • Вспомогательный метод `ensureTags()` — создаёт недостающие
 *    и возвращает массив сущностей Tag (используется в NewsService).  
 */
@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
  ) {}

  /* ------------------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------------- */

  /** Простейший slugify без сторонних зависимостей */
  private slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-') // не буквы/цифры → «-»
      .replace(/(^-|-$)+/g, '');   // убираем начальные/конечные «-»
  }

  /* ------------------------------------------------------------------
   * CRUD
   * ---------------------------------------------------------------- */

  /** Список всех тегов */
  findAll(): Promise<Tag[]> {
    return this.tagRepo.find({ order: { name: 'ASC' } });
  }

  /** Найти по slug (404, если нет) */
  async findOneBySlug(slug: string): Promise<Tag> {
    const tag = await this.tagRepo.findOne({ where: { slug } });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  /** Создать тег (или вернуть существующий) */
  async create(rawName: string): Promise<Tag> {
    const name = rawName.trim();
    if (!name) {
      throw new BadRequestException('Empty tag name');
    }

    const slug = this.slugify(name);
    let tag = await this.tagRepo.findOne({ where: { slug } });

    if (!tag) {
      tag = this.tagRepo.create({ name, slug });
      tag = await this.tagRepo.save(tag);
    }
    return tag;
  }

  /** Удалить тег (если нужен soft-delete — замените на update flag) */
  async remove(id: number): Promise<void> {
    await this.tagRepo.delete(id);
  }

  /* ------------------------------------------------------------------
   *  Utils для NewsService
   * ---------------------------------------------------------------- */

  /**
   * Принимает массив имен тегов, гарантирует, что они есть в БД,
   * и возвращает массив сущностей Tag в том же порядке.
   */
  async ensureTags(names: string[]): Promise<Tag[]> {
    if (!names.length) return [];

    const slugs = names.map((n) => this.slugify(n));
    // Шаг 1: найти уже существующие
    const existing = await this.tagRepo.find({ where: { slug: In(slugs) } });
    const existingMap = new Map(existing.map((t) => [t.slug, t]));

    const result: Tag[] = [];

    // Шаг 2: пройтись по исходному массиву, создавая недостающие
    for (let i = 0; i < names.length; i++) {
      const name = names[i].trim();
      if (!name) continue;

      const slug = slugs[i];
      let tag = existingMap.get(slug);

      if (!tag) {
        tag = await this.create(name); // создаст и вернёт
        existingMap.set(slug, tag);
      }
      result.push(tag);
    }

    return result;
  }
}
