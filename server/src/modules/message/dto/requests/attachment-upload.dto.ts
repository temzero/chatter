import { AttachmentType } from '../../constants/attachment-type.constants';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class AttachmentUploadDto {
  // additional field only process in server
  @IsOptional()
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsEnum(AttachmentType)
  type: AttachmentType;

  @IsString()
  filename: string;

  @IsInt()
  size: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsInt()
  height?: number;

  @IsOptional()
  @IsInt()
  duration?: number;
}
