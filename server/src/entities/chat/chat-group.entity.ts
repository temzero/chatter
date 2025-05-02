import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from '../message/message.entity';

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

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
}
