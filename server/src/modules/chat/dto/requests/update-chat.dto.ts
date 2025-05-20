import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';
import { EmptyStringToNull } from 'src/common/utils/dto.utils';

export class UpdateChatDto {
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
  @IsString()
  @MaxLength(512, {
    message: 'Avatar URL cannot be longer than 2048 characters',
  })
  @EmptyStringToNull()
  avatarUrl?: string;

  @IsOptional()
  @IsUUID(4)
  pinnedMessageId?: string;

  @IsOptional()
  isPublic?: boolean;
}
