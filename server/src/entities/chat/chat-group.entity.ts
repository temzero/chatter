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

  @Column()
  description: string;

  @Column()
  avatar: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'last_message_id' })
  lastMessage: Message;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'pinned_message_id' })
  pinnedMessage: Message;

  @Column()
  is_public: boolean;

  @Column()
  is_broadcast_only: boolean;
}
