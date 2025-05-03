import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MessageMedia } from './message-media.entity';
import { MessageMetadata } from './message-metadata.entity';
import { Chat } from '../../chat/entities/chat.entity';
import { User } from '../../user/entities/user.entity';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  reply_to_message_id: string;

  @Column({ default: 'sent' })
  status: 'sent' | 'delivered' | 'read' | 'failed';

  @Column({ type: 'jsonb', nullable: true })
  reactions: {
    [userId: string]: string;
  };

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ type: 'timestamp', nullable: true })
  edited_timestamp: Date;

  @OneToMany(() => MessageMedia, (media) => media.message, {
    cascade: true,
    nullable: true,
  })
  media_items: MessageMedia[];

  @OneToOne(() => MessageMetadata, (metadata) => metadata.message, {
    cascade: true,
    nullable: true,
  })
  metadata: MessageMetadata;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_timestamp: Date;

  constructor(partial?: Partial<Message>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  edit(newContent: string): void {
    this.content = newContent;
    this.edited_timestamp = new Date();
  }

  delete(): void {
    this.is_deleted = true;
    this.deleted_timestamp = new Date();
  }

  addReaction(userId: string, reaction: string): void {
    if (!this.reactions) {
      this.reactions = {};
    }
    this.reactions[userId] = reaction;
  }

  removeReaction(userId: string): void {
    if (this.reactions && this.reactions[userId]) {
      delete this.reactions[userId];
    }
  }
}
