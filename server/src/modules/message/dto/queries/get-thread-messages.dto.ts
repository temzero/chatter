import { IsUUID, IsNumber, Min, Max } from 'class-validator';

export class GetThreadMessagesDto {
  @IsUUID()
  replyToMessageId: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsNumber()
  @Min(0)
  offset = 0;
}
