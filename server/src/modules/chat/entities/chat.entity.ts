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
import { ChatType } from '@shared/types/enums/chat-type.enum';
import { ChatMember } from '@/modules/chat-member/entities/chat-member.entity';
import { InviteLink } from '@/modules/invite-link/entities/invite-link.entity';

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ChatType,
    default: ChatType.DIRECT,
  })
  type: ChatType;

  @OneToMany(() => ChatMember, (member) => member.chat)
  members: ChatMember[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @ManyToOne(() => Message, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pinned_message_id' })
  pinnedMessage: Message | null;

  @Column({ type: 'varchar', nullable: true, length: 64 })
  name: string | null;

  @Column({ type: 'varchar', nullable: true, length: 512 })
  description: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ default: false, nullable: true })
  is_public?: boolean;

  @Column({ default: true, nullable: true })
  is_broadcast_only?: boolean;

  @OneToMany(() => InviteLink, (invite) => invite.chat)
  inviteLinks: InviteLink[];

  /* Timestamps with timezone */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
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

    if (this.avatarUrl) {
      this.avatarUrl = this.avatarUrl.trim();
      if (this.avatarUrl === '') this.avatarUrl = null;
    }
  }
}
