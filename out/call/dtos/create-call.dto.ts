import { IsBoolean, IsUUID } from 'class-validator';

export class CreateCallDto {
  @IsUUID()
  chatId: string;

  @IsBoolean()
  isVideo: boolean;

  @IsBoolean()
  isGroup: boolean;

  // Note: userId will come from auth token
}
