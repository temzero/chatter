import { IsUUID, IsOptional } from 'class-validator';

export class UpdateChatDto {
  @IsOptional()
  @IsUUID()
  lastMessageId?: string; // Optional UUID of the last message (Message)

  @IsOptional()
  @IsUUID()
  pinnedMessageId?: string; // Optional UUID of the pinned message (Message)
}
