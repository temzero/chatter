import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  Index,
  OneToMany,
} from 'typeorm';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { User } from '../../user/entities/user.entity';
import { Reaction } from './reaction.entity';
import { Attachment } from './attachment.entity';
import { MessageType } from '../constants/message-type.constants';
import { MessageStatus } from '../constants/message-status.constants';

@Entity('message')
@Index(['chatId']) // Index for faster chat message queries
@Index(['senderId']) // Index for faster sender queries
@Index(['deletedAt']) // Index for soft delete queries
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @Column({ name: 'chat_id' })
  chatId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'sender_id' })
  senderId: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean;

  @Column({ name: 'pinned_at', nullable: true })
  pinnedAt: Date | null;

  @Column({ name: 'reply_to_message_id', nullable: true })
  replyToMessageId: string | null;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'reply_to_message_id' })
  replyToMessage: Message | null;

  @Column({ name: 'reply_count', default: 0 })
  replyCount: number;

  @Column({ name: 'edited_at', nullable: true })
  editedAt: Date | null;

  @OneToMany(() => Reaction, (reaction) => reaction.message)
  reactions: Reaction[];

  @OneToMany(() => Attachment, (attachment) => attachment.message)
  attachments: Attachment[];

  @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  validateContent() {
    if (this.type === MessageType.TEXT && !this.content?.trim()) {
      throw new Error('Text messages must have content');
    }

    if (this.content) {
      this.content = this.content.trim();
      if (this.content === '') this.content = null;
    }
  }

  @BeforeUpdate()
  setEditedAt() {
    if (this.status === MessageStatus.EDITED && !this.editedAt) {
      this.editedAt = new Date();
    }
  }
}
