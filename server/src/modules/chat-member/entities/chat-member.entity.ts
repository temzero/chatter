import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Index,
} from 'typeorm';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { User } from '../../user/entities/user.entity';
import { ChatMemberRole } from '../constants/chat-member-roles.constants';
import { ChatMemberStatus } from '../constants/chat-member-status.constants';
import { Message } from 'src/modules/message/entities/message.entity';

@Entity('chat_member')
@Index(['chatId', 'userId'], { unique: true })
export class ChatMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Chat, (chat) => chat.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @Column({ name: 'chat_id' })
  chatId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ChatMemberRole,
    default: ChatMemberRole.MEMBER,
  })
  role: ChatMemberRole;

  @Column({
    type: 'enum',
    enum: ChatMemberStatus,
    default: ChatMemberStatus.ACTIVE,
  })
  status: ChatMemberStatus;

  @Column({ type: 'varchar', nullable: true, length: 32 })
  nickname: string | null;

  @Column({ name: 'custom_title', type: 'varchar', nullable: true, length: 64 })
  customTitle: string | null;

  @Column({ name: 'muted_until', nullable: true, type: 'timestamp' })
  mutedUntil: Date | null;

  @Column({ name: 'last_read_message_id', type: 'varchar', nullable: true })
  lastReadMessageId: string | null;

  @ManyToOne(() => Message, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'last_visible_message_id' })
  lastVisibleMessage: Message | null;

  @Column({ name: 'last_visible_message_id', type: 'uuid', nullable: true })
  lastVisibleMessageId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
