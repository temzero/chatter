import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Message } from '../../message/entities/message.entity';

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'member1_id' })
  member1: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'member2_id' })
  member2: User;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'last_message_id' })
  lastMessage: Message;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'pinned_message_id' })
  pinnedMessage: Message;
}
