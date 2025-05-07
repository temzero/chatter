import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatGroup } from '../../chat-group/entities/chat-group.entity';
import { User } from '../../user/entities/user.entity';

@Entity('chat_group_member')
export class ChatGroupMember {
  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn()
  chat_group_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  nickname: string;

  @ManyToOne(() => ChatGroup)
  @JoinColumn({ name: 'chat_group_id' })
  chatGroup: ChatGroup;

  @Column({ default: false })
  is_admin: boolean;

  @Column({ default: false })
  is_banned: boolean;

  @Column({ type: 'timestamp', nullable: true })
  muted_until: Date; // Changed from string to Date

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date; // Using CreateDateColumn for automatic timestamp

  // Optional: If you need to track last update
  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt?: Date;
}
