import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ThemePreference } from '../constants/theme.constants';
import { NotificationPreference } from '../constants/notification.constants';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  // Display Preferences
  @Column({
    type: 'enum',
    enum: ThemePreference,
    default: ThemePreference.SYSTEM,
  })
  theme: ThemePreference;

  @Column({ name: 'font_size', default: 16 })
  fontSize: number; // in pixels

  @Column({ name: 'compact_mode', default: false })
  compactMode: boolean;

  // Notification Preferences
  @Column({
    type: 'enum',
    enum: NotificationPreference,
    default: NotificationPreference.ALL,
    name: 'message_notifications',
  })
  messageNotifications: NotificationPreference;

  @Column({
    type: 'enum',
    enum: NotificationPreference,
    default: NotificationPreference.ALL,
    name: 'reaction_notifications',
  })
  reactionNotifications: NotificationPreference;

  @Column({ name: 'notification_sound', default: true })
  notificationSound: boolean;

  @Column({ name: 'notification_vibrate', default: true })
  notificationVibrate: boolean;

  @Column({ name: 'notification_badge', default: true })
  notificationBadge: boolean;

  // Privacy Settings
  @Column({ name: 'online_status_visible', default: true })
  onlineStatusVisible: boolean;

  @Column({ name: 'read_receipts_enabled', default: true })
  readReceiptsEnabled: boolean;

  @Column({ name: 'typing_indicators_enabled', default: true })
  typingIndicatorsEnabled: boolean;

  @Column({ name: 'last_seen_visible', default: true })
  lastSeenVisible: boolean;

  // Message Preferences
  @Column({ name: 'message_preview', default: true })
  messagePreview: boolean;

  @Column({ name: 'auto_download_media', default: true })
  autoDownloadMedia: boolean;

  @Column({ name: 'save_to_camera_roll', default: false })
  saveToCameraRoll: boolean;

  // Language & Region
  @Column({ length: 10, default: 'en' })
  language: string;

  @Column({ length: 10, nullable: true })
  timezone: string | null;

  // Advanced Settings
  @Column({ name: 'auto_lock_enabled', default: false })
  autoLockEnabled: boolean;

  @Column({ name: 'auto_lock_timeout', nullable: true })
  autoLockTimeout: number | null; // in minutes

  @Column({ name: 'biometric_auth', default: false })
  biometricAuth: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customPreferences: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper method to get all settings as a plain object
  toJSON() {
    return {
      theme: this.theme,
      fontSize: this.fontSize,
      compactMode: this.compactMode,
      messageNotifications: this.messageNotifications,
      reactionNotifications: this.reactionNotifications,
      notificationSound: this.notificationSound,
      notificationVibrate: this.notificationVibrate,
      notificationBadge: this.notificationBadge,
      onlineStatusVisible: this.onlineStatusVisible,
      readReceiptsEnabled: this.readReceiptsEnabled,
      typingIndicatorsEnabled: this.typingIndicatorsEnabled,
      lastSeenVisible: this.lastSeenVisible,
      messagePreview: this.messagePreview,
      autoDownloadMedia: this.autoDownloadMedia,
      saveToCameraRoll: this.saveToCameraRoll,
      language: this.language,
      timezone: this.timezone,
      autoLockEnabled: this.autoLockEnabled,
      autoLockTimeout: this.autoLockTimeout,
      biometricAuth: this.biometricAuth,
      customPreferences: this.customPreferences,
    };
  }
}
