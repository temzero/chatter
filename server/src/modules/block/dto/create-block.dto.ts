// src/modules/block/dto/requests/create-block.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateBlockRequest } from 'src/shared/types/requests/create-block.request';

export class CreateBlockDto implements CreateBlockRequest {
  @IsUUID()
  @IsNotEmpty()
  blockedId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
