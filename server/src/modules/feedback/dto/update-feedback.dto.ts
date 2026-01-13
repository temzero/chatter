// update-feedback.dto.ts
import { IsOptional, IsBoolean, IsString, IsDate } from 'class-validator';
import { UpdateFeedbackRequest } from '@/shared/types/requests/update-feedback.request';

export class UpdateFeedbackDto implements UpdateFeedbackRequest {
  @IsOptional()
  @IsBoolean()
  markAsResponded?: boolean;

  @IsOptional()
  @IsString()
  adminResponse?: string;

  @IsOptional()
  @IsDate()
  respondedAt?: Date;
}
