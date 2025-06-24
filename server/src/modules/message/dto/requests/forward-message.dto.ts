import { IsUUID } from 'class-validator';

export class ForwardMessageDto {
  @IsUUID()
  chatId: string;

  @IsUUID()
  messageId: string;
}
