import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThan, Not, Raw, In } from 'typeorm';
import { Message } from './entities/message.entity';
import { Chat } from '../chat/entities/chat.entity';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { CreateMessageDto } from './dto/requests/create-message.dto';
import { UpdateMessageDto } from './dto/requests/update-message.dto';
import { ErrorResponse } from '../../common/api-response/errors';
import { GetMessagesQuery } from './dto/queries/get-messages.dto';
import { Reaction } from './entities/reaction.entity';
import { Attachment } from './entities/attachment.entity';
import { SupabaseService } from '../superbase/supabase.service';
import { BlockService } from '../block/block.service';
import { ChatType } from '../chat/constants/chat-types.constants';
import { SystemEventType } from './constants/system-event-type.constants';
import { MessageMapper } from './mappers/message.mapper';
import { WebsocketService } from '../websocket/websocket.service';
import { MessageResponseDto } from './dto/responses/message-response.dto';

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

    private readonly blockService: BlockService,
    private readonly supabaseService: SupabaseService,
    private readonly messageMapper: MessageMapper,
    private readonly websocketService: WebsocketService,
  ) {}

  async createMessage(
    senderId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    if (createMessageDto.id) {
      const existing = await this.messageRepo.findOne({
        where: { id: createMessageDto.id },
      });

      if (existing) {
        ErrorResponse.badRequest('Message with this ID already exists');
      }
    }

    const chat = await this.chatRepo.findOne({
      where: { id: createMessageDto.chatId },
      relations: ['members'],
    });
    if (!chat) {
      ErrorResponse.notFound('Chat not found');
    }

    // ⛔ Blocking check only in direct chat
    await this.ensureNoBlockingInDirectChat(senderId, chat);

    const isMember = await this.chatMemberRepo.exists({
      where: {
        chatId: createMessageDto.chatId,
        userId: senderId,
      },
    });
    if (!isMember) {
      ErrorResponse.notFound('You are not a member of this chat');
    }

    if (createMessageDto.replyToMessageId) {
      const repliedMessage = await this.messageRepo.findOne({
        where: { id: createMessageDto.replyToMessageId },
        select: ['id', 'chatId', 'replyToMessageId'], // Only select needed fields
      });

      if (!repliedMessage) {
        ErrorResponse.notFound('Replied message not found');
      }
      if (repliedMessage.chatId !== createMessageDto.chatId) {
        ErrorResponse.badRequest('Replied message is not from the same chat');
      }

      // THE GUARD - Single place to prevent reply chains
      if (repliedMessage.replyToMessageId) {
        ErrorResponse.badRequest(
          'Cannot reply to a message that is already a reply',
        );
      }
    }

    try {
      // Step 1: Save the message
      const newMessage = this.messageRepo.create({
        senderId,
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

    const chat = await this.chatRepo.findOne({
      where: { id: targetChatId },
      relations: ['members'],
    });
    if (!chat) {
      ErrorResponse.notFound('Chat not found');
    }

    // ⛔ Blocking check only in direct chat
    await this.ensureNoBlockingInDirectChat(senderId, chat);

    const newMessage = this.messageRepo.create({
      senderId,
      chatId: targetChatId,
      content: originalMessage.content,
      attachments: [...originalMessage.attachments],
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

  async createSystemEventMessage(
    chatId: string,
    senderId: string,
    eventType: SystemEventType,
    content?: string | null,
  ): Promise<MessageResponseDto> {
    const message = this.messageRepo.create({
      chatId,
      senderId,
      systemEvent: eventType,
      content: content || null, // can hold text or image URL depending on event
    });

    const savedMessage = await this.messageRepo.save(message);

    const fullMessage = await this.getFullMessageById(savedMessage.id);
    const messageResponse =
      this.messageMapper.toMessageResponseDto(fullMessage);

    await this.websocketService.emitToChatMembers(
      chatId,
      'chat:newMessage',
      messageResponse,
    );

    return messageResponse;
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
      // 👇 Fetch blocked user IDs directly inside
      const blockedUserIds =
        await this.blockService.getBlockedUserIds(currentUserId);
      const excludedSenderIds = [currentUserId, ...blockedUserIds];

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
            senderId: Not(In(excludedSenderIds)),
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
          senderId: Not(In(excludedSenderIds)),
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
  ): Promise<{ messages: Message[]; hasMore: boolean }> {
    try {
      const query = this.buildFullMessageQuery()
        .where('message.chat_id = :chatId', { chatId })
        .andWhere('message.is_deleted = false')
        .andWhere(
          `(message.deletedForUserIds IS NULL OR NOT message.deletedForUserIds @> :userIdJson)`,
          { userIdJson: JSON.stringify([currentUserId]) },
        );

      // Apply beforeMessageId for pagination
      if (queryParams.beforeMessageId) {
        const beforeMessage = await this.messageRepo.findOne({
          where: { id: queryParams.beforeMessageId },
          select: ['createdAt'],
        });

        if (beforeMessage) {
          query.andWhere('message.createdAt < :beforeDate', {
            beforeDate: beforeMessage.createdAt,
          });
        }
      }

      // Order newest to oldest in DB query
      query.orderBy('message.createdAt', 'DESC');

      if (queryParams.limit) query.take(Number(queryParams.limit));
      if (queryParams.offset) query.skip(Number(queryParams.offset));

      const messages = await query.getMany();

      // Reverse to chronological order (oldest first)
      const sortedMessages = messages.reverse();

      // Check if more messages exist
      let hasMore = false;
      if (sortedMessages.length > 0) {
        const oldest = sortedMessages[0];

        const countQuery = this.buildFullMessageQuery()
          .where('message.chat_id = :chatId', { chatId })
          .andWhere('message.is_deleted = false')
          .andWhere(
            `(message.deletedForUserIds IS NULL OR NOT message.deletedForUserIds @> :userIdJson)`,
            { userIdJson: JSON.stringify([currentUserId]) },
          )
          .andWhere('message.createdAt < :beforeDate', {
            beforeDate: oldest.createdAt,
          });

        const remainingCount = await countQuery.getCount();
        hasMore = remainingCount > 0;
      }

      return { messages: sortedMessages, hasMore };
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve conversation messages');
    }
  }

  async markMessageAsImportant(
    userId: string,
    messageId: string,
    isImportant: boolean,
  ): Promise<Message> {
    const message = await this.messageRepo.findOneBy({ id: messageId });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== userId) {
      throw new Error('Only sender can mark message as important');
    }

    message.isImportant = isImportant;
    return this.messageRepo.save(message);
  }

  // Delete message
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

  async hardDeleteMessage(userId: string, messageId: string): Promise<Message> {
    try {
      const message = await this.getFullMessageById(messageId);

      if (message.senderId !== userId) {
        ErrorResponse.unauthorized(
          'You do not have permission to delete this message',
        );
      }

      // 1. Delete all attachments from Supabase
      if (message.attachments?.length) {
        for (const attachment of message.attachments) {
          // Delete main file
          if (attachment.url) {
            await this.supabaseService.deleteFileByUrl(attachment.url);
          }

          // Delete thumbnail if exists
          if (attachment.thumbnailUrl) {
            await this.supabaseService.deleteFileByUrl(attachment.thumbnailUrl);
          }
        }

        // 2. Delete attachment records from DB
        const attachmentIds = message.attachments.map((a) => a.id);
        await this.attachmentRepo.delete(attachmentIds);
      }

      // 3. Delete the message itself
      await this.messageRepo.delete(messageId);

      return message;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to hard delete message');
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
      // For testing: Change soft delete to hard delete
      return await this.hardDeleteMessage(userId, messageId);

      // Original implementation:
      // return await this.softDeleteMessage(userId, messageId, true);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to delete message for everyone');
    }
  }

  // private buildFullMessageQuery() {
  //   return this.messageRepo
  //     .createQueryBuilder('message')
  //     .leftJoinAndSelect('message.sender', 'sender')
  //     .leftJoinAndSelect('message.chat', 'chat')
  //     .leftJoinAndSelect('chat.members', 'member', 'member.user_id = sender.id')
  //     .leftJoinAndSelect('message.reactions', 'reactions')
  //     .leftJoinAndSelect('message.replyToMessage', 'replyToMessage')
  //     .leftJoinAndSelect('replyToMessage.sender', 'replySender')
  //     .leftJoinAndSelect(
  //       'chat.members',
  //       'replyMember',
  //       'replyMember.user_id = replySender.id',
  //     )
  //     .leftJoinAndSelect('message.forwardedFromMessage', 'forwardedFromMessage')
  //     .leftJoinAndSelect('forwardedFromMessage.sender', 'forwardedSender')
  //     .leftJoinAndSelect('message.attachments', 'attachments')
  //     .leftJoinAndSelect('replyToMessage.attachments', 'replyAttachments')
  //     .leftJoinAndSelect(
  //       'forwardedFromMessage.attachments',
  //       'forwardedAttachments',
  //     )
  //     .select([
  //       'message',
  //       'sender.id',
  //       'sender.firstName',
  //       'sender.lastName',
  //       'sender.avatarUrl',
  //       'member.nickname',
  //       'reactions',
  //       'attachments',

  //       // Reply
  //       'replyToMessage.id',
  //       'replyToMessage.content',
  //       'replyToMessage.createdAt',
  //       'replySender.id',
  //       'replySender.firstName',
  //       'replySender.lastName',
  //       'replySender.avatarUrl',
  //       'replyMember.nickname',
  //       'replyAttachments',

  //       // Forward
  //       'forwardedFromMessage.id',
  //       'forwardedFromMessage.content',
  //       'forwardedFromMessage.createdAt',
  //       'forwardedSender.id',
  //       'forwardedSender.firstName',
  //       'forwardedSender.lastName',
  //       'forwardedSender.avatarUrl',
  //       'forwardedAttachments',
  //     ]);
  // }

  private buildFullMessageQuery() {
    return (
      this.messageRepo
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.sender', 'sender')
        .leftJoinAndSelect('message.chat', 'chat')
        .leftJoinAndSelect(
          'chat.members',
          'member',
          'member.user_id = sender.id',
        )
        .leftJoinAndSelect('message.reactions', 'reactions')
        .leftJoinAndSelect('message.attachments', 'attachments')

        // Direct reply message
        .leftJoinAndSelect('message.replyToMessage', 'replyToMessage')
        .leftJoinAndSelect('replyToMessage.sender', 'replySender')
        .leftJoinAndSelect('replyToMessage.attachments', 'replyAttachments')
        .leftJoinAndSelect(
          'chat.members',
          'replyMember',
          'replyMember.user_id = replySender.id',
        )

        // ✅ Forwarded message of the reply
        .leftJoinAndSelect(
          'replyToMessage.forwardedFromMessage',
          'replyForwarded',
        )
        .leftJoinAndSelect('replyForwarded.sender', 'replyForwardedSender')
        .leftJoinAndSelect(
          'replyForwarded.attachments',
          'replyForwardedAttachments',
        )

        // Direct forwarded message (of current message)
        .leftJoinAndSelect(
          'message.forwardedFromMessage',
          'forwardedFromMessage',
        )
        .leftJoinAndSelect('forwardedFromMessage.sender', 'forwardedSender')
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

          // Reply's forwarded message
          'replyForwarded.id',
          'replyForwarded.content',
          'replyForwarded.createdAt',
          'replyForwardedSender.id',
          'replyForwardedSender.firstName',
          'replyForwardedSender.lastName',
          'replyForwardedSender.avatarUrl',
          'replyForwardedAttachments',

          // Forwarded from current message
          'forwardedFromMessage.id',
          'forwardedFromMessage.content',
          'forwardedFromMessage.createdAt',
          'forwardedSender.id',
          'forwardedSender.firstName',
          'forwardedSender.lastName',
          'forwardedSender.avatarUrl',
          'forwardedAttachments',
        ])
    );
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

  private async ensureNoBlockingInDirectChat(senderId: string, chat: Chat) {
    // Apply blocking logic only for direct chats
    if (chat.type !== ChatType.DIRECT) return;

    // Add null check for chat.members
    if (!chat.members) {
      throw new Error('Chat members not loaded');
    }

    // Get the other member in a 1-on-1 chat
    const otherMember = chat.members.find((m) => m.userId !== senderId);
    if (!otherMember) return;

    const { isBlockedByMe, isBlockedMe } =
      await this.blockService.getBlockStatusBetween(
        senderId,
        otherMember.userId,
      );

    if (isBlockedByMe || isBlockedMe) {
      throw new Error(
        isBlockedByMe && isBlockedMe
          ? 'You both have blocked each other.'
          : isBlockedByMe
            ? 'You have blocked this user.'
            : 'You are blocked by this user.',
      );
    }
  }
}
