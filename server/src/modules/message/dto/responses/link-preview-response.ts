// src/shared/dto/link-preview-response.dto.ts
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class LinkPreviewResponseDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsString()
  mediaType?: string; // video, article, website, etc.

  @IsOptional()
  @IsString()
  site_name?: string;

  @IsOptional()
  @IsUrl()
  favicon?: string;
}

// export interface LinkPreviewResponse {
//   url: string;
//   title?: string;
//   description?: string;
//   image?: string;
//   mediaType?: string; // video, article, website, etc.
//   site_name?: string;
//   favicon?: string;
// }
