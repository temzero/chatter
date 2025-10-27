import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { UpdateChatDto } from 'src/modules/chat/dto/requests/update-chat.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';
import { ChatMemberRole } from 'src/shared/types/enums/chat-member-role.enum';
import { ErrorResponse } from 'src/common/api-response/errors';
import { ChatType } from 'src/shared/types/enums/chat-type.enum';
import { CreateGroupChatDto } from './dto/requests/create-group-chat.dto';
import { plainToInstance } from 'class-transformer';
import { ChatMapper } from './mappers/chat.mapper';
import { MessageService } from '../message/message.service';
import { Message } from '../message/entities/message.entity';
import { SystemEventType } from 'src/shared/types/enums/system-event-type.enum';
import { PaginationQuery } from 'src/shared/types/queries/pagination-query';
import {
  ChatResponseDto,
  // ChatWithMessagesResponseDto,
} from './dto/responses/chat-response.dto';
import { PublicChatMapper } from './mappers/public-chat.mapper';
import { PaginationResponse } from 'src/shared/types/responses/pagination.response';
import { MAX_PINNED } from '../chat-member/chat-member.service';

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
    private readonly publicChatMapper: PublicChatMapper,
  ) {}

  async getInitialChats(
    userId: string,
    queries: PaginationQuery,
  ): Promise<PaginationResponse<ChatResponseDto>> {
    const savedChat = await this.getSavedChat(userId).catch(() => null);

    // 1️⃣ Get pinned chats
    const pinnedChats = await this.getPinnedChats(userId);

    // 2️⃣ Get unpinned chats (with pagination)
    const unpinnedChats = await this.getUnpinnedChats(userId, queries);

    // 3️⃣ Combine pinned + unpinned
    const combinedChats = [...pinnedChats.items, ...unpinnedChats.items];

    // Add saved chat at top if exists
    const chats = savedChat ? [savedChat, ...combinedChats] : combinedChats;

    return { items: chats, hasMore: unpinnedChats.hasMore };
  }

  async getPinnedChats(
    userId: string,
  ): Promise<PaginationResponse<ChatResponseDto>> {
    const chats = await this.buildFullChatQueryForUser(userId)
      .andWhere('chat.type != :savedType', { savedType: 'saved' })
      .andWhere('myMember.pinned_at IS NOT NULL')
      .addSelect(
        'COALESCE(lastMessage.created_at, chat.created_at)',
        'last_activity_at',
      )
      .orderBy('last_activity_at', 'DESC')
      .limit(MAX_PINNED)
      .getMany();

    const items = (
      await Promise.all(
        chats.map(async (chat) => {
          try {
            return await this.chatMapper.mapChatToChatResDto(chat, userId);
          } catch (err) {
            console.error('❌ Failed to transform pinned chat:', chat.id, err);
            return null;
          }
        }),
      )
    ).filter((dto): dto is ChatResponseDto => dto !== null);

    return { items, hasMore: false }; // pinned chats are always fixed, no pagination
  }

  async getUnpinnedChats(
    userId: string,
    queries: PaginationQuery,
  ): Promise<PaginationResponse<ChatResponseDto>> {
    const { limit = 20, offset = 0 } = queries;

    const chats = await this.buildFullChatQueryForUser(userId)
      .andWhere('chat.type != :savedType', { savedType: 'saved' })
      .andWhere('myMember.pinned_at IS NULL')
      .addSelect(
        'COALESCE(lastMessage.created_at, chat.created_at)',
        'last_activity_at',
      )
      .orderBy('last_activity_at', 'DESC')
      .skip(offset)
      .take(limit + 1) // fetch one extra to detect hasMore
      .getMany();

    const hasMore = chats.length > limit;
    if (hasMore) chats.pop(); // remove extra chat

    const items = (
      await Promise.all(
        chats.map(async (chat) => {
          try {
            return await this.chatMapper.mapChatToChatResDto(chat, userId);
          } catch (err) {
            console.error(
              '❌ Failed to transform unpinned chat:',
              chat.id,
              err,
            );
            return null;
          }
        }),
      )
    ).filter((dto): dto is ChatResponseDto => dto !== null);

    return { items, hasMore };
  }

  async getUserChat(chatId: string, userId: string): Promise<ChatResponseDto> {
    // First try to get chat with user membership
    const chat = await this.buildFullChatQueryForUser(userId)
      .andWhere('chat.id = :chatId', { chatId })
      .getOne();

    if (chat) {
      // ✅ Use unified mapper
      const chatDto = await this.chatMapper.mapChatToChatResDto(chat, userId);
      if (!chatDto) {
        ErrorResponse.notFound('Failed to map chat to response DTO');
      }
      return chatDto;
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

    const chatDto = this.publicChatMapper.map(channel);
    if (!chatDto) {
      ErrorResponse.notFound('Failed to map chat to response DTO');
    }
    return chatDto;
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

    // validate user existence
    const userCount = await this.userRepo.count({
      where: { id: In(allUserIds) },
    });
    if (userCount !== allUserIds.length) {
      ErrorResponse.badRequest('One or more Users do not exist!');
    }

    // if type is CHANNEL, override avatar with creator's avatar
    if (createDto.type === ChatType.CHANNEL) {
      const creator = await this.userRepo.findOne({
        where: { id: userId },
        select: ['id', 'avatarUrl'],
      });

      if (!creator) {
        ErrorResponse.badRequest('Creator not found!');
      }

      createDto.avatarUrl = creator?.avatarUrl ?? undefined;
    }

    const chat = await this.chatRepo.save(createDto);

    await this.addMembers(chat.id, allUserIds, userId);

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
    const savedChat = await this.chatRepo.findOne({
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

    if (!savedChat) ErrorResponse.notFound('Saved savedChat not found');
    const savedChatDto = await this.chatMapper.mapChatToChatResDto(
      savedChat,
      userId,
    );
    if (!savedChatDto) {
      ErrorResponse.notFound('Failed to map chat to response DTO');
    }
    return savedChatDto;
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

  async getChatById(chatId: string): Promise<Chat> {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
    });

    if (!chat) {
      ErrorResponse.notFound('Chat not found');
    }

    return chat;
  }

  async pinMessage(
    chatId: string,
    messageId: string,
    userId: string,
  ): Promise<Message> {
    // 1. Check participant
    if (!(await this.isChatParticipant(chatId, userId))) {
      ErrorResponse.unauthorized('You are not a member of this chat');
    }

    // 2. Load chat and current pinned message
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['pinnedMessage'],
    });
    if (!chat) ErrorResponse.notFound('Chat not found');

    // 3. Check if already pinned
    if (chat.pinnedMessage?.id === messageId) {
      ErrorResponse.badRequest('This message is already pinned');
    }

    // 4. Load message
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['sender', 'attachments', 'forwardedFromMessage'],
    });
    if (!message) ErrorResponse.notFound('Message not found');

    // 5. Unpin existing pinned message (if any)
    if (chat.pinnedMessage) {
      await this.messageRepo.update(
        { chat: { id: chatId }, isPinned: true },
        { isPinned: false, pinnedAt: null },
      );
    }

    message.isPinned = true;
    message.pinnedAt = new Date();
    await this.messageRepo.save(message);

    // 6. Update chat pinned message
    chat.pinnedMessage = message;
    await this.chatRepo.save(chat);

    // 7. Create system event message
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

    return message;
  }

  async unpinMessage(chatId: string, userId: string): Promise<Message> {
    // 1. Check participant
    if (!(await this.isChatParticipant(chatId, userId))) {
      ErrorResponse.unauthorized('You are not a member of this chat');
    }

    // 2. Load chat
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) ErrorResponse.notFound('Chat not found');

    // 3. Load currently pinned message
    const message = await this.messageRepo.findOne({
      where: { chat: { id: chatId }, isPinned: true },
      relations: ['sender', 'attachments', 'forwardedFromMessage'],
    });

    if (!message) {
      ErrorResponse.notFound('No pinned message found for this chat');
    }

    // 4. Unpin the message
    message.isPinned = false;
    message.pinnedAt = null;
    await this.messageRepo.save(message);

    // 5. Clear chat's pinned message
    chat.pinnedMessage = null;
    await this.chatRepo.save(chat);

    // 6. Return updated message
    return message;
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
    return (
      this.chatRepo
        .createQueryBuilder('chat')
        // Join the current user as myMember
        .innerJoin(
          'chat.members',
          'myMember',
          'myMember.user_id = :userId AND myMember.deleted_at IS NULL',
          { userId },
        )
        .addSelect('myMember.muted_until', 'myMember_muted_until')
        // .addSelect('myMember.pinned_at', 'myMember_pinned_at')

        // Join all chat members and their users
        .leftJoinAndSelect(
          'chat.members',
          'member',
          'member.deleted_at IS NULL',
        )
        .leftJoinAndSelect('member.user', 'memberUser')

        // Join last visible message for each member
        .leftJoinAndSelect('member.lastVisibleMessage', 'lastMessage')
        .leftJoinAndSelect('lastMessage.sender', 'sender')
        .leftJoinAndSelect('lastMessage.attachments', 'attachments')

        // Join call and its initiator
        .leftJoinAndSelect('lastMessage.call', 'lastMessageCall')
        .leftJoinAndSelect('lastMessageCall.initiator', 'callInitiator')
        .leftJoinAndSelect('callInitiator.user', 'callInitiatorUser')

        // Join forwarded messages
        .leftJoinAndSelect(
          'lastMessage.forwardedFromMessage',
          'forwardedFromMessage',
        )
        .leftJoinAndSelect(
          'forwardedFromMessage.sender',
          'forwardedFromMessageSender',
        )

        // Join pinned message
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

        // Join pinned message call and initiator
        .leftJoinAndSelect('pinnedMessage.call', 'pinnedMessageCall')
        .leftJoinAndSelect('pinnedMessageCall.initiator', 'pinnedCallInitiator')
        .leftJoinAndSelect(
          'pinnedCallInitiator.user',
          'pinnedCallInitiatorUser',
        )

        // Invite links
        .leftJoinAndSelect('chat.inviteLinks', 'inviteLinks')
    );
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
