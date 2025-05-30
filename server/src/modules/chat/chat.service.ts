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
import {
  ChatResponseDto,
  DirectChatResponseDto,
  GroupChatResponseDto,
} from './dto/responses/chat-response.dto';
import { ChatPartnerDto } from './dto/responses/chat-partner-response.dto';
import { LastMessageResponseDto } from './dto/responses/last-message-response.dto';
import { FriendshipService } from '../friendship/friendship.service';
import { FriendshipStatus } from '../friendship/constants/friendship-status.constants';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,

    @InjectRepository(ChatMember)
    private readonly memberRepo: Repository<ChatMember>,

    private readonly friendshipService: FriendshipService,
  ) {}

  async getOrCreateDirectChat(
    myUserId: string,
    partnerId: string,
  ): Promise<{
    chat: ChatResponseDto;
    wasExisting: boolean;
  }> {
    if (!myUserId || !partnerId) {
      ErrorResponse.badRequest('Missing userId');
    }

    const memberIds = [myUserId, partnerId];
    const userCount = await this.userRepo.count({
      where: { id: In(memberIds) },
    });

    if (userCount !== memberIds.length) {
      ErrorResponse.badRequest('One or more Users do not exist!');
    }

    const friendshipStatus = await this.friendshipService.getFriendshipStatus(
      myUserId,
      partnerId,
    );

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
      const fullChat = await this.getFullChat(existingChat.id);
      return {
        chat: this.transformToDirectChatDto(
          fullChat,
          myUserId,
          friendshipStatus ?? undefined,
        ),
        wasExisting: true,
      };
    }

    const chat = await this.chatRepo.save({
      type: ChatType.DIRECT,
      name: null,
    });

    await this.addMembers(chat.id, memberIds);
    const fullChat = await this.getFullChat(chat.id);

    return {
      chat: this.transformToDirectChatDto(
        fullChat,
        myUserId,
        friendshipStatus ?? undefined,
      ),
      wasExisting: false,
    };
  }

  async createGroupChat(
    userId: string,
    createDto: CreateGroupChatDto,
  ): Promise<ChatResponseDto> {
    const allMemberIds = [userId, ...createDto.memberIds];
    const memberCount = allMemberIds.length;

    if (createDto.type === ChatType.GROUP && memberCount < 2) {
      ErrorResponse.badRequest('Group must have at least 2 members');
    }

    if (!createDto.name) {
      ErrorResponse.badRequest('Group or Channel must have a name');
    }

    const userCount = await this.userRepo.count({
      where: { id: In(allMemberIds) },
    });

    if (userCount !== memberCount) {
      ErrorResponse.badRequest('One or more Users do not exist!');
    }

    const chat = await this.chatRepo.save(createDto);
    await this.addMembers(chat.id, allMemberIds, userId);
    const fullChat = await this.getFullChat(chat.id);

    return this.transformToGroupChatDto(fullChat, userId);
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

  async getChatsByUserId(userId: string): Promise<ChatResponseDto[]> {
    try {
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

      // Process chats in parallel
      const chatDtos = await Promise.all(
        chats.map(async (chat) => {
          if (chat.type === ChatType.DIRECT) {
            // Find the partner user for direct chats
            const partner = chat.members.find((m) => m.userId !== userId);
            if (!partner) {
              throw new Error('Direct chat must have a partner');
            }

            // Get friendship status with the partner
            const friendshipStatus =
              await this.friendshipService.getFriendshipStatus(
                userId,
                partner.userId,
              );

            return this.transformToDirectChatDto(
              chat,
              userId,
              friendshipStatus ?? undefined,
            );
          } else {
            return this.transformToGroupChatDto(chat, userId);
          }
        }),
      );

      return chatDtos;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve user chats');
    }
  }

  private async getFullChat(chatId: string): Promise<Chat> {
    const fullChat = await this.chatRepo.findOne({
      where: { id: chatId },
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
    return fullChat;
  }

  private transformToDirectChatDto(
    chat: Chat,
    userId: string,
    friendshipStatus?: FriendshipStatus,
  ): DirectChatResponseDto {
    const chatPartner = chat.members.find((m) => m.userId !== userId);
    const chatPartnerUser = chatPartner?.user;
    const myMember = chat.members.find((m) => m.userId === userId);

    if (!chatPartner || !chatPartnerUser) {
      ErrorResponse.badRequest('Direct chat must have a partner');
    }

    // Base fields that are always included
    const chatPartnerDto: Partial<ChatPartnerDto> = {
      userId: chatPartnerUser.id,
      avatarUrl: chatPartnerUser.avatarUrl,
      nickname: chatPartner.nickname,
      firstName: chatPartnerUser.firstName,
      lastName: chatPartnerUser.lastName,
      bio: chatPartnerUser.bio,
      friendshipStatus: friendshipStatus ?? undefined,
    };

    // Only include sensitive fields if friendship is accepted
    if (friendshipStatus === FriendshipStatus.ACCEPTED) {
      Object.assign(chatPartnerDto, {
        username: chatPartnerUser.username,
        email: chatPartnerUser.email,
        phoneNumber: chatPartnerUser.phoneNumber,
        birthday: chatPartnerUser.birthday,
      });
    }

    const dto: DirectChatResponseDto = {
      id: chat.id,
      myNickname: myMember?.nickname,
      type: ChatType.DIRECT,
      updatedAt: chat.updatedAt,
      chatPartner: chatPartnerDto,
      lastMessage: chat.lastMessage
        ? this.transformLastMessageDto(chat.lastMessage, userId, chat.members)
        : null,
    };

    return dto;
  }

  private transformToGroupChatDto(
    chat: Chat,
    userId: string,
  ): GroupChatResponseDto {
    const myMember = chat.members.find((m) => m.userId === userId); // Find the current user's member record

    const dto: GroupChatResponseDto = {
      id: chat.id,
      myNickname: myMember?.nickname,
      type: chat.type as ChatType.GROUP | ChatType.CHANNEL,
      name: chat.name,
      avatarUrl: chat.avatarUrl,
      description: chat.description,
      updatedAt: chat.updatedAt,
      myRole: myMember?.role, // This can also be simplified
      lastMessage: chat.lastMessage
        ? this.transformLastMessageDto(chat.lastMessage, userId, chat.members)
        : null,
    };

    return dto;
  }

  private transformLastMessageDto(
    message: Message,
    userId: string,
    members: ChatMember[],
  ): LastMessageResponseDto {
    const senderMember = members.find((m) => m.userId === message.senderId);

    return {
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

  private async addMembers(
    chatId: string,
    memberIds: string[],
    creatorId?: string,
  ): Promise<void> {
    try {
      const membersToAdd = memberIds.map((userId) => ({
        chat: { id: chatId },
        user: { id: userId },
        role:
          userId === creatorId ? ChatMemberRole.OWNER : ChatMemberRole.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Using insert() instead of save() for better performance with multiple records
      await this.memberRepo.insert(membersToAdd);
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

      const member = chat.members.find((m) => m.userId === userId);
      if (!member) {
        ErrorResponse.unauthorized('You are not a member of this chat');
      }

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
