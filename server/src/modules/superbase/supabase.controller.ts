// Server-side controller
import {
  Controller,
  BadRequestException,
  Delete,
  Body,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Controller('storage')
export class SupabaseController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Delete()
  async deleteFile(@Body() body: { url: string }) {
    const { url } = body;
    if (!url) {
      throw new BadRequestException('URL is required');
    }
    try {
      // Extract the file path from the public URL
      const pathStartIndex = url.indexOf('/storage/v1/object/public/');
      if (pathStartIndex === -1) {
        throw new BadRequestException('Invalid URL format');
      }

      const filePath = url.substring(
        pathStartIndex + '/storage/v1/object/public/'.length,
      );

      // Call service to delete file
      const deleted = await this.supabaseService.deleteFile(
        'avatars',
        filePath,
      );
      return { success: deleted };
    } catch (err) {
      console.error('Error deleting file:', err);
      throw new BadRequestException('Could not delete file');
    }
  }

  private async handleOldAvatarDeletion(oldUrl: string): Promise<void> {
    try {
      await this.supabaseService.deleteFileByUrl(oldUrl);
    } catch (error) {
      console.warn('Silent failure - could not delete old avatar:', error);
    }
  }
}
