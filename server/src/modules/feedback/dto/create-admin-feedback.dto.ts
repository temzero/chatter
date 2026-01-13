// create-admin-feedback.dto.ts
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { CreateFeedbackBaseDto } from './create-feedback-base.dto';
import { FeedbackStatus } from '@/shared/types/enums/feedback.enum';

export class CreateAdminFeedbackDto extends CreateFeedbackBaseDto {
  // Admin can specify user or leave null for anonymous
  @IsOptional()
  @IsString()
  userId?: string;

  // Admin can set any status
  @IsOptional()
  @IsEnum(FeedbackStatus)
  status?: FeedbackStatus = FeedbackStatus.NEW;

  // Admin-only fields
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsString()
  adminResponse?: string;

  @IsOptional()
  @IsDateString()
  respondedAt?: Date;
}
