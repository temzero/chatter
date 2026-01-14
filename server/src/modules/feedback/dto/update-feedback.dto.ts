// update-feedback.dto.ts
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  Min,
  Max,
  IsObject,
  IsUrl,
} from 'class-validator';
import {
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
} from '@/shared/types/enums/feedback.enum';
import { PartialType } from '@nestjs/mapped-types';
import { CreateFeedbackDto } from './create-feedback.dto';
import { Type } from 'class-transformer';

// Using PartialType to inherit all fields as optional
export class UpdateFeedbackDto extends PartialType(CreateFeedbackDto) {
  // Override certain fields with additional validation or restrictions
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating?: number;

  @IsOptional()
  @IsEnum(FeedbackCategory)
  category?: FeedbackCategory;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  imageUrl?: string;

  @IsOptional()
  @IsEnum(FeedbackStatus)
  status?: FeedbackStatus;

  @IsOptional()
  @IsEnum(FeedbackPriority)
  priority?: FeedbackPriority;

  // For admin/update operations, you might want to allow clearing tags
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  deviceInfo?: {
    deviceModel?: string;
    browser?: string;
    browserVersion?: string;
    screenResolution?: string;
    language?: string;
  };
}
