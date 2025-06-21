import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { News, NewsStatus } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { User } from '../users/entities/user.entity';
import { Tag } from '../tags/entities/tag.entity';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News) private newsRepo: Repository<News>,
    @InjectRepository(Tag) private tagRepo: Repository<Tag>,
  ) {}

  private async attachTags(entity: News, tagNames?: string[]): Promise<void> {
    if (!tagNames?.length) {
      entity.tags = [];
      return;
    }
    const slugs = tagNames.map((t) => slugify(t));
    const existing = await this.tagRepo.find({ where: { slug: In(slugs) } });
    const existingMap = new Map(existing.map((t) => [t.slug, t]));
    const tags: Tag[] = [];
    for (let i = 0; i < tagNames.length; i++) {
      const name = tagNames[i].trim();
      if (!name) continue;
      const slug = slugs[i];
      let tag = existingMap.get(slug);
      if (!tag) {
        tag = await this.tagRepo.save(this.tagRepo.create({ name, slug }));
        existingMap.set(slug, tag);
      }
      tags.push(tag);
    }
    entity.tags = tags;
  }

  async create(dto: CreateNewsDto, author: User): Promise<News> {
    const { tags, ...rest } = dto;
    const news = this.newsRepo.create({
      ...rest,
      slug: dto.slug ? slugify(dto.slug) : slugify(dto.title),
      author,
    });
    await this.attachTags(news, tags);
    return this.newsRepo.save(news);
  }

  async findPaginated(opts: {
    status?: NewsStatus;
    category?: string;
    tags?: string[];
    page: number;
    pageSize: number;
  }): Promise<{ data: News[]; total: number }> {
    const qb = this.newsRepo
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.author', 'author')
      .leftJoinAndSelect('n.tags', 'tag');

    if (opts.status) qb.andWhere('n.status = :status', { status: opts.status });
    if (opts.category) qb.andWhere('n.category = :category', { category: opts.category });
    if (opts.tags?.length) qb.andWhere('tag.slug IN (:...tags)', { tags: opts.tags.map((t) => slugify(t)) });

    qb.orderBy('n.createdAt', 'DESC');

    const [data, total] = await qb
      .skip((opts.page - 1) * opts.pageSize)
      .take(opts.pageSize)
      .getManyAndCount();
    return { data, total };
  }

  async findPublishedOrFail(id: number): Promise<News> {
    const news = await this.newsRepo.findOne({ where: { id, status: NewsStatus.PUBLISHED }, relations: ['author', 'tags'] });
    if (!news) throw new NotFoundException('News not found');
    return news;
  }

  async findOneOrFail(id: number): Promise<News> {
    const news = await this.newsRepo.findOne({ where: { id }, relations: ['author', 'tags'] });
    if (!news) throw new NotFoundException('News not found');
    return news;
  }

  async update(id: number, dto: UpdateNewsDto, user: User): Promise<News> {
    const news = await this.findOneOrFail(id);
    if (news.author.id !== user.id && user.role !== 'admin') {
      throw new NotFoundException();
    }
    Object.assign(news, dto);
    if (dto.slug) news.slug = slugify(dto.slug);
    await this.attachTags(news, dto.tags);
    return this.newsRepo.save(news);
  }

  async autosaveDraft(id: number, content: string, user: User): Promise<News> {
    const news = await this.findOneOrFail(id);
    if (news.author.id !== user.id && user.role !== 'admin') {
      throw new NotFoundException();
    }
    news.content = content;
    return this.newsRepo.save(news);
  }

  async publishNow(id: number): Promise<News> {
    const news = await this.findOneOrFail(id);
    news.status = NewsStatus.PUBLISHED;
    news.publishAt = new Date();
    return this.newsRepo.save(news);
  }

  async archive(id: number): Promise<News> {
    const news = await this.findOneOrFail(id);
    news.status = NewsStatus.ARCHIVED;
    return this.newsRepo.save(news);
  }

  async remove(id: number): Promise<void> {
    await this.newsRepo.delete(id);
  }

  async reorder(ids: number[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await this.newsRepo.update(ids[i], { order: i });
    }
  }
}
