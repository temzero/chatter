import { EmptyStringToNull } from 'src/common/utils/dto.utils';
import { ChatMemberRole } from '../../constants/chat-member-roles.constants';
import { ChatMemberStatus } from '../../constants/chat-member-status.constants';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateChatMemberDto {
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
  @IsString()
  @EmptyStringToNull()
  mutedUntil?: Date | null;

  @IsOptional()
  @IsString()
  @EmptyStringToNull()
  lastReadMessageId?: string | null;
}
