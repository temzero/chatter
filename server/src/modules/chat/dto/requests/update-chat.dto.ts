import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateChatDto {
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
  @IsUUID(4)
  pinnedMessageId?: string;

  @IsOptional()
  isPublic?: boolean;
}
