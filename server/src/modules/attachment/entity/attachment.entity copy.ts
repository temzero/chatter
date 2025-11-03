// // src/modules/attachment/entities/attachment.entity.ts
// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   ManyToOne,
//   JoinColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   Index,
// } from 'typeorm';
// import { Message } from 'src/modules/message/entities/message.entity';
// import { AttachmentType } from 'src/shared/types/enums/attachment-type.enum';

// @Entity('attachment')
// @Index(['chatId']) // Index for fast chat-based queries
// @Index(['chatId', 'createdAt']) // Composite index for pagination
// export class Attachment {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @ManyToOne(() => Message, (message) => message.attachments, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'message_id' })
//   message: Message;

//   @Column({ name: 'message_id' })
//   messageId: string;

//   @Column({ name: 'chat_id' })
//   chatId: string;

//   @Column({
//     type: 'enum',
//     enum: AttachmentType,
//   })
//   type: AttachmentType;

//   @Column({ length: 512 })
//   url: string;

//   @Column({ type: 'varchar', length: 512, nullable: true })
//   thumbnailUrl: string | null;

//   @Column({ type: 'varchar', length: 256, nullable: true })
//   filename: string | null;

//   @Column({ type: 'int', nullable: true })
//   size: number | null;

//   @Column({ type: 'varchar', length: 128, nullable: true })
//   mimeType: string | null;

//   @Column({ type: 'int', nullable: true })
//   width: number | null;

//   @Column({ type: 'int', nullable: true })
//   height: number | null;

//   @Column({ type: 'int', nullable: true })
//   duration: number | null;

//   @Column({ type: 'json', nullable: true })
//   metadata: Record<string, any> | null;

//   @CreateDateColumn({ name: 'created_at' })
//   createdAt: Date;

//   @UpdateDateColumn({ name: 'updated_at' })
//   updatedAt: Date;
// }
