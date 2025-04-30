import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MessageMedia } from './message-media.entity';
import { MessageMetadata } from './message-metadata.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  senderId: string;

  @Column()
  @Index()
  chatId: string;

  @Column({ nullable: true })
  content: string;

  @OneToMany(() => MessageMedia, (media) => media.message, { cascade: true })
  media: MessageMedia[];

  @OneToOne(() => MessageMetadata, (metadata) => metadata.message, {
    cascade: true,
  })
  metadata: MessageMetadata;

  @Column({ nullable: true })
  replyToMessageId: string;

  @Column({ default: 'sent' })
  status: 'sent' | 'delivered' | 'read' | 'failed';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ type: 'timestamp', nullable: true })
  editedTimestamp: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedTimestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  reactions: {
    [userId: string]: string;
  };

  // @Column({ type: 'jsonb', nullable: true })
  // metadata: {
  //   linkPreview?: {
  //     url: string;
  //     title?: string;
  //     description?: string;
  //     image?: string;
  //     siteName?: string;
  //   };
  //   mentions?: string[];
  //   hashtags?: string[];
  //   isPinned?: boolean;
  //   pinnedBy?: string;
  //   pinnedTimestamp?: Date;
  // };

  constructor(partial?: Partial<Message>) {
    if (partial) {
      Object.assign(this, partial);
    }

    if (!this.id) {
      this.id = uuidv4();
    }
    if (!this.timestamp) {
      this.timestamp = new Date();
    }
    if (!this.status) {
      this.status = 'sent';
    }
    if (!this.isDeleted) {
      this.isDeleted = false;
    }
  }

  edit(newContent: string): void {
    this.content = newContent;
    this.editedTimestamp = new Date();
  }

  delete(): void {
    this.isDeleted = true;
    this.deletedTimestamp = new Date();
  }

  addReaction(userId: string, reaction: string): void {
    if (!this.reactions) {
      this.reactions = {};
    }
    this.reactions[userId] = reaction;
  }

  removeReaction(userId: string): void {
    if (this.reactions && this.reactions[userId]) {
      delete this.reactions[userId];
    }
  }
}
