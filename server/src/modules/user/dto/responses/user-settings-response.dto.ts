import { Expose } from 'class-transformer';
import { ThemePreference } from '../../constants/theme.constants';
import { NotificationPreference } from '../../constants/notification.constants';

export class UserSettingsResponseDto {
  @Expose()
  theme: ThemePreference;

  @Expose()
  fontSize: number;

  @Expose()
  compactMode: boolean;

  @Expose()
  messageNotifications: NotificationPreference;

  @Expose()
  notificationSound: boolean;

  @Expose()
  readReceiptsEnabled: boolean;

  @Expose()
  language: string;

  @Expose()
  timezone?: string;

  @Expose()
  biometricAuth: boolean;
}
