import { ChatType } from 'src/shared/types/enums/chat-type.enum';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateGroupChatDto {
  @IsEnum(ChatType)
  type: ChatType.GROUP | ChatType.CHANNEL;

  @IsArray()
  @ValidateIf((o: CreateGroupChatDto) => o.type === ChatType.GROUP)
  @ArrayMinSize(1, {
    message: 'At least one member is required for group chats',
  })
  @IsUUID(4, { each: true })
  @IsString({ each: true })
  userIds: string[];

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

  @IsOptional()
  isPublic?: boolean;

  @IsOptional()
  isBroadcastOnly?: boolean;
}
