import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Message } from './message.entity';

@Entity('message_metadata')
export class MessageMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: true })
  linkPreview: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
  };

  @Column({ type: 'simple-array', nullable: true })
  mentions: string[];

  @Column({ type: 'simple-array', nullable: true })
  hashtags: string[];

  @Column({ default: false })
  isPinned: boolean;

  @Column({ nullable: true })
  pinnedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  pinnedTimestamp: Date;

  @OneToOne(() => Message, (message) => message.metadata)
  message: Message;
}
