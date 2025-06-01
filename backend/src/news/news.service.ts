import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  create(dto: CreateNewsDto, user: User) {
    if (!user) throw new Error('User not found');
    const news = this.newsRepository.create({ ...dto, author: user });
    return this.newsRepository.save(news);
  }

  findAll() {
    return this.newsRepository.find({ relations: ['author'] });
  }

  findOne(id: number) {
    return this.newsRepository.findOne({ where: { id }, relations: ['author'] });
  }
}
