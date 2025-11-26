import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';
import { UpdateChatRequest } from 'src/shared/types/requests/update-chat.request';
import { EmptyStringToNull } from 'src/common/utils/dto.utils';

export class UpdateChatDto implements UpdateChatRequest {
  @IsUUID()
  chatId: string;

  @IsOptional()
  @IsString()
  @MaxLength(512, {
    message: 'Avatar URL cannot be longer than 2048 characters',
  })
  @EmptyStringToNull()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64, {
    message: 'Chat name cannot be longer than 64 characters',
  })
  @EmptyStringToNull()
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512, {
    message: 'Description cannot be longer than 512 characters',
  })
  @EmptyStringToNull()
  description?: string;

  @IsOptional()
  @IsUUID()
  pinnedMessageId?: string;

  @IsOptional()
  isPublic?: boolean;
}
