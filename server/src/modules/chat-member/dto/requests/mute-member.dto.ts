import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class MuteMemberDto {
  @IsOptional()
  @IsDateString()
  mutedUntil?: Date; // ISO 8601 format

  @IsOptional()
  @IsUUID()
  lastReadMessageId?: string;
}
