// feedback.entity.ts
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
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  // Optional session ID for anonymous/unauthenticated feedback
  @Column({ name: 'session_id', nullable: true })
  sessionId?: string;

  // Rating (1-5 stars)
  @Column({ type: 'smallint', nullable: true })
  @Check('rating >= 1 AND rating <= 5')
  rating?: number;

  // Category
  @Column({
    type: 'enum',
    enum: FeedbackCategory,
    default: FeedbackCategory.OTHER,
  })
  category: FeedbackCategory;

  // Detailed message
  @Column({ type: 'text', nullable: true })
  message?: string;

  // Tags for categorization
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  // Status tracking
  @Column({
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.NEW,
  })
  status: FeedbackStatus;

  // Priority
  @Column({
    type: 'enum',
    enum: FeedbackPriority,
    nullable: true,
  })
  priority?: FeedbackPriority;

  // Who is assigned to handle this feedback
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo?: User;

  @Column({ name: 'assigned_to', nullable: true })
  assignedToId?: string;

  // Which team should handle it
  @Column({ nullable: true })
  team?: string;

  // Admin response
  @Column({ name: 'admin_response', type: 'text', nullable: true })
  adminResponse?: string;

  @Column({ name: 'responded_at', nullable: true })
  respondedAt?: Date;

  // App/platform info
  @Column({ name: 'app_version', length: 20, nullable: true })
  appVersion?: string;

  @Column({
    type: 'enum',
    enum: Platform,
    nullable: true,
  })
  platform?: Platform;

  @Column({ name: 'os_version', length: 50, nullable: true })
  osVersion?: string;

  @Column({ name: 'device_info', type: 'simple-json', nullable: true })
  deviceInfo?: {
    deviceModel?: string;
    browser?: string;
    browserVersion?: string;
    screenResolution?: string;
    language?: string;
  };

  // Attachment
  @Column({ name: 'screenshot_url', length: 500, nullable: true })
  imageUrl?: string;

  // Page/URL context
  @Column({ name: 'page_url', length: 500, nullable: true })
  pageUrl?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Indexes
  @Index()
  @Column({ name: 'user_id' })
  private _userIdIndex: string;

  @Index()
  @Column({ name: 'status' })
  private _statusIndex: string;

  @Index()
  @Column({ name: 'created_at' })
  private _createdAtIndex: string;

  @Index()
  @Column({ name: 'rating', nullable: true })
  private _ratingIndex: number;

  @Index()
  @Column({ name: 'category' })
  private _categoryIndex: string;
}
