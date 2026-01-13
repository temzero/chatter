// create-feedback.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { CreateFeedbackBaseDto } from './create-feedback-base.dto';
import { FeedbackStatus } from '@/shared/types/enums/feedback.enum';
import { CreateFeedbackRequest } from '@/shared/types/requests/create-feedback.request';

export class CreateFeedbackDto
  extends CreateFeedbackBaseDto
  implements CreateFeedbackRequest
{
  // Either userId OR sessionId must be provided
  @IsNotEmpty({ message: 'Either userId or sessionId is required' })
  @IsString()
  userId?: string;

  // Status should always be NEW for user submissions
  @IsOptional()
  @IsEnum(FeedbackStatus)
  status?: FeedbackStatus = FeedbackStatus.NEW;

  // These fields should not be set by users
  @IsOptional()
  assignedToId?: never;

  @IsOptional()
  team?: never;

  @IsOptional()
  adminResponse?: never;

  @IsOptional()
  respondedAt?: never;
}
