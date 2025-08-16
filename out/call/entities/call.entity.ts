import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// entities/call.entity.ts
@Entity('call')
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  chatId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'initiator_id' })
  initiator: User;

  @Column({ name: 'initiator_id' })
  initiatorId: string;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ nullable: true })
  duration: number; // in seconds

  @Column({ default: false })
  isVideo: boolean;

  @Column({ default: false })
  isGroup: boolean;

  @ManyToMany(() => ChatMember)
  @JoinTable({
    name: 'call_chat_members', // More explicit join table name
    joinColumn: {
      name: 'call_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'chat_member_id', // Matches your existing table
      referencedColumnName: 'id',
    },
  })
  chatMembers: ChatMember[]; // Changed from participants to chatMembers

  @Column({ nullable: true })
  messageId: string; // Reference to system message

  @Column('jsonb', { nullable: true })
  stats: {
    packetsLost?: number;
    jitter?: number;
    rtt?: number;
  };
}
