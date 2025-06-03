// backend/src/tags/entities/tag.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { News } from '../../news/entities/news.entity';

/**
 * Сущность «Tag».
 * Используется для тематических меток у новостей (many-to-many).
 */
@Entity('tags')
export class Tag {
  /* ------------------------------------------------------------------
   *  Идентификатор
   * ---------------------------------------------------------------- */
  @PrimaryGeneratedColumn()
  id!: number;

  /* ------------------------------------------------------------------
   *  Отображаемое имя («ИИ», «Политика»…)
   * ---------------------------------------------------------------- */
  @Column({ length: 60 })
  name!: string;

  /* ------------------------------------------------------------------
   *  slug (url-friendly, уникальный)
   * ---------------------------------------------------------------- */
  @Index({ unique: true })
  @Column({ length: 80 })
  slug!: string;

  /* ------------------------------------------------------------------
   *  Связь Many-to-Many  Tag  ←→  News
   * ---------------------------------------------------------------- */
  @ManyToMany(() => News, (news) => news.tags, { eager: false })
  news!: News[];

  /* ------------------------------------------------------------------
   *  Системные временные метки
   * ---------------------------------------------------------------- */
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
