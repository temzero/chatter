import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ChatType } from '../../constants/chat-types.constants';

export class CreateDirectChatDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1) // Will be combined with current user to make 2
  @IsUUID(4, { each: true })
  memberIds: string[];
}

export class CreateGroupChatDto {
  @IsEnum(ChatType)
  type: ChatType;

  @IsArray()
  @ArrayMinSize(1) // Will be combined with current user
  @IsUUID(4, { each: true })
  @IsString({ each: true })
  memberIds: string[]; // Required for all chat types

  // Optional fields (primarily for groups/channels)
  @IsOptional()
  @IsString()
  @MaxLength(128, {
    message: 'Chat name cannot be longer than 128 characters',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512, {
    message: 'Description cannot be longer than 512 characters',
  })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048, {
    message: 'Avatar URL cannot be longer than 2048 characters',
  })
  avatarUrl?: string;

  // Settings (defaults applied at service level)
  @IsOptional()
  isPublic?: boolean;

  @IsOptional()
  isBroadcastOnly?: boolean;
}
