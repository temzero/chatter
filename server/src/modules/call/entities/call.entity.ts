import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ChatMember } from '@/modules/chat-member/entities/chat-member.entity';
import { Chat } from '@/modules/chat/entities/chat.entity';
import { CallStatus } from '@shared/types/call';
import { Message } from '@/modules/message/entities/message.entity';
import { User } from '@/modules/user/entities/user.entity';

@Entity('calls')
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // bidirectional relationship
  @OneToOne(() => Message, (message) => message.call, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  message: Message;

  @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @Column({ type: 'enum', enum: CallStatus, default: null })
  status: CallStatus;

  @ManyToOne(() => ChatMember, { eager: true })
  initiator: ChatMember;

  @ManyToMany(() => User)
  @JoinTable()
  attendedUsers: User[];

  @Column('text', { array: true, default: [] })
  currentUserIds: string[];

  @Column({ nullable: true, type: 'timestamptz' })
  startedAt?: Date | null;

  @Column({ nullable: true, type: 'timestamptz' })
  endedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
