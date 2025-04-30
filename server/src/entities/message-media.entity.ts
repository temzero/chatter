import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Message } from './message.entity';

@Entity('message_media')
export class MessageMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['image', 'video', 'audio', 'document', 'sticker', 'gif'],
  })
  type: 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'gif';

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'float', nullable: true })
  size: number; // in bytes

  @Column({ type: 'float', nullable: true })
  duration: number; // in seconds for audio/video

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @ManyToOne(() => Message, (message) => message.media)
  message: Message;
}
