import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { CreateChatDto } from 'src/modules/chat/dto/create-chat.dto';
import { UpdateChatDto } from 'src/modules/chat/dto/update-chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async getAllChats(): Promise<Chat[]> {
    return this.chatRepository.find({
      relations: ['member1', 'member2', 'lastMessage', 'pinnedMessage'],
    });
  }

  async getChatsByUserId(userId: string): Promise<Chat[]> {
    const chats = await this.chatRepository.find({
      where: [{ member1: { id: userId } }, { member2: { id: userId } }],
      relations: ['member1', 'member2', 'lastMessage', 'pinnedMessage'],
    });

    return chats.sort((a, b) => {
      const aTime = a.lastMessage?.updatedAt || a.updatedAt;
      const bTime = b.lastMessage?.updatedAt || b.updatedAt;
      return bTime.getTime() - aTime.getTime(); // Newest first
    });
  }

  async getChatById(id: string): Promise<Chat | null> {
    return this.chatRepository.findOne({
      where: { id },
      relations: ['member1', 'member2', 'lastMessage', 'pinnedMessage'],
    });
  }

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const { member1Id, member2Id } = createChatDto;

    const chat = this.chatRepository.create({
      member1: { id: member1Id },
      member2: { id: member2Id },
    });

    return this.chatRepository.save(chat);
  }

  async updateChat(
    id: string,
    updateChatDto: UpdateChatDto,
  ): Promise<Chat | null> {
    const chat = await this.getChatById(id);
    if (!chat) {
      return null;
    }
    const updated = Object.assign(chat, updateChatDto);
    return this.chatRepository.save(updated);
  }

  async deleteChat(id: string): Promise<Chat | null> {
    const chat = await this.getChatById(id);
    if (!chat) {
      return null;
    }
    await this.chatRepository.remove(chat);
    return chat;
  }
}
