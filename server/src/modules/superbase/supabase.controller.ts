// Server-side controller
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

@Controller('storage')
export class SupabaseController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() body: { type?: 'user' | 'group'; oldUrl?: string },
  ) {
    console.log('UPLOAD AVATAR avatar', avatar);
    console.log('UPLOAD AVATAR Body', body);
    if (!avatar) throw new BadRequestException('File is required');

    const type = body.type || 'user'; // Default to 'user' if not specified

    // Check image dimensions
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
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${type}/${fileName}`; // Save to user/ or group/ folder based on type

    // Upload avatar buffer to Supabase Storage
    await this.supabaseService.uploadFile(
      'avatars',
      avatar.buffer,
      filePath,
      avatar.mimetype,
    );

    // Fire-and-forget deletion of old avatar
    if (body.oldUrl) {
      this.handleOldAvatarDeletion(body.oldUrl).catch((error) => {
        console.error('Background avatar deletion failed:', error);
      });
    }

    const publicUrl = this.supabaseService.getPublicUrl('avatars', filePath);

    return { url: publicUrl };
  }

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
