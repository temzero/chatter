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
  OneToMany,
} from 'typeorm';
import { Message } from '../../message/entities/message.entity';
import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';
import { ChatType } from '../constants/chat-types.constants';

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ChatType,
    default: ChatType.PRIVATE,
  })
  type: ChatType;

  @OneToMany(() => ChatMember, (member) => member.chat)
  members: ChatMember[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'last_message_id' })
  lastMessage: Message | null;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'pinned_message_id' })
  pinnedMessage: Message | null;

  /* Group-Specific Fields (nullable) */
  @Column({ nullable: true, length: 128 })
  name: string | null;

  @Column({ nullable: true, length: 512 })
  description: string | null;

  @Column({ nullable: true, length: 2048 })
  avatar: string | null;

  @Column({ default: false, nullable: true })
  is_public?: boolean;

  @Column({ default: false, nullable: true })
  is_broadcast_only?: boolean;

  /* Timestamps */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  trimStrings() {
    // Trim all string fields and convert empty strings to null
    if (this.name) {
      this.name = this.name.trim();
      if (this.name === '') this.name = null;
    }

    if (this.description) {
      this.description = this.description.trim();
      if (this.description === '') this.description = null;
    }

    if (this.avatar) {
      this.avatar = this.avatar.trim();
      if (this.avatar === '') this.avatar = null;
    }
  }
}
