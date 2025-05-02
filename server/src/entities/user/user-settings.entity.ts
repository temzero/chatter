import { Entity, Column, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_settings')
export class UserSettings {
  @PrimaryColumn()
  user_id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Notifications
  @Column({ default: true })
  notifications_enabled: boolean;

  @Column({ default: true })
  email_notifications: boolean;

  @Column({ default: true })
  push_notifications: boolean;

  @Column({ default: true })
  message_notifications: boolean; // Enable/disable notifications for new messages

  @Column({ default: true })
  mention_notifications: boolean; // Enable/disable notifications for mentions

  // Theme settings
  @Column({ default: 'light' })
  theme: string; // 'light' | 'dark' | 'system'

  // Language settings
  @Column({ default: 'en' })
  language: string;

  // Privacy & Security settings
  @Column({ default: 'everyone' })
  last_seen: string; // 'everyone' | 'contacts' | 'nobody'

  @Column({ default: true })
  profile_picture_visible: boolean; // Profile picture visibility

  @Column({ default: true })
  read_receipts_enabled: boolean; // Show "read" receipts

  @Column({ default: false })
  two_factor_enabled: boolean; // Enable two-factor authentication

  @Column({ default: false })
  encrypted_chats: boolean; // Enable end-to-end encryption for chats

  // Message history settings
  @Column({ default: true })
  save_chat_history: boolean; // Save message history

  @Column({ default: '30 days' })
  message_history_duration: string; // Duration to retain message history (e.g., '30 days', '1 year')

  // Font size setting
  @Column({ default: 'medium' })
  font_size: string; // 'small' | 'medium' | 'large'

  // Privacy settings
  @Column({ type: 'json', nullable: true })
  privacy_settings: Record<string, any>;

  // Timestamps
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
