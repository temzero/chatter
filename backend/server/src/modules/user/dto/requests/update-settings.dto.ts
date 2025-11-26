import {
  IsOptional,
  IsBoolean,
  IsNumber,
  IsString,
  IsEnum,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ThemePreference } from '../../constants/theme.constants';
import { NotificationPreference } from '../../constants/notification.constants';

export class UpdateSettingsDto {
  @IsOptional()
  @IsEnum(ThemePreference)
  theme?: ThemePreference;

  @IsOptional()
  @IsNumber()
  @Min(12)
  @Max(24)
  fontSize?: number;

  @IsOptional()
  @IsBoolean()
  compactMode?: boolean;

  @IsOptional()
  @IsEnum(NotificationPreference)
  messageNotifications?: NotificationPreference;

  @IsOptional()
  @IsBoolean()
  readReceiptsEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Length(2, 10)
  language?: string;
}
