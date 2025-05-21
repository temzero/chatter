export type Theme = "light" | "dark" | "system";
export type LastSeenSetting = "everyone" | "contacts" | "nobody";
export type FontSize = "small" | "medium" | "large";

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  birthday?: string; // ISO string format for consistency
  bio?: string;
  status?: string;
  last_seen?: string;
  created_at: string;
  updated_at: string;
  is_email_verified: boolean;
  is_deleted: boolean;
  deleted_at?: string;
}

export interface UserSettings {
  user_id: string;
  user: Pick<User, "id" | "username" | "email" | "avatar">;

  // Notifications
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  message_notifications: boolean;
  mention_notifications: boolean;

  // Theme, language, and privacy
  theme: Theme;
  language: string;
  last_seen: LastSeenSetting;
  profile_picture_visible: boolean;
  read_receipts_enabled: boolean;

  // Security
  two_factor_enabled: boolean;
  encrypted_chats: boolean;

  // History
  save_chat_history: boolean;
  message_history_duration: string;

  // Display
  font_size: FontSize;

  // Advanced privacy
  privacy_settings?: Record<string, unknown>;

  // Timestamps
  created_at: string;
  updated_at: string;
}
