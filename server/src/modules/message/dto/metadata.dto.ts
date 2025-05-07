import {
  IsOptional,
  IsArray,
  IsString,
  IsUrl,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LinkPreviewDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  siteName?: string;
}

export class MessageMetadataDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LinkPreviewDto)
  linkPreview?: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];
}
