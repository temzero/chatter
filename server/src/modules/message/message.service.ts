import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThan, Not, Raw } from 'typeorm';
import { Message } from './entities/message.entity';
import { Chat } from '../chat/entities/chat.entity';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { CreateMessageDto } from './dto/requests/create-message.dto';
import { UpdateMessageDto } from './dto/requests/update-message.dto';
import { ErrorResponse } from '../../common/api-response/errors';
import { GetMessagesQuery } from './dto/queries/get-messages.dto';
import { Reaction } from './entities/reaction.entity';
import { Attachment } from './entities/attachment.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepo: Repository<ChatMember>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Attachment)
    private readonly attachmentRepo: Repository<Attachment>,
    @InjectRepository(Reaction)
    private readonly reactionRepo: Repository<Reaction>,
  ) {}

  async createMessage(
    userId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const chat = await this.chatRepo.findOne({
      where: { id: createMessageDto.chatId },
    });
    if (!chat) {
      ErrorResponse.notFound('Chat not found');
    }

    const isMember = await this.chatMemberRepo.exists({
      where: {
        chatId: createMessageDto.chatId,
        userId: userId,
      },
    });
    if (!isMember) {
      ErrorResponse.notFound('You are not a member of this chat');
    }

    if (createMessageDto.replyToMessageId) {
      const repliedMessage = await this.messageRepo.findOne({
        where: { id: createMessageDto.replyToMessageId },
      });
      if (!repliedMessage) {
        ErrorResponse.notFound('Replied message not found');
      }
      if (repliedMessage.chatId !== createMessageDto.chatId) {
        ErrorResponse.badRequest('Replied message is not from the same chat');
      }
    }

    try {
      // Step 1: Save the message
      const newMessage = this.messageRepo.create({
        senderId: userId,
        ...createMessageDto,
      });

      const savedMessage = await this.messageRepo.save(newMessage);

      // Step 2: Save attachments if any
      if (createMessageDto.attachments?.length) {
        const attachmentEntities = createMessageDto.attachments.map((att) =>
          this.attachmentRepo.create({
            messageId: savedMessage.id,
            type: att.type,
            url: att.url,
            thumbnailUrl: att.thumbnailUrl || null,
            filename: att.filename || null,
            size: att.size || null,
            mimeType: att.mimeType || null,
            width: att.width || null,
            height: att.height || null,
            duration: att.duration || null,
          }),
        );

        await this.attachmentRepo.save(attachmentEntities);
      }

      // Step 3: Update last visible message
      await this.chatMemberRepo.update(
        { chatId: chat.id },
        { lastVisibleMessageId: savedMessage.id },
      );

      // Step 4: Return full message with joined relations
      const fullMessage = await this.getFullMessageById(savedMessage.id);
      return fullMessage;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to create message');
    }
  }

  async createForwardedMessage(
    senderId: string,
    targetChatId: string,
    messageId: string,
  ): Promise<Message> {
    const messageToForward = await this.getFullMessageById(messageId);
    if (!messageToForward) {
      ErrorResponse.badRequest(`Message ${messageId} not found`);
    }

    const originalMessage =
      messageToForward.forwardedFromMessage ?? messageToForward;

    const chat = await this.chatRepo.findOne({ where: { id: targetChatId } });
    if (!chat) {
      ErrorResponse.notFound('Chat not found');
    }

    const newMessage = this.messageRepo.create({
      senderId,
      chatId: targetChatId,
      forwardedFromMessage: originalMessage,
    });

    const savedMessage = await this.messageRepo.save(newMessage);

    // ✅ Update lastVisibleMessageId for all members
    await this.chatMemberRepo.update(
      { chatId: chat.id },
      { lastVisibleMessageId: savedMessage.id },
    );

    return this.getFullMessageById(savedMessage.id);
  }

  async getMessageById(id: string): Promise<Message> {
    try {
      const message = await this.messageRepo.findOne({
        where: { id },
        relations: ['sender', 'chat'],
      });

      if (!message) {
        ErrorResponse.notFound('Message not found');
      }

      return message;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve message');
    }
  }

  async searchMessages(chatId: string, searchTerm: string): Promise<Message[]> {
    try {
      return await this.messageRepo.find({
        where: {
          chat: { id: chatId },
          content: Like(`%${searchTerm}%`),
        },
        relations: ['sender', 'chat'],
      });
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to search messages');
    }
  }

  async getLastMessage(chatId: string): Promise<Message | null> {
    try {
      return await this.messageRepo.findOne({
        where: { chat: { id: chatId } },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve last message');
    }
  }

  async getUnreadMessageCount(
    chatId: string,
    lastReadMessageId: string | null,
    currentUserId: string,
  ): Promise<number> {
    if (!lastReadMessageId) return 0;

    try {
      const lastMessage = await this.messageRepo.findOne({
        where: {
          chatId,
          isDeleted: false,
        },
        order: {
          createdAt: 'DESC',
        },
        select: ['id'],
      });

      if (!lastMessage || lastMessage.id === lastReadMessageId) {
        return 0;
      }

      const lastReadMessage = await this.messageRepo.findOne({
        where: { id: lastReadMessageId },
        select: ['id', 'createdAt'],
      });

      if (lastReadMessage) {
        const count = await this.messageRepo.count({
          where: {
            chatId,
            createdAt: MoreThan(lastReadMessage.createdAt),
            isDeleted: false,
            senderId: Not(currentUserId),
          },
        });
        return Math.max(0, count - 1);
      }

      const deletedMessage = await this.messageRepo.findOne({
        where: { id: lastReadMessageId },
        withDeleted: true,
        select: ['createdAt'],
      });

      if (!deletedMessage) {
        return 0;
      }

      const count = await this.messageRepo.count({
        where: {
          chatId,
          createdAt: MoreThan(deletedMessage.createdAt),
          isDeleted: false,
          senderId: Not(currentUserId),
        },
      });
      return Math.max(0, count - 1);
    } catch (error) {
      console.error('Failed to count unread messages:', error);
      return 0;
    }
  }

  async updateMessage(
    id: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    try {
      const message = await this.getMessageById(id);

      if (updateMessageDto.content) {
        message.content = updateMessageDto.content;
        message.updatedAt = new Date();
      }

      return await this.messageRepo.save(message);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to update message');
    }
  }

  async softDeleteMessage(
    userId: string,
    messageId: string,
    clearDeletedForUsers = false,
  ): Promise<Message> {
    try {
      const message = await this.getMessageById(messageId);

      if (message.senderId !== userId) {
        ErrorResponse.unauthorized(
          'You do not have permission to soft delete this message',
        );
      }

      if (message.isDeleted) return message;

      message.isDeleted = true;
      message.deletedAt = new Date();

      if (clearDeletedForUsers) {
        message.deletedForUserIds = null;
      }

      await this.messageRepo.save(message);

      const members = await this.chatMemberRepo.find({
        where: { chatId: message.chatId },
      });

      const userIds = members.map((m) => m.userId);
      await this.updateLastVisibleMessageIfMatch(
        message.chatId,
        message.id,
        userIds,
      );

      return message;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to soft delete message');
    }
  }

  async deleteMessage(userId: string, messageId: string): Promise<Message> {
    try {
      const message = await this.getMessageById(messageId);

      if (message.senderId !== userId) {
        ErrorResponse.unauthorized(
          'You do not have permission to delete this message',
        );
      }
      await this.messageRepo.delete(messageId);
      return message;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to delete message');
    }
  }

  async deleteForMe(userId: string, messageId: string): Promise<Message> {
    try {
      const message = await this.getMessageById(messageId);

      if (!message.deletedForUserIds) {
        message.deletedForUserIds = [];
      }

      if (!message.deletedForUserIds.includes(userId)) {
        message.deletedForUserIds = [...message.deletedForUserIds, userId];
        await this.messageRepo.save(message);

        await this.updateLastVisibleMessageIfMatch(message.chatId, message.id, [
          userId,
        ]);
      }

      return message;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to delete message for user');
    }
  }

  async deleteForEveryone(userId: string, messageId: string): Promise<Message> {
    try {
      // Reuse soft delete with flag to clear deletedForUserIds
      return await this.softDeleteMessage(userId, messageId, true);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to delete message for everyone');
    }
  }

  // Reaction:
  async toggleReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<void> {
    try {
      const existing = await this.reactionRepo.findOne({
        where: { messageId, userId },
      });

      if (existing) {
        if (existing.emoji === emoji) {
          // Toggle off
          await this.reactionRepo.delete({ id: existing.id });
        } else {
          // Update emoji
          existing.emoji = emoji;
          await this.reactionRepo.save(existing);
        }
      } else {
        // New reaction
        const reaction = this.reactionRepo.create({
          messageId,
          userId,
          emoji,
        });
        await this.reactionRepo.save(reaction);
      }
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to toggle reaction');
    }
  }

  async getReactionsForMessage(messageId: string): Promise<Reaction[]> {
    try {
      return await this.reactionRepo.find({ where: { messageId } });
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve reactions');
    }
  }

  /**
   * Groups reactions by emoji -> userId[]
   */
  formatReactions(reactions: Reaction[]): { [emoji: string]: string[] } {
    const grouped: { [emoji: string]: string[] } = {};
    for (const r of reactions) {
      if (!grouped[r.emoji]) grouped[r.emoji] = [];
      grouped[r.emoji].push(r.userId);
    }
    return grouped;
  }

  private async getFullMessageById(id: string): Promise<Message> {
    try {
      return await this.buildFullMessageQuery()
        .where('message.id = :id', { id })
        .getOneOrFail();
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to get full message');
    }
  }

  async getMessagesByChatId(
    chatId: string,
    currentUserId: string,
    queryParams: GetMessagesQuery,
  ): Promise<Message[]> {
    try {
      const query = this.buildFullMessageQuery()
        .where('message.chat_id = :chatId', { chatId })
        .andWhere('message.is_deleted = :isDeleted', { isDeleted: false })
        .andWhere(
          `(message.deletedForUserIds IS NULL OR NOT message.deletedForUserIds @> :userIdJson)`,
          { userIdJson: JSON.stringify([currentUserId]) },
        )
        .orderBy('message.createdAt', 'DESC');

      if (queryParams.limit) query.take(queryParams.limit);
      if (queryParams.offset) query.skip(queryParams.offset);

      const messages = await query.getMany();
      return messages.reverse(); // reverse for chronological order
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve conversation messages');
    }
  }

  private buildFullMessageQuery() {
    return this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.chat', 'chat')
      .leftJoinAndSelect('chat.members', 'member', 'member.user_id = sender.id')
      .leftJoinAndSelect('message.reactions', 'reactions')
      .leftJoinAndSelect('message.replyToMessage', 'replyToMessage')
      .leftJoinAndSelect('replyToMessage.sender', 'replySender')
      .leftJoinAndSelect(
        'chat.members',
        'replyMember',
        'replyMember.user_id = replySender.id',
      )
      .leftJoinAndSelect('message.forwardedFromMessage', 'forwardedFromMessage')
      .leftJoinAndSelect('forwardedFromMessage.sender', 'forwardedSender')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .leftJoinAndSelect('replyToMessage.attachments', 'replyAttachments')
      .leftJoinAndSelect(
        'forwardedFromMessage.attachments',
        'forwardedAttachments',
      )
      .select([
        'message',
        'sender.id',
        'sender.firstName',
        'sender.lastName',
        'sender.avatarUrl',
        'member.nickname',
        'reactions',
        'attachments',

        // Reply
        'replyToMessage.id',
        'replyToMessage.content',
        'replyToMessage.createdAt',
        'replySender.id',
        'replySender.firstName',
        'replySender.lastName',
        'replySender.avatarUrl',
        'replyMember.nickname',
        'replyAttachments',

        // Forward
        'forwardedFromMessage.id',
        'forwardedFromMessage.content',
        'forwardedFromMessage.createdAt',
        'forwardedSender.id',
        'forwardedSender.firstName',
        'forwardedSender.lastName',
        'forwardedSender.avatarUrl',
        'forwardedAttachments',
      ]);
  }

  private async updateLastVisibleMessageIfMatch(
    chatId: string,
    messageId: string,
    userIds: string[],
  ): Promise<void> {
    const members = await this.chatMemberRepo.findBy(
      userIds.map((userId) => ({ chatId, userId })),
    );

    for (const member of members) {
      if (member.lastVisibleMessageId !== messageId) continue;

      const fallback = await this.messageRepo.findOne({
        where: {
          chatId,
          isDeleted: false,
          id: Not(messageId),
          deletedForUserIds: Raw(
            (alias) =>
              `(${alias} IS NULL OR NOT (${alias} @> '["${member.userId}"]'::jsonb))`,
          ),
        },
        order: { createdAt: 'DESC' },
      });

      await this.chatMemberRepo.update(
        { chatId, userId: member.userId },
        { lastVisibleMessageId: fallback?.id || null },
      );
    }
  }
}
