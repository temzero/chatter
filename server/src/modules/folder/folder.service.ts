import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';
import { Repository } from 'typeorm';
import { Chat } from '../chat/entities/chat.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class FolderService {
  constructor(
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,

    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(userId: string): Promise<Folder[]> {
    return this.folderRepository.find({
      where: { user: { id: userId } },
      relations: ['chats'],
    });
  }

  async findOne(id: string, userId: string): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['chats'],
    });
    if (!folder) throw new NotFoundException('Folder not found');
    return folder;
  }

  async create(data: Partial<Folder> & { userId: string }): Promise<Folder> {
    const user = await this.userRepository.findOne({
      where: { id: data.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const folder = this.folderRepository.create({
      ...data,
      user,
    });

    return this.folderRepository.save(folder);
  }

  async update(
    id: string,
    data: Partial<Folder>,
    userId: string,
  ): Promise<Folder> {
    const folder = await this.findOne(id, userId);
    Object.assign(folder, data);
    return this.folderRepository.save(folder);
  }

  async remove(id: string, userId: string): Promise<void> {
    const folder = await this.findOne(id, userId);
    await this.folderRepository.remove(folder);
  }

  async addChatsToFolder(
    folderId: string,
    chatIds: string[],
    userId: string,
  ): Promise<Folder> {
    const folder = await this.findOne(folderId, userId);
    const chats = await this.chatRepository.findByIds(chatIds);
    folder.chats = [...(folder.chats || []), ...chats];
    return this.folderRepository.save(folder);
  }

  async removeChatFromFolder(
    folderId: string,
    chatId: string,
    userId: string,
  ): Promise<Folder> {
    const folder = await this.findOne(folderId, userId);
    folder.chats = folder.chats.filter((chat) => chat.id !== chatId);
    return this.folderRepository.save(folder);
  }
}
