// create-feedback.dto.ts
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  IsArray,
  ArrayNotEmpty,
  IsUrl,
  Length,
} from 'class-validator';
import {
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
} from '@/shared/types/enums/feedback.enum';
import { Platform } from '@/shared/types/enums/platform.enum';
import { Type } from 'class-transformer';
import { DeviceInfoDto } from './device-info.dto';

export class CreateFeedbackDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating?: number;

  @IsEnum(FeedbackCategory)
  category: FeedbackCategory;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags?: string[];

  // Status is typically set by the system, not by user
  @IsOptional()
  @IsEnum(FeedbackStatus)
  status?: FeedbackStatus = FeedbackStatus.NEW;

  @IsOptional()
  @IsEnum(FeedbackPriority)
  priority?: FeedbackPriority;

  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  deviceInfo?: DeviceInfoDto;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  appVersion?: string;
}
