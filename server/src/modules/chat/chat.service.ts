import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Chat } from 'src/modules/chat/entities/chat.entity';
import { CreateChatDto } from 'src/modules/chat/dto/requests/create-chat.dto';
import { UpdateChatDto } from 'src/modules/chat/dto/requests/update-chat.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';
import { ChatMemberRole } from 'src/modules/chat-member/constants/chat-member-roles.constants';
import { AppError } from 'src/common/errors';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,

    @InjectRepository(ChatMember)
    private readonly memberRepo: Repository<ChatMember>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createChat(createDto: CreateChatDto): Promise<Chat> {
    try {
      const chat = this.chatRepo.create({
        type: createDto.type,
        name: createDto.name,
      });

      const savedChat = await this.chatRepo.save(chat);
      await this.addMembers(savedChat.id, createDto.memberIds);

      return savedChat;
    } catch (error) {
      AppError.throw(error, 'Failed to create chat');
    }
  }

  async updateChat(chatId: string, updateDto: UpdateChatDto): Promise<Chat> {
    try {
      const chat = await this.getChatById(chatId);
      Object.assign(chat, updateDto);
      return await this.chatRepo.save(chat);
    } catch (error) {
      AppError.throw(error, 'Failed to update chat');
    }
  }

  async deleteChat(chatId: string, userId: string): Promise<Chat> {
    try {
      const chat = await this.chatRepo.findOne({
        where: { id: chatId },
        relations: ['members'],
      });

      if (!chat) {
        AppError.notFound('Chat not found');
      }

      const member = chat.members.find((m) => m.userId === userId);
      if (
        !member ||
        (member.role !== ChatMemberRole.ADMIN &&
          member.role !== ChatMemberRole.OWNER)
      ) {
        AppError.unauthorized('Unauthorized to delete chat');
      }

      await this.chatRepo.delete(chatId);
      return chat;
    } catch (error) {
      AppError.throw(error, 'Failed to delete chat');
    }
  }

  async getChatById(chatId: string): Promise<Chat> {
    try {
      const chat = await this.chatRepo.findOne({ where: { id: chatId } });
      if (!chat) {
        AppError.notFound('Chat not found');
      }
      return chat;
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve chat');
    }
  }

  async getChatsByUserId(userId: string): Promise<Chat[]> {
    try {
      const memberships = await this.memberRepo.find({
        where: { user: { id: userId } },
        relations: ['chat', 'chat.lastMessage'],
      });

      return memberships
        .map((m) => m.chat)
        .sort(
          (a, b) =>
            (b.lastMessage?.createdAt || b.createdAt).getTime() -
            (a.lastMessage?.createdAt || a.createdAt).getTime(),
        );
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve user chats');
    }
  }

  async getChatMembers(chatId: string): Promise<User[]> {
    try {
      const members = await this.memberRepo.find({
        where: { chat: { id: chatId } },
        relations: ['user'],
      });
      return members.map((m) => m.user);
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve chat members');
    }
  }

  private async addMembers(chatId: string, userIds: string[]): Promise<void> {
    try {
      await Promise.all(
        userIds.map((userId) =>
          this.memberRepo.save({
            chat: { id: chatId },
            user: { id: userId },
            isAdmin: false,
          }),
        ),
      );
    } catch (error) {
      AppError.throw(error, 'Failed to add chat members');
    }
  }
}
