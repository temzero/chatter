import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class ChatGroupMemberDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  chat_group_id: string;

  @IsOptional()
  @IsBoolean()
  is_admin: boolean;

  @IsOptional()
  @IsBoolean()
  is_banned: boolean;

  @IsOptional()
  @IsDateString()
  muted_until?: string;
}
