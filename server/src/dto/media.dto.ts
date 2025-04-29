/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsIn, IsOptional, IsNumber } from 'class-validator';

export class MediaDto {
  @IsIn(['image', 'video', 'audio', 'document', 'sticker', 'gif'])
  type: 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'gif';

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;
}
