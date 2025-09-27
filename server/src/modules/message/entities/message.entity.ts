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
  RelationId,
  OneToOne,
} from 'typeorm';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { User } from '../../user/entities/user.entity';
import { Call } from 'src/modules/call/entities/call.entity';
import { Reaction } from './reaction.entity';
import { Attachment } from './attachment.entity';
import { MessageStatus } from '../constants/message-status.constants';
import { SystemEventType } from '../constants/system-event-type.constants';

@Entity('message')
@Index(['chatId']) // Index for faster chat message queries
@Index(['senderId']) // Index for faster sender queries
@Index(['createdAt']) // Index for faster unread count queries
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
    type: 'varchar',
    nullable: true,
    length: 3000,
  })
  content: string | null;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean;

  @Column({ name: 'pinned_at', nullable: true, type: 'timestamp' })
  pinnedAt: Date | null;

  // @Column({ name: 'reply_to_message_id', nullable: true })
  @RelationId((message: Message) => message.replyToMessage)
  replyToMessageId: string | null;

  @ManyToOne(() => Message, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reply_to_message_id' })
  replyToMessage: Message | null;

  // @Column({ name: 'forwarded_from_message_id', nullable: true })
  @RelationId((message: Message) => message.forwardedFromMessage)
  forwardedFromMessageId: string | null;

  @ManyToOne(() => Message, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'forwarded_from_message_id' })
  forwardedFromMessage: Message | null;

  @Column({ name: 'reply_count', default: 0 })
  replyCount: number;

  @Column({ name: 'edited_at', nullable: true, type: 'timestamp' })
  editedAt: Date | null;

  @OneToMany(() => Reaction, (reaction) => reaction.message)
  reactions: Reaction[];

  @OneToMany(() => Attachment, (attachment) => attachment.message, {
    cascade: ['insert', 'update'], // <- enable cascading saves
  })
  attachments: Attachment[];

  @Column({
    name: 'deleted_for_userIds',
    type: 'jsonb',
    nullable: true,
    default: null,
  })
  deletedForUserIds: string[] | null;

  @Column({ default: false })
  isImportant: boolean;

  @Column({ type: 'enum', enum: SystemEventType, nullable: true })
  systemEvent: SystemEventType | null;

  // bidirectional relationship
  @OneToOne(() => Call, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'call_id' })
  call?: Call;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  validateContent() {
    // Skip validation if this is a delete operation
    if (
      this.isDeleted ||
      this.deletedAt ||
      this.deletedForUserIds ||
      this.systemEvent ||
      this.call ||
      (Object.keys(this).length === 2 &&
        'isPinned' in this &&
        'pinnedAt' in this)
    ) {
      return;
    }
    // Trim content if it exists
    if (this.content) {
      this.content = this.content.trim();
      if (this.content === '') {
        this.content = null;
      }
    }

    const hasText = !!this.content;
    const hasAttachments =
      Array.isArray(this.attachments) && this.attachments.length > 0;
    const hasForward = !!this.forwardedFromMessageId;

    if (!hasText && !hasAttachments && !hasForward) {
      throw new Error(
        'Message must contain either text content, at least one attachment, or a forwarded message reference',
      );
    }
  }
}
