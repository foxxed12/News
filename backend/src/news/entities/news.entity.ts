// backend/src/news/entities/news.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tag } from '../../tags/entities/tag.entity';

/** Возможные состояния статьи */
export enum NewsStatus {
  DRAFT      = 'draft',
  SCHEDULED  = 'scheduled',
  PUBLISHED  = 'published',
  ARCHIVED   = 'archived',
}

@Entity('news')
export class News {
  /* ------------------------------------------------------------------
   *  Идентификатор
   * ---------------------------------------------------------------- */
  @PrimaryGeneratedColumn()
  id!: number;

  /* ------------------------------------------------------------------
   *  SEO-slug   ( /news/my-first-post )
   * ---------------------------------------------------------------- */
  @Index({ unique: true })
  @Column({ length: 200 })
  slug!: string;

  /* ------------------------------------------------------------------
   *  Основные поля
   * ---------------------------------------------------------------- */
  @Column()
  title!: string;

  /** HTML-контент, полученный из WYSIWYG-редактора  */
  @Column({ type: 'text' })
  content!: string;

  /** Обложка / постер к новости (URL) */
  @Column({ nullable: true })
  coverImageUrl!: string | null;

  @Column({ type: 'varchar', length: 32 })
  category!: 'economy' | 'society' | 'science' | 'military';

  /* ------------------------------------------------------------------
   *  SEO-метаданные
   * ---------------------------------------------------------------- */
  @Column({ type: 'varchar', length: 300, nullable: true })
  description!: string | null;        // <meta name="description">

  @Column({ type: 'varchar', length: 400, nullable: true })
  keywords!: string | null;           // <meta name="keywords">

  /* ------------------------------------------------------------------
   *  Публикация / архивирование
   * ---------------------------------------------------------------- */
  @Column({ type: 'enum', enum: NewsStatus, default: NewsStatus.DRAFT })
  status!: NewsStatus;

  /** Плановая дата публикации, актуальна для status = 'scheduled' */
  @Column({ type: 'timestamp', nullable: true })
  publishAt!: Date | null;

  /** Ручной приоритет при выводе (drag-and-drop reorder) */
  @Column({ type: 'int', default: 0 })
  order!: number;

  /* ------------------------------------------------------------------
   *  Связи
   * ---------------------------------------------------------------- */
  @ManyToOne(() => User, (user) => user.news, {
    eager: false,
    onDelete: 'SET NULL',
  })
  author!: User;

  /** Теги (many-to-many) */
  @ManyToMany(() => Tag, (tag) => tag.news, { cascade: true, eager: true })
  @JoinTable({
    name: 'news_tags',
    joinColumn: { name: 'news_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: Tag[];

  /* ------------------------------------------------------------------
   *  Системные временные метки
   * ---------------------------------------------------------------- */
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
