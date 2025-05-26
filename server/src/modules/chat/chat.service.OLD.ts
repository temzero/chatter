import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { UpdateChatDto } from 'src/modules/chat/dto/requests/update-chat.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';
import { ChatMemberRole } from 'src/modules/chat-member/constants/chat-member-roles.constants';
import { ErrorResponse } from 'src/common/api-response/errors';
import { In } from 'typeorm';
import { ChatType } from './constants/chat-types.constants';
import { CreateGroupChatDto } from './dto/requests/create-chat.dto';
import { Message } from '../message/entities/message.entity';

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

  async getOrCreateDirectChat(myUserId: string, partnerId: string) {
    if (!myUserId || !partnerId) {
      ErrorResponse.badRequest('Missing userId');
    }

    // Create memberIds array from the two user IDs
    const memberIds = [myUserId, partnerId];

    // Validate users if exist
    const userCount = await this.userRepo.count({
      where: { id: In(memberIds) },
    });

    if (userCount !== memberIds.length) {
      ErrorResponse.badRequest('One or more Users do not exist!');
    }

    // Check for existing chat
    const existingChat = await this.chatRepo
      .createQueryBuilder('chat')
      .innerJoin('chat.members', 'member1', 'member1.user_id = :user1', {
        user1: myUserId,
      })
      .innerJoin('chat.members', 'member2', 'member2.user_id = :user2', {
        user2: partnerId,
      })
      .where('chat.type = :type', { type: ChatType.DIRECT })
      .getOne();

    if (existingChat) {
      // Fetch the existing chat with all relations
      const fullChat = await this.chatRepo.findOne({
        where: { id: existingChat.id },
        relations: [
          'members',
          'members.user',
          'lastMessage',
          'lastMessage.sender',
          'lastMessage.attachments',
        ],
      });

      if (!fullChat) {
        ErrorResponse.notFound('Chat not found');
      }

      return {
        chat: this.transformChatForUser(fullChat, myUserId),
        wasExisting: true,
      };
    }

    // Create new chat
    const chat = await this.chatRepo.save({
      type: ChatType.DIRECT,
      name: null,
    });

    await this.addMembers(chat.id, memberIds);

    // Fetch the newly created chat with all relations
    const fullChat = await this.chatRepo.findOne({
      where: { id: chat.id },
      relations: [
        'members',
        'members.user',
        'lastMessage',
        'lastMessage.sender',
        'lastMessage.attachments',
      ],
    });

    if (!fullChat) {
      ErrorResponse.notFound('Chat not found');
    }

    return {
      chat: this.transformChatForUser(fullChat, myUserId),
      wasExisting: false,
    };
  }

  async createGroupChat(userId: string, createDto: CreateGroupChatDto) {
    // Validate based on chat type
    const memberCount = createDto.memberIds.length;

    if (createDto.type === ChatType.GROUP && memberCount < 2) {
      ErrorResponse.badRequest('Group must have at least 2 members');
    }

    if (createDto.type === ChatType.CHANNEL && memberCount < 1) {
      ErrorResponse.badRequest('Channel must have at least 1 member');
    }

    if (!createDto.name) {
      ErrorResponse.badRequest('Group or Channel must have a name');
    }

    // Validate users if exist
    const userCount = await this.userRepo.count({
      where: { id: In(createDto.memberIds) },
    });

    if (userCount !== createDto.memberIds.length) {
      ErrorResponse.badRequest('One or more Users do not exist!');
    }

    // Create new chat
    const chat = await this.chatRepo.save(createDto);

    await this.addMembers(chat.id, createDto.memberIds);

    // Fetch the newly created chat with all relations
    const fullChat = await this.chatRepo.findOne({
      where: { id: chat.id },
      relations: [
        'members',
        'members.user',
        'lastMessage',
        'lastMessage.sender',
        'lastMessage.attachments',
      ],
    });
    if (!fullChat) {
      ErrorResponse.notFound('Chat not found');
    }
    return this.transformChatForUser(fullChat, userId);
  }

  async updateChat(chatId: string, updateDto: UpdateChatDto): Promise<Chat> {
    try {
      const chat = await this.getChatById(chatId);
      Object.assign(chat, updateDto);
      return await this.chatRepo.save(chat);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to update chat');
    }
  }

  async getChatById(chatId: string, loadRelations = true): Promise<Chat> {
    try {
      const options: FindOneOptions<Chat> = { where: { id: chatId } };
      if (loadRelations) options.relations = ['members'];
      const chat = await this.chatRepo.findOne(options);
      if (!chat) {
        ErrorResponse.notFound('Chat not found');
      }
      return chat;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to get chat');
    }
  }

  async getChatsByUserId(userId: string): Promise<Chat[]> {
    try {
      const memberships = await this.memberRepo.find({
        where: { user: { id: userId } },
        relations: ['chat', 'chat.lastMessage', 'chat.lastMessage.sender'],
      });

      return memberships
        .map((m) => m.chat)
        .sort(
          (a, b) =>
            (b.lastMessage?.createdAt || b.createdAt).getTime() -
            (a.lastMessage?.createdAt || a.createdAt).getTime(),
        );
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve user chats');
    }
  }

  async getChatListByUserId(userId: string) {
    const chats = await this.chatRepo
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.members', 'member')
      .leftJoinAndSelect('member.user', 'memberUser')
      .leftJoinAndSelect('chat.lastMessage', 'lastMessage')
      .leftJoinAndSelect('lastMessage.sender', 'sender')
      .leftJoinAndSelect('lastMessage.attachments', 'attachments')
      .where(
        'chat.id IN (SELECT "chat_id" FROM chat_member WHERE "user_id" = :userId)',
        { userId },
      )
      .orderBy('COALESCE(lastMessage.createdAt, chat.createdAt)', 'DESC')
      .getMany();

    return chats.map((chat) => this.transformChatForUser(chat, userId));
  }

  private transformChatForUser(chat: Chat, userId: string) {
    // Enhanced direct chat handling
    if (chat.type === ChatType.DIRECT && chat.members?.length === 2) {
      const chatPartner = chat.members.find((m) => m.userId !== userId);
      if (chatPartner?.user) {
        return {
          ...chat,
          name:
            chatPartner.nickname ||
            `${chatPartner.user.firstName} ${chatPartner.user.lastName}`.trim(),
          avatarUrl: chatPartner.user.avatarUrl,
          // Flattened user data
          userId: chatPartner.user.id,
          username: chatPartner.user.username,
          nickname: chatPartner.nickname,
          firstName: chatPartner.user.firstName,
          lastName: chatPartner.user.lastName,
          email: chatPartner.user.email,
          phoneNumber: chatPartner.user.phoneNumber,
          birthday: chatPartner.user.birthday,
          description: chatPartner.user.bio,
          lastMessage: chat.lastMessage
            ? this.transformLastMessage(chat.lastMessage, userId, chat.members)
            : null,
        };
      }
    }

    return {
      ...chat,
      myRole: chat.members?.find((m) => m.userId === userId)?.role,
      lastMessage: chat.lastMessage
        ? this.transformLastMessage(chat.lastMessage, userId, chat.members)
        : null,
    };
  }

  private transformLastMessage(
    message: Message,
    userId: string,
    members: ChatMember[],
  ) {
    const senderMember = members.find((m) => m.userId === message.senderId);

    return {
      id: message.id,
      content: message.content ?? undefined,
      attachmentType: message.attachments?.[0]?.type,
      createdAt: message.createdAt,
      senderName:
        message.senderId === userId
          ? 'Me'
          : senderMember?.nickname || message.sender.firstName,
      senderId: message.senderId,
    };
  }

  async isChatParticipant(chatId: string, userId: string): Promise<boolean> {
    return this.memberRepo.exist({
      where: {
        chat: { id: chatId },
        user: { id: userId },
      },
    });
  }

  async isAdminOrOwner(chatId: string, userId: string): Promise<boolean> {
    return this.memberRepo.exist({
      where: {
        chat: { id: chatId },
        user: { id: userId },
        role: In([ChatMemberRole.ADMIN, ChatMemberRole.OWNER]),
      },
    });
  }

  async getChatMembers(chatId: string): Promise<User[]> {
    try {
      const members = await this.memberRepo.find({
        where: { chat: { id: chatId } },
        relations: ['user'],
      });
      return members.map((m) => m.user);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve chat members');
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
      ErrorResponse.throw(error, 'Failed to add chat members');
    }
  }

  async deleteChat(chatId: string, userId: string): Promise<Chat> {
    try {
      const chat = await this.chatRepo.findOne({
        where: { id: chatId },
        relations: ['members'],
      });

      if (!chat) {
        ErrorResponse.notFound('Chat not found');
      }

      // Check if user is a member of the chat
      const member = chat.members.find((m) => m.userId === userId);
      if (!member) {
        ErrorResponse.unauthorized('You are not a member of this chat');
      }

      // Additional checks for group chats
      if (chat.type !== ChatType.DIRECT) {
        if (member.role !== ChatMemberRole.OWNER) {
          ErrorResponse.unauthorized('Only owners can delete group chats');
        }
      }

      await this.chatRepo.delete(chatId);
      return chat;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to delete chat');
    }
  }
}
