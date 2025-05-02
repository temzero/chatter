import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ChatGroup } from './chat-group.entity';
import { User } from '../user/user.entity';

@Entity('chat_group_member')
export class ChatGroupMember {
  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn()
  chat_group_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ChatGroup)
  @JoinColumn({ name: 'chat_group_id' })
  chatGroup: ChatGroup;

  @Column({ default: false })
  is_admin: boolean;

  @Column({ default: false })
  is_banned: boolean;

  @Column({ nullable: true })
  muted_until: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joined_at: Date;
}
