import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';
import { In, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { FolderResponseDto } from './dto/folder-response.dto';
import { ErrorResponse } from '@/common/api-response/errors';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { PaginationResponse } from '@shared/types/responses/pagination.response';
import { NotFoundError } from '@shared/types/enums/error-message.enum';

@Injectable()
export class FolderService {
  constructor(
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private toDto(folder: Folder): FolderResponseDto {
    return plainToInstance(FolderResponseDto, folder);
  }

  async getFolders(
    userId: string,
    query?: PaginationQueryDto,
  ): Promise<PaginationResponse<FolderResponseDto>> {
    const { limit = 20, offset = 0, lastId } = query ?? {};

    let qb = this.folderRepository
      .createQueryBuilder('folder')
      .where('folder.user_id = :userId', { userId })
      .orderBy('folder.position', 'ASC');

    if (lastId) {
      const lastFolder = await this.folderRepository.findOne({
        where: { id: lastId },
      });
      if (lastFolder) {
        qb = qb.andWhere('folder.position > :position', {
          position: lastFolder.position,
        });
      }
    } else {
      qb = qb.skip(offset);
    }

    const folders = await qb.take(limit + 1).getMany(); // take one extra to check hasMore
    const hasMore = folders.length > limit;
    const items = hasMore
      ? folders.slice(0, limit).map((f) => this.toDto(f))
      : folders.map((f) => this.toDto(f));

    return { items, hasMore };
  }

  async findOne(id: string, userId: string): Promise<FolderResponseDto> {
    const folder = await this.folderRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!folder) {
      ErrorResponse.notFound(NotFoundError.FOLDER_NOT_FOUND);
    }

    return this.toDto(folder);
  }

  async create(
    data: Partial<Folder>,
    userId: string,
  ): Promise<FolderResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      ErrorResponse.notFound(NotFoundError.USER_NOT_FOUND);
    }

    // Use correct column name: user_id (not userId)
    const rawMax = await this.folderRepository
      .createQueryBuilder('folder')
      .select('MAX(folder.position)', 'max')
      .where('folder.user_id = :userId', { userId })
      .getRawOne<{ max: string | null }>();

    const maxPosition =
      rawMax?.max !== null && rawMax?.max !== undefined
        ? Number(rawMax.max)
        : -1;

    const newPosition = maxPosition + 1;

    const folder = this.folderRepository.create({
      ...data,
      user,
      position: newPosition,
    });

    const savedFolder = await this.folderRepository.save(folder);
    return this.toDto(savedFolder);
  }

  async update(
    id: string,
    data: Partial<Folder>,
    userId: string,
  ): Promise<FolderResponseDto> {
    const folder = await this.folderRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!folder) {
      ErrorResponse.notFound(NotFoundError.FOLDER_NOT_FOUND);
    }

    Object.assign(folder, data);
    const updatedFolder = await this.folderRepository.save(folder);
    return this.toDto(updatedFolder);
  }

  async reorderFolders(
    userId: string,
    newOrder: Array<{ id: string; position: number }>,
  ) {
    // Validate all folders belong to user
    const folderIds = newOrder.map((u) => u.id);
    const folders = await this.folderRepository.find({
      where: { id: In(folderIds), user: { id: userId } },
    });

    if (folders.length !== newOrder.length) {
      ErrorResponse.notFound(NotFoundError.FOLDER_NOT_FOUND);
    }

    // Update positions
    const updateOps = newOrder.map((update) => {
      const folder = folders.find((f) => f.id === update.id);
      if (folder) {
        folder.position = update.position;
        return this.folderRepository.save(folder);
      }
    });

    await Promise.all(updateOps);
    return folders.map((f) => this.toDto(f));
  }

  async remove(id: string, userId: string): Promise<void> {
    const folder = await this.folderRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!folder) {
      ErrorResponse.notFound(NotFoundError.FOLDER_NOT_FOUND);
    }
    await this.folderRepository.remove(folder);
  }

  async addChatsToFolder(
    folderId: string,
    chatIds: string[],
    userId: string,
  ): Promise<FolderResponseDto> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId, user: { id: userId } },
    });
    if (!folder) {
      ErrorResponse.notFound(NotFoundError.FOLDER_NOT_FOUND);
    }

    // Filter out duplicates and null/undefined values
    const uniqueNewChatIds = [...new Set(chatIds.filter(Boolean))];
    const existingChatIds = new Set(folder.chatIds || []);

    // Only add chats that aren't already in the folder
    const chatsToAdd = uniqueNewChatIds.filter(
      (id) => !existingChatIds.has(id),
    );
    folder.chatIds = [...folder.chatIds, ...chatsToAdd];

    const updatedFolder = await this.folderRepository.save(folder);
    return this.toDto(updatedFolder);
  }

  async removeChatFromFolder(
    folderId: string,
    chatId: string,
    userId: string,
  ): Promise<FolderResponseDto> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId, user: { id: userId } },
    });
    if (!folder) {
      ErrorResponse.notFound(NotFoundError.FOLDER_NOT_FOUND);
    }

    folder.chatIds = (folder.chatIds || []).filter((id) => id !== chatId);
    const updatedFolder = await this.folderRepository.save(folder);
    return this.toDto(updatedFolder);
  }
}
