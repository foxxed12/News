import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class News {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column()
  category!: string; // 'economy' | 'society' | 'science' | 'military'

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.id)
  author!: User;
}
