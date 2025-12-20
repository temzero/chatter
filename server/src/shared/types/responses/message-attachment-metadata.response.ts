// shared/types/attachment-metadata.ts

export interface LinkMetadata {
  title?: string;
  description?: string;
  site_name?: string;
  favicon?: string;
}

export interface ImageMetadata {
  exif?: Record<string, any>;
}

export interface VideoMetadata {
  codec?: string;
  bitrate?: number;
}

export interface FileMetadata {
  pages?: number;
}

export type AttachmentMetadata =
  | LinkMetadata
  | ImageMetadata
  | VideoMetadata
  | FileMetadata;
