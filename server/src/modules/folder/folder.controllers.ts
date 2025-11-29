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
  Query,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { FolderResponseDto } from './dto/folder-response.dto';
import { Folder } from './entities/folder.entity';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { SuccessResponse } from '@/common/api-response/success';
import { PaginationResponse } from '@shared/types/responses/pagination.response';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getFolders(
    @CurrentUser('id') userId: string,
    @Query() query?: PaginationQueryDto,
  ): Promise<SuccessResponse<PaginationResponse<FolderResponseDto>>> {
    const result = await this.folderService.getFolders(userId, query);

    return new SuccessResponse(result, 'Folders retrieved successfully');
  }

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() data: Partial<Folder>,
  ): Promise<FolderResponseDto> {
    return this.folderService.create(data, userId);
  }

  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: Partial<Folder>,
  ): Promise<FolderResponseDto> {
    return this.folderService.update(id, body, userId);
  }

  @Patch('reorder')
  async reorderFolders(
    @CurrentUser('id') userId: string,
    @Body() body: { newOrder: Array<{ id: string; position: number }> },
  ) {
    return this.folderService.reorderFolders(userId, body.newOrder);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.folderService.remove(id, userId);
  }

  @Post('add-chats/:id/chats')
  async addChats(
    @Param('id') folderId: string,
    @Body('chatIds') chatIds: string[],
    @CurrentUser('id') userId: string,
  ): Promise<FolderResponseDto> {
    return this.folderService.addChatsToFolder(folderId, chatIds, userId);
  }

  @Delete('remove-chat/:folderId/chats/:chatId')
  async removeChat(
    @Param('folderId') folderId: string,
    @Param('chatId') chatId: string,
    @CurrentUser('id') userId: string,
  ): Promise<FolderResponseDto> {
    return this.folderService.removeChatFromFolder(folderId, chatId, userId);
  }
}
