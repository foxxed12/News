import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { News } from '../../news/entities/news.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  password!: string;

  @Column({ default: 'user' })
  role!: 'user' | 'admin';

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => News, (news) => news.author)
  news!: News[];
}
