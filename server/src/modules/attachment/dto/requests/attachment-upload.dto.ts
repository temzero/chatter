import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';
import { AttachmentType } from '@shared/types/enums/attachment-type.enum';
import { AttachmentUploadRequest } from '@shared/types/requests/attachment-upload.request';

export class AttachmentUploadDto implements AttachmentUploadRequest {
  @IsEnum(AttachmentType)
  type: AttachmentType;

  @IsString()
  filename: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsInt()
  size?: number;

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

  @IsOptional()
  @IsISO8601()
  createdAt?: string;
}
