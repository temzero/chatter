// src/calls/dto/generate-livekit-token.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class GenerateLiveKitTokenDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsOptional()
  participantName?: string | null;

  @IsString()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string | null;
}
