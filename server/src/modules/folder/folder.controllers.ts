import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { Folder } from './entities/folder.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser('id') userId: string): Promise<Folder[]> {
    return this.folderService.findAll(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<Folder> {
    return this.folderService.findOne(id, userId);
  }

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() body: Partial<Folder>,
  ): Promise<Folder> {
    return this.folderService.create({ ...body, userId });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: Partial<Folder>,
  ): Promise<Folder> {
    return this.folderService.update(id, body, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.folderService.remove(id, userId);
  }

  @Post(':id/chats')
  async addChats(
    @Param('id') folderId: string,
    @Body('chatIds') chatIds: string[],
    @CurrentUser('id') userId: string,
  ): Promise<Folder> {
    return this.folderService.addChatsToFolder(folderId, chatIds, userId);
  }

  @Delete(':folderId/chats/:chatId')
  async removeChat(
    @Param('folderId') folderId: string,
    @Param('chatId') chatId: string,
    @CurrentUser('id') userId: string,
  ): Promise<Folder> {
    return this.folderService.removeChatFromFolder(folderId, chatId, userId);
  }
}
