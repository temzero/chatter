import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ChatGroup } from './chat-group.entity';
import { User } from '../user/user.entity';

@Entity('chat_group_member')
export class ChatGroupMember {
  @PrimaryColumn()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ChatGroup)
  @JoinColumn({ name: 'chat_group_id' })
  chatGroup: ChatGroup;

  @Column()
  is_admin: boolean;

  @Column()
  is_banned: boolean;

  @Column({ nullable: true })
  muted_until: string;

  @Column()
  avatar: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joined_at: Date;
}
