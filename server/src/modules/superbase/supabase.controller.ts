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
import sharp from 'sharp';

@Controller('uploads')
export class SupabaseController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@UploadedFile() avatar: Express.Multer.File) {
    if (!avatar) throw new BadRequestException('File is required');

    // ✅ Check image dimensions
    const metadata = await sharp(avatar.buffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new BadRequestException('Invalid image file');
    }

    if (metadata.width > 512 || metadata.height > 512) {
      throw new BadRequestException(
        'Image dimensions must be 512x512 pixels or less',
      );
    }

    const fileExtension = avatar.originalname.split('.').pop();
    const filePath = `image/${uuidv4()}.${fileExtension}`;

    // Upload avatar buffer to Supabase Storage
    await this.supabaseService.uploadFile(
      avatar.buffer,
      filePath,
      avatar.mimetype,
    );

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
