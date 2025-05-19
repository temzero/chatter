import { AttachmentType } from '../../constants/attachment-type.constants';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class UploadAttachmentDto {
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
