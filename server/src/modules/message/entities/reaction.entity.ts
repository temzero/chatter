import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  Unique,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from '../../user/entities/user.entity';

@Entity('reaction')
@Unique(['messageId', 'userId'])
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Message, (message) => message.reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({ name: 'message_id' })
  messageId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 32 })
  emoji: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @BeforeInsert()
  validateEmoji() {
    // Basic emoji validation - can be enhanced with a proper emoji validation library
    if (
      !this.emoji.match(/^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}]+$/u)
    ) {
      throw new Error('Invalid emoji reaction');
    }
  }
}
