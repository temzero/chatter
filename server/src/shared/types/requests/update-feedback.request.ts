// shared/types/requests/update-feedback.request.ts

import { FeedbackStatus } from '../enums/feedback.enum';
import { CreateFeedbackRequest } from './create-feedback.request';

export interface UpdateFeedbackRequest extends Partial<CreateFeedbackRequest> {
  status?: FeedbackStatus;
  adminResponse?: string;
  assignedToId?: string;
  team?: string;
  markAsResponded?: boolean;
}
