import { IsUUID } from 'class-validator';

export class CreateChatDto {
  @IsUUID()
  member1Id: string;

  @IsUUID()
  member2Id: string;
}
