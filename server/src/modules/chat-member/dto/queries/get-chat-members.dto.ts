import {
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { ChatMemberRole } from '../../constants/chat-member-roles.constants';
import { ChatMemberStatus } from '../../constants/chat-member-status.constants';

export class GetChatMembersDto {
  @IsUUID()
  chatId: string;

  @IsOptional()
  @IsEnum(ChatMemberRole)
  role?: ChatMemberRole;

  @IsOptional()
  @IsEnum(ChatMemberStatus)
  status?: ChatMemberStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset = 0;
}
