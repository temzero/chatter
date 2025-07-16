// src/modules/block/dto/requests/create-block.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBlockDto {
  @IsUUID()
  @IsNotEmpty()
  blockedId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
