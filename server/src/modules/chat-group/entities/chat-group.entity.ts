import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from '../../message/entities/message.entity';

@Entity('chat_group')
export class ChatGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // 'group' | 'channel'

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  avatar?: string;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'last_message_id' })
  lastMessage?: Message;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'pinned_message_id' })
  pinnedMessage?: Message;

  @Column()
  is_public: boolean;

  @Column()
  is_broadcast_only: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
