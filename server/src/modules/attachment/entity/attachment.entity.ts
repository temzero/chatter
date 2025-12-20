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
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Message } from '@/modules/message/entities/message.entity';
import { AttachmentType } from '@shared/types/enums/attachment-type.enum';

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

  @Column({ type: 'varchar', length: 999, nullable: true })
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

  // Flexible, type-specific metadata
  // title?: string;
  // description?: string;
  // site_name?: string;
  // favicon?: string;
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // 🔒 ENTITY-LEVEL AUTO STRIP-OFF
  @BeforeInsert()
  @BeforeUpdate()
  private normalizeStrings() {
    if (this.url) {
      this.url = this.url.slice(0, 999);
    }

    if (this.thumbnailUrl) {
      this.thumbnailUrl = this.thumbnailUrl.slice(0, 999);
    }

    if (this.filename) {
      this.filename = this.filename.slice(0, 256);
    }

    if (this.mimeType) {
      this.mimeType = this.mimeType.slice(0, 128);
    }
  }
}
