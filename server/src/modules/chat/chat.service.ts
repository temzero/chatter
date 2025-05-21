import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { UpdateChatDto } from 'src/modules/chat/dto/requests/update-chat.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';
import { ChatMemberRole } from 'src/modules/chat-member/constants/chat-member-roles.constants';
import { AppError } from 'src/common/errors';
import { In } from 'typeorm';
import { ChatType } from './constants/chat-types.constants';
import {
  CreateDirectChatDto,
  CreateGroupChatDto,
} from './dto/requests/create-chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,

    @InjectRepository(ChatMember)
    private readonly memberRepo: Repository<ChatMember>,
  ) {}

  // async createChat(createDto: CreateChatDto): Promise<Chat> {
  //   try {
  //     // Validate users first
  //     const userCount = await this.userRepo.count({
  //       where: { id: In(createDto.memberIds) },
  //     });

  //     if (userCount !== createDto.memberIds.length) {
  //       AppError.badRequest('One or more Users do not exist!');
  //     }

  //     // Proceed with creation
  //     const chat = await this.chatRepo.save({
  //       type: createDto.type,
  //       name: createDto.name,
  //     });

  //     await this.addMembers(chat.id, createDto.memberIds);
  //     return chat;
  //   } catch (error) {
  //     AppError.throw(error, 'Failed to create chat');
  //   }
  // }

  async createDirectChat(createDto: CreateDirectChatDto): Promise<Chat> {
    // Validate exactly 2 users (current user + one other)
    if (createDto.memberIds.length !== 2) {
      AppError.badRequest('Direct chats must have exactly 2 members');
    }

    // Validate users if exist
    const userCount = await this.userRepo.count({
      where: { id: In(createDto.memberIds) },
    });

    if (userCount !== createDto.memberIds.length) {
      AppError.badRequest('One or more Users do not exist!');
    }

    const [user1, user2] = createDto.memberIds;

    // Check for existing chat
    const existingChat = await this.chatRepo
      .createQueryBuilder('chat')
      .innerJoin('chat.members', 'member1', 'member1.user_id = :user1', {
        user1,
      })
      .innerJoin('chat.members', 'member2', 'member2.user_id = :user2', {
        user2,
      })
      .where('chat.type = :type', { type: ChatType.DIRECT })
      .getOne();

    if (existingChat) {
      AppError.badRequest('A direct chat already exists between these users');
    }

    // Create new chat
    const chat = await this.chatRepo.save({
      type: ChatType.DIRECT,
      name: null, // Direct chats typically don't have names
    });

    await this.addMembers(chat.id, createDto.memberIds);
    return chat;
  }

  async createGroupChat(createDto: CreateGroupChatDto): Promise<Chat> {
    // Validate based on chat type
    const memberCount = createDto.memberIds.length;

    if (createDto.type === ChatType.GROUP && memberCount < 2) {
      AppError.badRequest('Group must have at least 2 members');
    }

    if (createDto.type === ChatType.CHANNEL && memberCount < 1) {
      AppError.badRequest('Channel must have at least 1 member');
    }

    if (!createDto.name) {
      AppError.badRequest('Group or Channel must have a name');
    }

    // Validate users if exist
    const userCount = await this.userRepo.count({
      where: { id: In(createDto.memberIds) },
    });

    if (userCount !== createDto.memberIds.length) {
      AppError.badRequest('One or more Users do not exist!');
    }

    // Create new chat
    const chat = await this.chatRepo.save(createDto);

    await this.addMembers(chat.id, createDto.memberIds);
    return chat;
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
          }),
        ),
      );
    } catch (error) {
      AppError.throw(error, 'Failed to add chat members');
    }
  }
}
