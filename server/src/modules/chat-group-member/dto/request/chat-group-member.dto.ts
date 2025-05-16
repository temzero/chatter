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
  is_admin: boolean = false; // default value

  @IsOptional()
  @IsBoolean()
  is_banned: boolean = false; // default value

  @IsOptional()
  @IsDateString()
  muted_until?: string;
}
