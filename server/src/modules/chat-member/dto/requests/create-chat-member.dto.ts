import { ChatMemberRole } from '../../constants/chat-member-roles.constants';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateChatMemberDto {
  @IsUUID()
  chatId: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsEnum(ChatMemberRole)
  role?: ChatMemberRole;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  nickname?: string;
}
