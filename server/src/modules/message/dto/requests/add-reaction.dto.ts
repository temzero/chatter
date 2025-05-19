import { IsString, IsUUID, Length } from 'class-validator';

export class AddReactionDto {
  @IsUUID()
  messageId: string;

  @IsString()
  @Length(1, 32)
  emoji: string;
}
