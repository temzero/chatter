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
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,

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
  ): Promise<{
    chat: ChatResponseDto;
    wasExisting: boolean;
  }> {
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
      const fullChat = await this.getFullChat(existingChat.id);
      return {
        chat: await this.chatMapper.transformToDirectChatDto(
          fullChat,
          myUserId,
        ),
        wasExisting: true,
      };
    }

    const chat = await this.chatRepo.save({
      type: ChatType.DIRECT,
      name: null,
    });

    await this.addMembers(chat.id, memberUserIds);
    const fullChat = await this.getFullChat(chat.id);

    return {
      chat: await this.chatMapper.transformToDirectChatDto(fullChat, myUserId),
      wasExisting: false,
    };
  }

  async getChatType(chatId: string): Promise<ChatType> {
    try {
      const chat = await this.chatRepo.findOne({
        where: { id: chatId },
        select: ['type'],
      });

      if (!chat) {
        ErrorResponse.notFound('Chat not found');
      }

      return chat.type;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to get chat type');
    }
  }

  async createGroupChat(
    userId: string,
    createDto: CreateGroupChatDto,
  ): Promise<ChatResponseDto> {
    const allUserIds = [userId, ...createDto.userIds];
    const memberCount = allUserIds.length;

    if (createDto.type === ChatType.GROUP && memberCount < 2) {
      ErrorResponse.badRequest('Group must have at least 2 members');
    }

    if (!createDto.name) {
      ErrorResponse.badRequest('Group or Channel must have a name');
    }

    const userCount = await this.userRepo.count({
      where: { id: In(allUserIds) },
    });

    if (userCount !== memberCount) {
      ErrorResponse.badRequest('One or more Users do not exist!');
    }

    const chat = await this.chatRepo.save(createDto);
    await this.addMembers(chat.id, allUserIds, userId);
    const fullChat = await this.getFullChat(chat.id);

    return this.chatMapper.transformToGroupChatDto(fullChat, userId);
  }

  async updateChat(
    chat: ChatResponseDto,
    updateDto: UpdateChatDto,
  ): Promise<ChatResponseDto> {
    try {
      const existingChat = await this.chatRepo.findOne({
        where: { id: chat.id },
      });

      if (!existingChat) {
        ErrorResponse.notFound('Chat not found');
      }

      Object.assign(existingChat, updateDto);
      const updatedChat = await this.chatRepo.save(existingChat);

      return plainToInstance(ChatResponseDto, updatedChat);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to update chat');
    }
  }

  async getChatById(chatId: string, userId: string): Promise<ChatResponseDto> {
    try {
      const chat = await this.getFullChat(chatId);

      if (chat.type === ChatType.DIRECT) {
        return this.chatMapper.transformToDirectChatDto(chat, userId);
      } else {
        return this.chatMapper.transformToGroupChatDto(chat, userId);
      }
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to get chat');
    }
  }

  // Inside ChatService
  async getChatsByUserId(userId: string): Promise<Array<ChatResponseDto>> {
    try {
      const chats = await this.chatRepo
        .createQueryBuilder('chat')
        .innerJoin('chat.members', 'myMember', 'myMember.user_id = :userId', {
          userId,
        })
        .leftJoinAndSelect('chat.members', 'member')
        .leftJoinAndSelect('member.user', 'memberUser')
        .leftJoinAndSelect('chat.lastMessage', 'lastMessage')
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
        )
        .orderBy('COALESCE(lastMessage.createdAt, chat.createdAt)', 'DESC')
        .getMany();

      const chatsResponse = await Promise.all(
        chats.map((chat) => {
          if (chat.type === ChatType.DIRECT) {
            return this.chatMapper.transformToDirectChatDto(
              chat,
              userId,
              this.messageService,
            );
          } else {
            return this.chatMapper.transformToGroupChatDto(
              chat,
              userId,
              this.messageService,
            );
          }
        }),
      );
      // console.log('chatsResponse', chatsResponse);
      return chatsResponse;
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
        'pinnedMessage',
        'pinnedMessage.sender',
        'pinnedMessage.attachments',
        'pinnedMessage.forwardedFromMessage',
      ],
    });

    if (!fullChat) {
      ErrorResponse.notFound('Chat not found');
    }
    return fullChat;
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

      await this.memberRepo.insert(membersToAdd);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to add chat members');
    }
  }

  async pinMessage(
    chatId: string,
    messageId: string,
    userId: string,
  ): Promise<ChatResponseDto> {
    const isParticipant = await this.isChatParticipant(chatId, userId);
    if (!isParticipant) {
      ErrorResponse.unauthorized('You are not a member of this chat');
    }

    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) {
      ErrorResponse.notFound('Chat not found');
    }

    // Unpin any existing pinned message in this chat
    await this.messageRepo.update(
      { chat: { id: chatId }, isPinned: true },
      { isPinned: false, pinnedAt: null },
    );

    // Find and update the message to pin
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!message) {
      ErrorResponse.notFound('Message not found');
    }

    message.isPinned = true;
    message.pinnedAt = new Date();
    await this.messageRepo.save(message); // ✅ Save before assigning to chat

    chat.pinnedMessage = message;
    await this.chatRepo.save(chat);

    const fullChat = await this.getFullChat(chatId);
    return this.chatMapper.transformToGroupChatDto(fullChat, userId);
  }

  async unpinMessage(chatId: string, userId: string): Promise<ChatResponseDto> {
    const isParticipant = await this.isChatParticipant(chatId, userId);
    if (!isParticipant) {
      ErrorResponse.unauthorized('You are not a member of this chat');
    }

    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) {
      ErrorResponse.notFound('Chat not found');
    }

    // Unpin all pinned messages in this chat
    await this.messageRepo.update(
      { chat: { id: chatId }, isPinned: true },
      { isPinned: false, pinnedAt: null },
    );

    chat.pinnedMessage = null;
    await this.chatRepo.save(chat);

    const fullChat = await this.getFullChat(chatId);
    return this.chatMapper.transformToGroupChatDto(fullChat, userId);
  }

  async deleteChat(chatId: string, userId: string): Promise<ChatResponseDto> {
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

      return plainToInstance(ChatResponseDto, chat);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to delete chat');
    }
  }
}
