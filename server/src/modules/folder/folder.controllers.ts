import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  UseGuards,
  HttpStatus,
  HttpCode,
  Body,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { FolderResponseDto } from './dto/folder-response.dto';
import { Folder } from './entities/folder.entity';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Patch('reorder')
  async reorderFolders(
    @CurrentUser('id') userId: string,
    @Body() body: { newOrder: Array<{ id: string; position: number }> },
  ) {
    return this.folderService.reorderFolders(userId, body.newOrder);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser('id') userId: string,
  ): Promise<FolderResponseDto[]> {
    return this.folderService.findAll(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<FolderResponseDto> {
    return this.folderService.findOne(id, userId);
  }

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() data: Partial<Folder>,
  ): Promise<FolderResponseDto> {
    return this.folderService.create(data, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: Partial<Folder>,
  ): Promise<FolderResponseDto> {
    return this.folderService.update(id, body, userId);
  }

  @Patch('position/:id')
  async updatePosition(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('position') position: number,
  ): Promise<FolderResponseDto> {
    return this.folderService.updateFolderPosition(id, position, userId);
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
  ): Promise<FolderResponseDto> {
    return this.folderService.addChatsToFolder(folderId, chatIds, userId);
  }

  @Delete(':folderId/chats/:chatId')
  async removeChat(
    @Param('folderId') folderId: string,
    @Param('chatId') chatId: string,
    @CurrentUser('id') userId: string,
  ): Promise<FolderResponseDto> {
    return this.folderService.removeChatFromFolder(folderId, chatId, userId);
  }
}
