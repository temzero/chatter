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
} from 'typeorm';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { User } from '../../user/entities/user.entity';
import { Message } from 'src/modules/message/entities/message.entity';
import { ChatMemberRole } from '../constants/chat-member-roles.constants';
import { ChatMemberStatus } from '../constants/chat-member-status.constants';

@Entity('chat_member')
@Index(['chatId', 'userId'], { unique: true }) // Ensure a user can only be in a chat once
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

  @Column({ nullable: true, length: 128 })
  nickname: string | null;

  @Column({ name: 'custom_title', nullable: true, length: 64 })
  customTitle: string | null;

  @Column({ name: 'muted_until', nullable: true, type: 'timestamp' })
  mutedUntil: Date | null;

  @Column({
    name: 'joined_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joinedAt: Date;

  @Column({ name: 'last_read_message_id', nullable: true })
  lastReadMessageId: string | null;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'last_read_message_id' })
  lastReadMessage: Message | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  trimStrings() {
    if (this.nickname) {
      this.nickname = this.nickname.trim();
      if (this.nickname === '') this.nickname = null;
    }

    if (this.customTitle) {
      this.customTitle = this.customTitle.trim();
      if (this.customTitle === '') this.customTitle = null;
    }
  }
}
