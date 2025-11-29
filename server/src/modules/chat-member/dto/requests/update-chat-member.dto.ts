import { ChatMemberRole } from '@shared/types/enums/chat-member-role.enum';
import { ChatMemberStatus } from '@shared/types/enums/chat-member-status.enum';
import { UpdateChatMemberRequest } from '@shared/types/requests/update-chat-member.request';
import { EmptyStringToNull } from '@/common/utils/dto.utils';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateChatMemberDto implements UpdateChatMemberRequest {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  @EmptyStringToNull()
  nickname?: string;

  @IsOptional()
  @IsEnum(ChatMemberRole)
  @EmptyStringToNull()
  role?: ChatMemberRole;

  @IsOptional()
  @IsEnum(ChatMemberStatus)
  @EmptyStringToNull()
  status?: ChatMemberStatus;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  customTitle?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  mutedUntil?: Date | null;

  @IsOptional()
  @IsString()
  lastReadMessageId?: string | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  pinnedAt?: Date | null; // ✅ Add this
}
