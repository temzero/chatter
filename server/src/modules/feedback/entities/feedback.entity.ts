import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';
import {
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
} from '@/shared/types/enums/feedback.enum';
import { Platform } from '@/shared/types/enums/platform.enum';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User who submitted feedback
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index() // ← Index on the relationship
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  // Optional session ID for anonymous/unauthenticated feedback
  @Column({ name: 'session_id', nullable: true })
  sessionId?: string;

  // Rating (1-5 stars)
  @Column({ type: 'smallint', nullable: true })
  @Check('rating >= 1 AND rating <= 5')
  @Index()
  rating?: number;

  // Category
  @Column({
    type: 'enum',
    enum: FeedbackCategory,
    default: FeedbackCategory.OTHER,
  })
  @Index()
  category: FeedbackCategory;

  // Detailed message
  @Column({ type: 'text' })
  message: string;

  // Image URL for screenshot or attachments
  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  // Tags for categorization
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  // Status tracking
  @Column({
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.NEW,
  })
  @Index()
  status: FeedbackStatus;

  // Priority (simplified - make optional for now)
  @Column({
    type: 'enum',
    enum: FeedbackPriority,
    nullable: true,
  })
  priority?: FeedbackPriority;

  // App/platform info
  @Column({
    type: 'enum',
    enum: Platform,
    nullable: true,
  })
  platform?: Platform;

  @Column({ name: 'device_info', type: 'simple-json', nullable: true })
  deviceInfo?: {
    deviceModel?: string;
    browser?: string;
    browserVersion?: string;
    screenResolution?: string;
    language?: string;
  };

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  // App version
  @Column({ name: 'app_version', type: 'varchar', length: 20, nullable: true })
  appVersion?: string;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
