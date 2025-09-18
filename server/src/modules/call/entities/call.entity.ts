import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { CallStatus } from '../type/callStatus';
import { Message } from 'src/modules/message/entities/message.entity';

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

  @Column({ type: 'int', default: 0 })
  maxParticipants: number;

  @ManyToOne(() => ChatMember, { eager: true })
  initiator: ChatMember;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
