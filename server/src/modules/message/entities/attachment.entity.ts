import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { AttachmentType } from 'src/shared/types/enums/attachment-type.enum';

@Entity('attachment')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Message, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({ name: 'message_id' })
  messageId: string;

  @Column({
    type: 'enum',
    enum: AttachmentType,
  })
  type: AttachmentType;

  @Column({ length: 512 })
  url: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  filename: string | null;

  @Column({ type: 'int', nullable: true })
  size: number | null; // in bytes

  @Column({ type: 'varchar', length: 128, nullable: true })
  mimeType: string | null;

  @Column({ type: 'int', nullable: true })
  width: number | null; // for images/videos

  @Column({ type: 'int', nullable: true })
  height: number | null; // for images/videos

  @Column({ type: 'int', nullable: true })
  duration: number | null; // in seconds for audio/video

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
