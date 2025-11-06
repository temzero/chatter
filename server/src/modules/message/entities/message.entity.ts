import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Index,
  OneToMany,
  RelationId,
  OneToOne,
  JoinTable,
  ManyToMany,
  BeforeInsert,
} from 'typeorm';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { User } from '../../user/entities/user.entity';
import { Call } from 'src/modules/call/entities/call.entity';
import { Reaction } from './reaction.entity';
import { Attachment } from 'src/modules/attachment/entity/attachment.entity';
import { MessageStatus } from 'src/shared/types/enums/message-status.enum';
import { SystemEventType } from 'src/shared/types/enums/system-event-type.enum';

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

  @ManyToMany(() => Attachment, (attachment) => attachment.messages, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'message_attachments',
    joinColumn: {
      name: 'message_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'attachment_id',
      referencedColumnName: 'id',
    },
  })
  attachments: Attachment[];

  @Column('uuid', { array: true, default: () => 'ARRAY[]::uuid[]' })
  deletedForUserIds: string[];

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
  validateMessage() {
    const hasContent = !!this.content?.trim();
    const hasAttachments = this.attachments && this.attachments.length > 0;
    const hasCall = !!this.call;

    if (!hasContent && !hasAttachments && !hasCall) {
      throw new Error(
        'Message must have either content, attachments, or a call',
      );
    }
  }
}
