import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { UpdateChatDto } from 'src/modules/chat/dto/requests/update-chat.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';
import { ChatMemberRole } from 'src/modules/chat-member/constants/chat-member-roles.constants';
import { ErrorResponse } from 'src/common/api-response/errors';
import { ChatType } from './constants/chat-types.constants';
import { CreateGroupChatDto } from './dto/requests/create-chat.dto';
import {
  ChatResponseDto,
  ChatWithMessagesResponseDto,
} from './dto/responses/chat-response.dto';
import { plainToInstance } from 'class-transformer';
import { ChatMapper } from './mappers/chat.mapper';
import { MessageService } from '../message/message.service';
import { Message } from '../message/entities/message.entity';
import { SystemEventType } from '../message/constants/system-event-type.constants';
import { PaginationQuery } from '../message/dto/queries/pagination-query.dto';
import InitialDataResponse from './dto/responses/initial-data-response.dto';
import { MessageMapper } from '../message/mappers/message.mapper';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatMember)
    private readonly memberRepo: Repository<ChatMember>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    private readonly messageService: MessageService,
    private readonly chatMapper: ChatMapper,
    private readonly messageMapper: MessageMapper,
  ) {}

  async getInitialChatsWithMessages(
    userId: string,
    chatLimit: number,
    messageLimit: number,
  ): Promise<InitialDataResponse> {
    // 1. Get base chats with pagination
    const { chats: baseChats, hasMore: hasMoreChats } = await this.getUserChats(
      userId,
      { limit: chatLimit },
    );

    // 2. Fetch messages for each chat
    const chatsWithMessages: ChatWithMessagesResponseDto[] = await Promise.all(
      baseChats.map(async (chat) => {
        const { messages, hasMore } =
          await this.messageService.getMessagesByChatId(chat.id, userId, {
            limit: messageLimit,
          });

        return {
          ...chat,
          messages: messages.map((m) =>
            this.messageMapper.toMessageResponseDto(m),
          ),
          hasMoreMessages: hasMore,
        };
      }),
    );

    return {
      chats: chatsWithMessages,
      hasMoreChats,
    };
  }

  async getOrCreateDirectChat(
    myUserId: string,
    partnerId: string,
  ): Promise<{ chat: ChatResponseDto; wasExisting: boolean }> {
    if (!myUserId || !partnerId) {
      ErrorResponse.badRequest('Missing userId');
    }

    const memberUserIds = [myUserId, partnerId];
    const userCount = await this.userRepo.count({
      where: { id: In(memberUserIds) },
    });
    if (userCount !== memberUserIds.length) {
      ErrorResponse.badRequest('One or more Users do not exist!');
    }

    // Modified query to check for active or soft-deleted chats
    const existingChat = await this.chatRepo
      .createQueryBuilder('chat')
      .innerJoin('chat.members', 'member1', 'member1.user_id = :user1', {
        user1: myUserId,
      })
      .innerJoin('chat.members', 'member2', 'member2.user_id = :user2', {
        user2: partnerId,
      })
      .where('chat.type = :type', { type: ChatType.DIRECT })
      // Only consider chats where both members are active (not soft-deleted)
      .andWhere('member1.deleted_at IS NULL')
      .andWhere('member2.deleted_at IS NULL')
      .getOne();

    if (existingChat) {
      return {
        chat: await this.getUserChat(existingChat.id, myUserId),
        wasExisting: true,
      };
    }

    // Create new chat if no active chat exists
    const chat = await this.chatRepo.save({
      type: ChatType.DIRECT,
      name: null,
    });
    await this.addMembers(chat.id, memberUserIds);
    return {
      chat: await this.getUserChat(chat.id, myUserId),
      wasExisting: false,
    };
  }

  async getChatType(chatId: string): Promise<ChatType> {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      select: ['type'],
    });
    if (!chat) ErrorResponse.notFound('Chat not found');
    return chat.type;
  }

  async createGroupChat(
    userId: string,
    createDto: CreateGroupChatDto,
  ): Promise<ChatResponseDto> {
    const allUserIds = [userId, ...createDto.userIds];
    if (createDto.type === ChatType.GROUP && allUserIds.length < 2) {
      ErrorResponse.badRequest('Group must have at least 2 members');
    }
    if (!createDto.name) {
      ErrorResponse.badRequest('Group or Channel must have a name');
    }

    const userCount = await this.userRepo.count({
      where: { id: In(allUserIds) },
    });
    if (userCount !== allUserIds.length) {
      ErrorResponse.badRequest('One or more Users do not exist!');
    }

    const chat = await this.chatRepo.save(createDto);
    await this.addMembers(chat.id, allUserIds, userId);

    // // ✅ Generate invite link
    // if (createDto.type === ChatType.GROUP) {
    //   await this.inviteLinkService.createInviteLink(chat.id, userId);
    // }

    return this.getUserChat(chat.id, userId);
  }

  async findSavedChat(userId: string): Promise<Chat | null> {
    return this.chatRepo
      .createQueryBuilder('chat')
      .innerJoin('chat.members', 'member')
      .where('chat.type = :type', { type: ChatType.SAVED })
      .andWhere('member.user.id = :userId', { userId })
      .getOne();
  }

  async createSavedChat(userId: string): Promise<Chat> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) ErrorResponse.notFound('User not found');

    const savedChat = await this.chatRepo.save({
      type: ChatType.SAVED,
      name: 'Saved Messages',
    });
    await this.memberRepo.save({ user: { id: userId }, chat: savedChat });
    return savedChat;
  }

  async getOrCreateSavedChat(userId: string): Promise<Chat> {
    return (await this.findSavedChat(userId)) ?? this.createSavedChat(userId);
  }

  async getSavedChat(userId: string): Promise<ChatResponseDto> {
    const chat = await this.chatRepo.findOne({
      where: { type: ChatType.SAVED, members: { user: { id: userId } } },
      relations: [
        'members',
        'members.user',
        'pinnedMessage',
        'pinnedMessage.sender',
        'pinnedMessage.attachments',
        'pinnedMessage.forwardedFromMessage',
      ],
    });

    if (!chat) ErrorResponse.notFound('Saved chat not found');
    return this.getUserChat(chat.id, userId);
  }

  async updateChat(
    chat: ChatResponseDto,
    updateDto: UpdateChatDto,
  ): Promise<ChatResponseDto> {
    const existingChat = await this.chatRepo.findOne({
      where: { id: chat.id },
    });
    if (!existingChat) ErrorResponse.notFound('Chat not found');

    Object.assign(existingChat, updateDto);
    const updatedChat = await this.chatRepo.save(existingChat);
    return plainToInstance(ChatResponseDto, updatedChat);
  }

  async getUserChats(
    userId: string,
    options: PaginationQuery = { offset: 0, limit: 20 },
  ): Promise<{ chats: ChatResponseDto[]; hasMore: boolean }> {
    const { offset, limit } = options;
    const savedChat = await this.getSavedChat(userId).catch(() => null);

    const query = this.buildFullChatQueryForUser(userId)
      .andWhere('chat.type != :savedType', { savedType: 'saved' })
      .addSelect(
        'COALESCE(lastMessage.created_at, chat.created_at)',
        'last_activity_at',
      )
      .orderBy('last_activity_at', 'DESC')
      .skip(offset ?? 0);

    // Only apply limit if provided
    if (limit != null && Number.isFinite(limit)) {
      query.take(limit + 1); // fetch 1 extra to check hasMore
    }

    const chats = await query.getMany();

    let hasMore = false;
    if (limit != null && Number.isFinite(limit)) {
      hasMore = chats.length > limit;
      if (hasMore) {
        chats.pop(); // remove the extra one
      }
    }

    const chatDtos = (
      await Promise.all(
        chats.map(async (chat) => {
          try {
            return chat.type === ChatType.DIRECT
              ? await this.chatMapper.transformToDirectChatDto(
                  chat,
                  userId,
                  this.messageService,
                )
              : await this.chatMapper.transformToGroupChatDto(
                  chat,
                  userId,
                  this.messageService,
                );
          } catch (err) {
            console.error('❌ Failed to transform chat:', chat.id, err);
            return null;
          }
        }),
      )
    ).filter((dto): dto is ChatResponseDto => dto !== null); // 👈 Type guard

    const resultChats = savedChat ? [savedChat, ...chatDtos] : chatDtos;

    return { chats: resultChats, hasMore };
  }

  async getChatById(chatId: string): Promise<Chat> {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
    });

    if (!chat) {
      ErrorResponse.notFound('Chat not found');
    }

    return chat;
  }

  async getUserChat(chatId: string, userId: string): Promise<ChatResponseDto> {
    // First try to get chat with user membership
    const chat = await this.buildFullChatQueryForUser(userId)
      .andWhere('chat.id = :chatId', { chatId })
      .getOne();

    if (chat) {
      return chat.type === ChatType.DIRECT
        ? this.chatMapper.transformToDirectChatDto(
            chat,
            userId,
            this.messageService,
          )
        : this.chatMapper.transformToGroupChatDto(
            chat,
            userId,
            this.messageService,
          );
    }

    // If not a member, allow access only if it's a public channel
    const channel = await this.chatRepo.findOne({
      where: { id: chatId, type: ChatType.CHANNEL },
      relations: [
        'members',
        'members.user',
        'pinnedMessage',
        'pinnedMessage.sender',
        'pinnedMessage.attachments',
        'pinnedMessage.forwardedFromMessage',
      ],
    });

    if (!channel) {
      ErrorResponse.notFound('Chat not found or not accessible');
    }

    return this.chatMapper.transformToPublicChatDto(channel);
  }

  async pinMessage(
    chatId: string,
    messageId: string,
    userId: string,
  ): Promise<ChatResponseDto> {
    const isParticipant = await this.isChatParticipant(chatId, userId);
    if (!isParticipant)
      ErrorResponse.unauthorized('You are not a member of this chat');

    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['pinnedMessage'], // Include pinnedMessage relation
    });
    if (!chat) ErrorResponse.notFound('Chat not found');

    // Check if the message is already pinned
    if (chat.pinnedMessage?.id === messageId) {
      ErrorResponse.badRequest('This message is already pinned');
    }

    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['attachments', 'forwardedFromMessage'],
    });
    if (!message) ErrorResponse.notFound('Message not found');

    // Unpin all other messages (only if we're pinning a different message)
    if (chat.pinnedMessage?.id !== messageId) {
      await this.messageRepo.update(
        { chat: { id: chatId }, isPinned: true },
        { isPinned: false, pinnedAt: null },
      );
    }

    // Update and save the pinned message
    message.isPinned = true;
    message.pinnedAt = new Date();
    await this.messageRepo.save(message);

    // Update chat's pinned message
    chat.pinnedMessage = message;
    await this.chatRepo.save(chat);

    await this.messageService.createSystemEventMessage(
      chatId,
      userId,
      SystemEventType.MESSAGE_PINNED,
      {
        newValue:
          typeof message.content === 'string'
            ? message.content.length > 100
              ? message.content.slice(0, 97) + '...'
              : message.content
            : undefined,
        targetId: message.id,
      },
    );

    return this.getUserChat(chatId, userId);
  }

  async unpinMessage(chatId: string, userId: string): Promise<ChatResponseDto> {
    const isParticipant = await this.isChatParticipant(chatId, userId);
    if (!isParticipant)
      ErrorResponse.unauthorized('You are not a member of this chat');

    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) ErrorResponse.notFound('Chat not found');

    await this.messageRepo.update(
      { chat: { id: chatId }, isPinned: true },
      { isPinned: false, pinnedAt: null },
    );

    chat.pinnedMessage = null;
    await this.chatRepo.save(chat);

    return this.getUserChat(chatId, userId);
  }

  async deleteChat(chatId: string, userId: string): Promise<ChatResponseDto> {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['members'],
    });
    if (!chat) ErrorResponse.notFound('Chat not found');

    const member = chat.members.find((m) => m.userId === userId);
    if (!member)
      ErrorResponse.unauthorized('You are not a member of this chat');

    if (chat.type !== ChatType.DIRECT && member.role !== ChatMemberRole.OWNER) {
      ErrorResponse.unauthorized('Only owners can delete group chats');
    }

    await this.chatRepo.delete(chatId);
    return plainToInstance(ChatResponseDto, chat);
  }

  private buildFullChatQueryForUser(userId: string) {
    return this.chatRepo
      .createQueryBuilder('chat')
      .innerJoin(
        'chat.members',
        'myMember',
        'myMember.user_id = :userId AND myMember.deleted_at IS NULL',
        { userId },
      )
      .addSelect('myMember.muted_until', 'myMember_muted_until')
      .leftJoinAndSelect('chat.members', 'member', 'member.deleted_at IS NULL')
      .leftJoinAndSelect('member.user', 'memberUser')
      .leftJoinAndSelect('member.lastVisibleMessage', 'lastMessage')
      .leftJoinAndSelect('lastMessage.sender', 'sender')
      .leftJoinAndSelect('lastMessage.attachments', 'attachments')
      .leftJoinAndSelect(
        'lastMessage.forwardedFromMessage',
        'forwardedFromMessage',
      )
      .leftJoinAndSelect(
        'forwardedFromMessage.sender',
        'forwardedFromMessageSender',
      ) // Add this
      .leftJoinAndSelect('chat.pinnedMessage', 'pinnedMessage')
      .leftJoinAndSelect('pinnedMessage.sender', 'pinnedSender')
      .leftJoinAndSelect('pinnedMessage.attachments', 'pinnedAttachments')
      .leftJoinAndSelect(
        'pinnedMessage.forwardedFromMessage',
        'pinnedForwardedFromMessage',
      )
      .leftJoinAndSelect(
        'pinnedForwardedFromMessage.sender',
        'pinnedForwardedFromMessageSender',
      )
      .leftJoinAndSelect('chat.inviteLinks', 'inviteLinks');
  }

  async isChatParticipant(chatId: string, userId: string): Promise<boolean> {
    return this.memberRepo.exist({
      where: { chat: { id: chatId }, user: { id: userId } },
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

  private async addMembers(
    chatId: string,
    memberIds: string[],
    creatorId?: string,
  ): Promise<void> {
    const membersToAdd = memberIds.map((userId) => ({
      chat: { id: chatId },
      user: { id: userId },
      role: userId === creatorId ? ChatMemberRole.OWNER : ChatMemberRole.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await this.memberRepo.insert(membersToAdd);
  }
}
