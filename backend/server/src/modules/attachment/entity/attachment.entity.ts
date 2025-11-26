// src/modules/attachment/entities/attachment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Message } from 'src/modules/message/entities/message.entity';
import { AttachmentType } from 'src/shared/types/enums/attachment-type.enum';

@Entity('attachment')
@Index(['url'])
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => Message, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'message_attachments', // Join table name
    joinColumn: {
      name: 'attachment_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'message_id',
      referencedColumnName: 'id',
    },
  })
  messages: Message[];

  @Column({
    type: 'enum',
    enum: AttachmentType,
  })
  type: AttachmentType;

  @Column({ length: 999 })
  url: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  filename: string | null;

  @Column({ type: 'int', nullable: true })
  size: number | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  mimeType: string | null;

  @Column({ type: 'int', nullable: true })
  width: number | null;

  @Column({ type: 'int', nullable: true })
  height: number | null;

  @Column({ type: 'int', nullable: true })
  duration: number | null;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
