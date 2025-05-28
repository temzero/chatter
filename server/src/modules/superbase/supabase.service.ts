import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async uploadFile(buffer: Buffer, path: string, contentType: string) {
    const { data, error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME || 'attachments')
      .upload(path, buffer, { contentType, upsert: true });

    if (error) throw error;
    return data;
  }

  getPublicUrl(path: string): string {
    return this.supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME || 'attachments')
      .getPublicUrl(path).data.publicUrl;
  }

  async fileExists(filePath: string): Promise<boolean> {
    const { data, error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME || 'attachments')
      .download(filePath);

    return !error && !!data;
  }

  async deleteFile(filePath: string): Promise<boolean> {
    if (!filePath) {
      throw new Error('File path is required for deletion');
    }

    const cleanedPath = filePath.replace(/^attachments\//, '');
    const { error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME || 'attachments')
      .remove([cleanedPath]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
    return true;
  }

  // async deleteFileByUrl(publicUrl: string): Promise<boolean> {
  //   const match = publicUrl.match(/\/object\/public\/([^/]+)\/(.+)/);
  //   if (!match) {
  //     throw new Error('Invalid Supabase public URL');
  //   }

  //   const [, bucket, path] = match;

  //   const { error } = await this.supabase.storage.from(bucket).remove([path]);

  //   if (error) throw new Error(`Failed to delete file: ${error.message}`);

  //   return true;
  // }
}
