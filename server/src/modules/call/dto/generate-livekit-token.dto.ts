// src/calls/dto/generate-livekit-token.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { generateLiveKitTokenRequest } from 'src/shared/types/requests/generate-livekit-token.request';

export class GenerateLiveKitTokenDto implements generateLiveKitTokenRequest {
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
