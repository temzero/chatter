import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Message } from './message.entity';

@Entity('message_metadata')
export class MessageMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Message, (message) => message.metadata)
  message: Message;

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
}
