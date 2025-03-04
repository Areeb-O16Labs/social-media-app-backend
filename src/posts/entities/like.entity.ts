import {
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: string;

  @ManyToOne(() => Post, (post) => post.id, { onDelete: 'CASCADE' })
  post: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}