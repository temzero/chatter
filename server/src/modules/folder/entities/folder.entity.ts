import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('folder')
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.folders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  color: string | null;

  @Column({ type: 'simple-array' })
  types: string[]; // ["direct", "group", "channel"]

  @ManyToMany(() => Chat, (chat) => chat.folders)
  @JoinTable({
    name: 'folder_chats',
    joinColumn: { name: 'folder_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'chat_id', referencedColumnName: 'id' },
  })
  chats: Chat[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
