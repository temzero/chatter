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
import { ChatResponseDto } from './dto/responses/chat-response.dto';
import { FriendshipService } from '../friendship/friendship.service';
import { FriendshipStatus } from '../friendship/constants/friendship-status.constants';
import { plainToInstance } from 'class-transformer';
import { ChatMapper } from './mappers/chat.mapper';
import { MessageService } from '../message/message.service';
import { Message } from '../message/entities/message.entity';

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
    private readonly friendshipService: FriendshipService,
    private readonly chatMapper: ChatMapper,
  ) {}

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

    const friendshipStatus = await this.friendshipService.getFriendshipStatus(
      myUserId,
      partnerId,
    );
    if (friendshipStatus === FriendshipStatus.BLOCKED) {
      ErrorResponse.badRequest('Friendship Blocked');
    }

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
      return {
        chat: await this.getUserChat(existingChat.id, myUserId),
        wasExisting: true,
      };
    }

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

  async getChatById(chatId: string, userId: string): Promise<ChatResponseDto> {
    return this.getUserChat(chatId, userId);
  }

  async getUserChats(userId: string): Promise<ChatResponseDto[]> {
    const chats = await this.buildFullChatQueryForUser(userId)
      .orderBy('COALESCE(lastMessage.createdAt, chat.createdAt)', 'DESC')
      .getMany();

    return Promise.all(
      chats.map((chat) =>
        chat.type === ChatType.DIRECT
          ? this.chatMapper.transformToDirectChatDto(
              chat,
              userId,
              this.messageService,
            )
          : this.chatMapper.transformToGroupChatDto(
              chat,
              userId,
              this.messageService,
            ),
      ),
    );
  }

  async getUserChat(chatId: string, userId: string): Promise<ChatResponseDto> {
    const chat = await this.buildFullChatQueryForUser(userId)
      .andWhere('chat.id = :chatId', { chatId })
      .getOne();

    if (!chat) ErrorResponse.notFound('Chat not found or not accessible');

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

  async pinMessage(
    chatId: string,
    messageId: string,
    userId: string,
  ): Promise<ChatResponseDto> {
    const isParticipant = await this.isChatParticipant(chatId, userId);
    if (!isParticipant)
      ErrorResponse.unauthorized('You are not a member of this chat');

    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) ErrorResponse.notFound('Chat not found');

    await this.messageRepo.update(
      { chat: { id: chatId }, isPinned: true },
      { isPinned: false, pinnedAt: null },
    );

    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!message) ErrorResponse.notFound('Message not found');

    message.isPinned = true;
    message.pinnedAt = new Date();
    await this.messageRepo.save(message);

    chat.pinnedMessage = message;
    await this.chatRepo.save(chat);

    return this.getUserChat(chatId, userId); // ✅ Already transformed
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

    return this.getUserChat(chatId, userId); // ✅ Already transformed
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
      .innerJoin('chat.members', 'myMember', 'myMember.user_id = :userId', {
        userId,
      })
      .leftJoinAndSelect('chat.members', 'member')
      .leftJoinAndSelect('member.user', 'memberUser')
      .leftJoinAndSelect('member.lastVisibleMessage', 'lastMessage')
      .leftJoinAndSelect('lastMessage.sender', 'sender')
      .leftJoinAndSelect('lastMessage.attachments', 'attachments')
      .leftJoinAndSelect(
        'lastMessage.forwardedFromMessage',
        'forwardedFromMessage',
      )
      .leftJoinAndSelect('chat.pinnedMessage', 'pinnedMessage')
      .leftJoinAndSelect('pinnedMessage.sender', 'pinnedSender')
      .leftJoinAndSelect('pinnedMessage.attachments', 'pinnedAttachments')
      .leftJoinAndSelect(
        'pinnedMessage.forwardedFromMessage',
        'pinnedForwardedFromMessage',
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
