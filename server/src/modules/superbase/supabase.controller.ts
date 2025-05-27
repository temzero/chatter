import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Delete,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from './supabase.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('uploads')
export class SupabaseController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');

    const fileExtension = file.originalname.split('.').pop();
    const filePath = `image/${uuidv4()}.${fileExtension}`;

    // Upload file buffer to Supabase Storage
    await this.supabaseService.uploadFile(file.buffer, filePath, file.mimetype);

    // Get public URL to access later
    const publicUrl = this.supabaseService.getPublicUrl(filePath);

    return { url: publicUrl };
  }

  @Delete()
  async deleteFile(@Body() body: { url: string }) {
    const { url } = body;
    if (!url) {
      throw new BadRequestException('URL is required');
    }
    console.log('Deleting file with URL:', url);
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
      const deleted = await this.supabaseService.deleteFile(filePath);
      return deleted;
    } catch (err) {
      console.error('Error deleting file:', err);
      throw new BadRequestException('Could not delete file');
    }
  }
}
