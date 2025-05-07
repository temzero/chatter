import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Message } from '../../message/entities/message.entity';

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'member1_id' })
  member1: User;

  @Column({ type: 'varchar', nullable: true })
  member1_nickname: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'member2_id' })
  member2: User;

  @Column({ type: 'varchar', nullable: true })
  member2_nickname: string;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'last_message_id' })
  lastMessage: Message | null;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'pinned_message_id' })
  pinnedMessage: Message | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
