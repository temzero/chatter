import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ErrorResponse } from 'src/common/api-response/errors';
import { parseSupabaseStorageUrl } from './utils/supabase-storage.util';
import { EnvHelper } from 'src/common/helpers/env.helper';

type bucketType = 'avatars' | 'attachments';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      EnvHelper.supabase.url,
      EnvHelper.supabase.serviceRoleKey,
    );
  }

  async uploadFile(
    bucket: bucketType,
    buffer: Buffer,
    path: string,
    contentType: string,
  ) {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, buffer, { contentType, upsert: true });

      if (error)
        ErrorResponse.throw(error, `Failed to upload file to ${bucket}`);
      return data;
    } catch (error) {
      ErrorResponse.throw(error, `Failed to upload file to ${bucket}`);
    }
  }

  getPublicUrl(bucket: bucketType, path: string): string {
    try {
      return this.supabase.storage.from(bucket).getPublicUrl(path).data
        .publicUrl;
    } catch (error) {
      ErrorResponse.throw(error, `Failed to get public URL from ${bucket}`);
    }
  }

  async fileExists(bucket: bucketType, filePath: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .download(filePath);

      return !error && !!data;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to check if file exists');
    }
  }

  async deleteFileByUrl(url: string): Promise<boolean> {
    if (!url) {
      ErrorResponse.throw(null, 'URL is required for deletion');
    }

    try {
      const { bucket, filePath } = parseSupabaseStorageUrl(url);
      return this.deleteFile(bucket as bucketType, filePath);
    } catch (error) {
      ErrorResponse.throw(error, `Failed to delete file by URL`);
    }
  }

  async deleteFile(bucket: bucketType, filePath: string): Promise<boolean> {
    if (!filePath) {
      ErrorResponse.throw(null, 'File path is required for deletion');
    }

    try {
      const cleanedPath = filePath.startsWith(`${bucket}/`)
        ? filePath.substring(bucket.length + 1)
        : filePath;

      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([cleanedPath]);

      if (error) {
        console.error('Supabase deletion error:', error);
        ErrorResponse.throw(error, `Failed to delete file from ${bucket}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      ErrorResponse.throw(error, `Failed to delete file from ${bucket}`);
    }
  }
}
