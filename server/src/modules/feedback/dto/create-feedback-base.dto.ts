// create-feedback-base.dto.ts
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
  Min,
  Max,
  IsUrl,
  IsObject,
  ValidateNested,
  IsIP,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  FeedbackCategory,
  FeedbackPriority,
} from '@/shared/types/enums/feedback.enum';
import { Platform } from '@/shared/types/enums/platform.enum';
import { DeviceInfoDto } from './device-info.dto';

export class CreateFeedbackBaseDto {
  // Optional session ID for anonymous/unauthenticated feedback
  @IsOptional()
  @IsString()
  sessionId?: string;

  // Rating (1-5 stars)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  // Category
  @IsOptional()
  @IsEnum(FeedbackCategory)
  category?: FeedbackCategory = FeedbackCategory.OTHER;

  // Detailed message
  @IsOptional()
  @IsString()
  message?: string;

  // Tags for categorization
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Priority
  @IsOptional()
  @IsEnum(FeedbackPriority)
  priority?: FeedbackPriority;

  // App/platform info
  @IsOptional()
  @IsString()
  @MaxLength(20)
  appVersion?: string;

  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  osVersion?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;

  // Attachment
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imageUrl?: string;

  // Page/URL context
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  pageUrl?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsIP()
  ipAddress?: string;
}
