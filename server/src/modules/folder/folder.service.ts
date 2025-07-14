import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { FolderResponseDto } from './dto/folder-response.dto';

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

  async findAll(userId: string): Promise<FolderResponseDto[]> {
    const folders = await this.folderRepository.find({
      where: { user: { id: userId } },
      order: { position: 'ASC' },
    });
    return folders.map((folder) => this.toDto(folder));
  }

  async findOne(id: string, userId: string): Promise<FolderResponseDto> {
    const folder = await this.folderRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!folder) throw new NotFoundException('Folder not found');
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
      throw new NotFoundException('User not found');
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
    if (!folder) throw new NotFoundException('Folder not found');

    Object.assign(folder, data);
    const updatedFolder = await this.folderRepository.save(folder);
    return this.toDto(updatedFolder);
  }

  async remove(id: string, userId: string): Promise<void> {
    const folder = await this.folderRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!folder) throw new NotFoundException('Folder not found');
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
    if (!folder) throw new NotFoundException('Folder not found');

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
    if (!folder) throw new NotFoundException('Folder not found');

    folder.chatIds = (folder.chatIds || []).filter((id) => id !== chatId);
    const updatedFolder = await this.folderRepository.save(folder);
    return this.toDto(updatedFolder);
  }

  async updateFolderPosition(
    folderId: string,
    position: number,
    userId: string,
  ): Promise<FolderResponseDto> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId, user: { id: userId } },
    });
    if (!folder) throw new NotFoundException('Folder not found');

    folder.position = position;
    const updatedFolder = await this.folderRepository.save(folder);
    return this.toDto(updatedFolder);
  }
}
