import { ChatMemberRole } from 'src/shared/types/enums/chat-member-role.enum';
import { ChatMemberStatus } from 'src/shared/types/enums/chat-member-status.enum';
import { UpdateChatMemberRequest } from 'src/shared/types/requests/update-chat-member.request';
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
}
