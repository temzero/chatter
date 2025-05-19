import { ChatMemberRole } from '../../constants/chat-member-roles.constants';
import { ChatMemberStatus } from '../../constants/chat-member-status.constants';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateChatMemberDto {
  @IsOptional()
  @IsEnum(ChatMemberRole)
  role?: ChatMemberRole;

  @IsOptional()
  @IsEnum(ChatMemberStatus)
  status?: ChatMemberStatus;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  customTitle?: string;
}
