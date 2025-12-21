import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThan, Not, Raw, In } from 'typeorm';
import { Message } from './entities/message.entity';
import { Chat } from '../chat/entities/chat.entity';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { CreateMessageDto } from './dto/requests/create-message.dto';
import { UpdateMessageDto } from './dto/requests/update-message.dto';
import { ErrorResponse } from '../../common/api-response/errors';
import { Reaction } from './entities/reaction.entity';
import { BlockService } from '../block/block.service';
import { ChatType } from '@shared/types/enums/chat-type.enum';
import { SystemEventType } from '@shared/types/enums/system-event-type.enum';
import { MessageMapper } from './mappers/message.mapper';
import { MessageResponseDto } from './dto/responses/message-response.dto';
import { User } from '../user/entities/user.entity';
import { ChatEvent } from '@shared/types/enums/websocket-events.enum';
import { ChatMemberRole } from '@shared/types/enums/chat-member-role.enum';
import { PaginationQuery } from '@shared/types/queries/pagination-query';
import { WebsocketNotificationService } from '../websocket/services/websocket-notification.service';
import { Call } from '../call/entities/call.entity';
import { PaginationResponse } from '@shared/types/responses/pagination.response';
import { LinkPreviewService } from './linkPreview.service';
import { AttachmentService } from '../attachment/attachment.service';
import { Attachment } from '../attachment/entity/attachment.entity';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '@shared/types/enums/error-message.enum';
import { extractFirstUrl, removeUrlFromText } from '@/shared/extractFirstUrl';
import { LinkPreviewResponseDto } from './dto/responses/link-preview-response';

type MessageWithSenderMember = Message & {
  senderMember?: ChatMember;
};

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepo: Repository<ChatMember>,
    @InjectRepository(Reaction)
    private readonly reactionRepo: Repository<Reaction>,
    @InjectRepository(Message)
    public readonly messageRepo: Repository<Message>,
    @InjectRepository(Call)
    public readonly callRepo: Repository<Call>,

    private readonly attachmentService: AttachmentService,
    private readonly blockService: BlockService,
    private readonly messageMapper: MessageMapper,
    private readonly websocketNotificationService: WebsocketNotificationService,
    private readonly linkPreviewService: LinkPreviewService,
  ) {}

  async createMessage(
    senderId: string,
    dto: CreateMessageDto & { call?: Call },
  ): Promise<Message> {
    if (dto.replyToMessageId) {
      ErrorResponse.badRequest(BadRequestError.USE_CREATE_REPLY_MESSAGE);
    }

    const chat = await this.chatRepo.findOne({
      where: { id: dto.chatId },
      relations: ['members'],
    });
    if (!chat) ErrorResponse.notFound(NotFoundError.CHAT_NOT_FOUND);

    await this.ensureNoBlockingInDirectChat(senderId, chat);

    const isMember = await this.chatMemberRepo.exists({
      where: { chatId: dto.chatId, userId: senderId },
    });
    if (!isMember) ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);

    // ✅ Handle attachments first
    let attachments: Attachment[] = [];
    if (dto.attachments?.length) {
      attachments = await this.attachmentService.createAttachments(
        dto.attachments,
      );
    }

    // ✅ Create message WITH attachments
    const message = this.messageRepo.create({
      id: dto.id,
      chatId: dto.chatId,
      senderId,
      content: dto.content,
      attachments,
      call: dto.call,
    });

    const savedMessage = await this.messageRepo.save(message);

    // ✅ Update last visible message
    await this.chatMemberRepo.update(
      { chatId: dto.chatId },
      { lastVisibleMessage: savedMessage || null },
    );

    // ✅ RELOAD with all relations
    // Reload full message with relations
    const fullMessage = await this.getFullMessageById(savedMessage.id);

    // 🔹 Start async link preview (do not await)
    void this.handleAsyncLinkPreview(fullMessage);

    return fullMessage;
  }

  private async handleAsyncLinkPreview(message: Message) {
    const messageId = message.id;
    const messageContent = message.content;

    if (!messageId || !messageContent) return;

    try {
      const url = extractFirstUrl(messageContent);
      if (!url) return;

      const metadata: LinkPreviewResponseDto | null =
        await this.linkPreviewService.fetchPreview(url);
      if (!metadata) return;

      // ✅ Create LINK attachment with metadata
      await this.attachmentService.createLinkPreviewAttachment({
        url,
        metadata,
        messageId,
      });

      // 🧹 Remove URL from message content
      const cleanedContent = removeUrlFromText(messageContent, url);

      const messageResponse = await this.updateMessage(messageId, {
        content: cleanedContent || null,
      });

      // 🔔 Notify clients
      await this.websocketNotificationService.emitToChatMembers<
        Partial<MessageResponseDto>
      >(message.chatId, ChatEvent.UPDATE_MESSAGE, messageResponse);
    } catch (err) {
      console.warn('Async link preview failed for message', messageId, err);
    }
  }

  async updateMessage(
    id: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<MessageResponseDto> {
    try {
      // 1. Update the message
      await this.messageRepo.update(id, updateMessageDto);

      // 2. Fetch the updated message
      const updatedMessage = await this.getMessageById(id);

      // 3. Map to response DTO
      return this.messageMapper.mapMessageToMessageResDto(updatedMessage);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to update message');
    }
  }

  async createReplyMessage(
    senderId: string,
    dto: CreateMessageDto,
  ): Promise<Message> {
    if (!dto.replyToMessageId) {
      ErrorResponse.badRequest(BadRequestError.MISSING_REPLY_TO_MESSAGE_ID);
    }

    const chat = await this.chatRepo.findOne({
      where: { id: dto.chatId },
      relations: ['members'],
    });
    if (!chat) ErrorResponse.notFound(NotFoundError.CHAT_NOT_FOUND);

    await this.ensureNoBlockingInDirectChat(senderId, chat);

    const isMember = await this.chatMemberRepo.exists({
      where: { chatId: dto.chatId, userId: senderId },
    });
    if (!isMember) ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);

    const replyToMessage = await this.messageRepo.findOne({
      where: { id: dto.replyToMessageId },
    });
    if (!replyToMessage)
      ErrorResponse.notFound(NotFoundError.MESSAGE_NOT_FOUND);
    if (replyToMessage.chatId !== dto.chatId) {
      ErrorResponse.forbidden(ForbiddenError.REPLIED_MESSAGE_OTHER_CHAT);
    }
    if (replyToMessage.isDeleted) {
      ErrorResponse.forbidden(ForbiddenError.CANNOT_REPLY_TO_DELETED);
    }
    if (replyToMessage.replyToMessageId) {
      ErrorResponse.forbidden(ForbiddenError.CANNOT_REPLY_TO_REPLY);
    }

    let attachments: Attachment[] = [];
    if (dto.attachments?.length) {
      attachments = await this.attachmentService.createAttachments(
        dto.attachments,
      );
    }

    const message = this.messageRepo.create({
      id: dto.id,
      chatId: dto.chatId,
      senderId,
      content: dto.content,
      replyToMessageId: dto.replyToMessageId,
      replyToMessage: replyToMessage,
      attachments,
    });

    const savedMessage = await this.messageRepo.save(message);

    // ✅ Increment reply count
    await this.messageRepo.increment(
      { id: dto.replyToMessageId },
      'replyCount',
      1,
    );

    await this.chatMemberRepo.update(
      { chatId: dto.chatId },
      { lastVisibleMessage: savedMessage },
    );

    return await this.getFullMessageById(savedMessage.id);
  }

  async createForwardedMessage(
    senderId: string,
    targetChatId: string,
    messageId: string,
  ): Promise<Message> {
    const messageToForward = await this.getFullMessageById(messageId);
    if (!messageToForward) {
      ErrorResponse.notFound(NotFoundError.MESSAGE_NOT_FOUND);
    }

    const originalMessage =
      messageToForward.forwardedFromMessage ?? messageToForward;

    const chat = await this.chatRepo.findOne({
      where: { id: targetChatId },
      relations: ['members'],
    });
    if (!chat) {
      ErrorResponse.notFound(NotFoundError.CHAT_NOT_FOUND);
    }

    const myMember = chat.members.find((m) => m.userId === senderId);
    if (!myMember) {
      ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);
    }

    this.ensureCanForwardInChannel(chat, myMember);
    await this.ensureNoBlockingInDirectChat(senderId, chat);

    const newMessage = this.messageRepo.create({
      senderId,
      chatId: targetChatId,
      content: originalMessage.content,
      forwardedFromMessage: originalMessage,
      attachments: originalMessage.attachments,
    });

    const savedMessage = await this.messageRepo.save(newMessage);

    await this.chatMemberRepo.update(
      { chatId: chat.id },
      { lastVisibleMessage: savedMessage },
    );

    return this.getFullMessageById(savedMessage.id);
  }

  async createSystemEventMessage(
    chatId: string,
    senderId: string,
    eventType?: SystemEventType,
    options?: {
      oldValue?: string;
      newValue?: string;
      targetId?: string;
      targetName?: string;
    },
  ): Promise<MessageResponseDto> {
    let targetName: string | undefined;
    if (options?.targetId && options.targetId !== senderId) {
      targetName =
        options.targetName ?? (await this.getUserFirstName(options.targetId));
    }

    const message = this.messageRepo.create({
      chatId,
      senderId,
      systemEvent: eventType,
      content: this.formatSystemMessageContent(
        options?.oldValue,
        options?.newValue,
        options?.targetId,
        targetName,
      ),
    });

    const savedMessage = await this.messageRepo.save(message);

    // ✅ Update lastVisibleMessageId for all chat members
    await this.chatMemberRepo.update(
      { chatId },
      { lastVisibleMessage: savedMessage },
    );

    const fullMessage = await this.getFullMessageById(savedMessage.id);
    const messageResponse =
      this.messageMapper.mapMessageToMessageResDto(fullMessage);

    await this.websocketNotificationService.emitToChatMembers<MessageResponseDto>(
      chatId,
      ChatEvent.NEW_MESSAGE,
      messageResponse,
    );

    return messageResponse;
  }

  async getMessageById(id: string): Promise<Message> {
    try {
      const message = await this.messageRepo.findOne({
        where: { id },
        relations: ['sender', 'chat', 'call', 'attachments'],
      });

      if (!message) {
        ErrorResponse.notFound(NotFoundError.MESSAGE_NOT_FOUND);
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
        relations: ['sender', 'chat', 'call', 'attachments'],
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
        relations: ['attachments'],
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
    query?: PaginationQuery,
  ): Promise<PaginationResponse<MessageResponseDto>> {
    const { limit = 20, offset = 0, lastId } = query ?? {};
    try {
      const messagesQuery = this.buildFullMessageQuery()
        .where('message.chat_id = :chatId', { chatId })
        .andWhere('message.is_deleted = false')
        .andWhere(
          `(message.deletedForUserIds IS NULL OR NOT message.deletedForUserIds @> :userIds)`,
          { userIds: [currentUserId] },
        );

      // Apply lastId for pagination
      if (lastId) {
        const beforeMessage = await this.messageRepo.findOne({
          where: { id: lastId },
          select: ['createdAt'],
        });

        if (beforeMessage) {
          messagesQuery.andWhere('message.createdAt < :beforeDate', {
            beforeDate: beforeMessage.createdAt,
          });
        }
      }

      // Order newest to oldest in DB query
      messagesQuery.orderBy('message.createdAt', 'DESC');
      messagesQuery.take(Number(limit));
      messagesQuery.skip(Number(offset));

      const messages =
        (await messagesQuery.getMany()) as MessageWithSenderMember[];

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
            `(message.deletedForUserIds IS NULL OR NOT message.deletedForUserIds @> :userIds)`,
            { userIds: [currentUserId] },
          )
          .andWhere('message.createdAt < :beforeDate', {
            beforeDate: oldest.createdAt,
          });

        const remainingCount = await countQuery.getCount();
        hasMore = remainingCount > 0;
      }

      const messagesResponse = sortedMessages.map((message) => {
        return this.messageMapper.mapMessageToMessageResDto(message);
      });

      // response with sender nickname
      // const messagesResponse = await Promise.all(
      //   sortedMessages.map(async (message) => {
      //     const senderMember =
      //       await this.chatMemberService.getMemberByChatIdAndUserId(
      //         message.chatId,
      //         message.senderId,
      //       );
      //     console.log(
      //       'Mapping message with senderMember:',
      //       senderMember.nickname,
      //     );
      //     return this.messageMapper.mapMessageToMessageResDto(
      //       message,
      //       senderMember.nickname || undefined,
      //     );
      //   }),
      // );

      return { items: messagesResponse, hasMore };
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve conversation messages');
    }
  }

  async markMessageAsImportant(
    userId: string,
    messageId: string,
    isImportant: boolean,
  ): Promise<boolean> {
    const message = await this.messageRepo.findOneBy({ id: messageId });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== userId) {
      throw new Error('Only sender can mark message as important');
    }

    await this.messageRepo.update(message.id, { isImportant });
    return isImportant;
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
        ErrorResponse.forbidden(ForbiddenError.ACTION_NOT_ALLOWED);
      }

      if (message.isDeleted) return message;

      message.isDeleted = true;
      message.deletedAt = new Date();

      if (clearDeletedForUsers) {
        message.deletedForUserIds = [];
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
        ErrorResponse.forbidden(ForbiddenError.ACTION_NOT_ALLOWED);
      }

      // ✅ Single call to handle all attachment deletion + file cleanup
      await this.attachmentService.deleteAttachmentsByMessageId(messageId);

      // Delete the message itself
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

        // ✅ Call relation (only fields that exist in Call entity)
        .leftJoinAndSelect('message.call', 'call')
        .leftJoinAndSelect('call.initiator', 'callInitiator')

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

        // Direct forwarded message (of current message)
        .leftJoinAndSelect(
          'message.forwardedFromMessage',
          'forwardedFromMessage',
        )
        .leftJoinAndSelect('forwardedFromMessage.sender', 'forwardedSender')
        .select([
          'message',

          // Sender
          'sender.id',
          'sender.firstName',
          'sender.lastName',
          'sender.avatarUrl',
          'member.nickname',
          'reactions',
          'attachments',

          // ✅ Call fields
          'call.id',
          'call.status',
          'call.startedAt',
          'call.endedAt',
          'call.createdAt',
          'call.updatedAt',
          'callInitiator.id',
          'callInitiator.userId',
          'callInitiator.nickname',

          // Reply
          'replyToMessage.id',
          'replyToMessage.content',
          'replyToMessage.systemEvent',
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

          // Forwarded from current message
          'forwardedFromMessage.id',
          'forwardedFromMessage.createdAt',
          'forwardedSender.id',
          'forwardedSender.firstName',
          'forwardedSender.lastName',
          'forwardedSender.avatarUrl',
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
      if (member.lastVisibleMessage?.id !== messageId) continue;

      const fallback = await this.messageRepo.findOne({
        where: {
          chatId,
          isDeleted: false,
          id: Not(messageId),
          deletedForUserIds: Raw((alias) => `(:userId <> ALL(${alias}))`, {
            userId: member.userId,
          }),
        },
        order: { createdAt: 'DESC' },
      });

      await this.chatMemberRepo.update(
        { chatId, userId: member.userId },
        { lastVisibleMessage: fallback || null },
      );
    }
  }

  private async getUserFirstName(userId: string): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['firstName'],
    });
    return user?.firstName || '';
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

  private formatSystemMessageContent(
    oldValue?: string,
    newValue?: string,
    targetId?: string,
    targetName?: string,
  ): string | null {
    const content: Record<string, string> = {};

    if (oldValue !== undefined) content.oldValue = oldValue;
    if (newValue !== undefined) content.newValue = newValue;
    if (targetId !== undefined) content.targetId = targetId;
    if (targetName !== undefined) content.targetName = targetName;

    return Object.keys(content).length > 0 ? JSON.stringify(content) : null;
  }

  private ensureCanForwardInChannel(chat: Chat, member: ChatMember) {
    if (chat.type !== ChatType.CHANNEL) {
      return; // Not a channel → no extra checks
    }

    switch (member.role) {
      case ChatMemberRole.GUEST:
        ErrorResponse.forbidden(ForbiddenError.USER_CANNOT_FORWARD_IN_CHANNEL);
        break;
      case ChatMemberRole.MEMBER:
        if (chat.is_broadcast_only) {
          ErrorResponse.forbidden(
            ForbiddenError.USER_CANNOT_FORWARD_IN_CHANNEL,
          );
        }
        break;
      case ChatMemberRole.ADMIN:
      case ChatMemberRole.OWNER:
        // ✅ Allowed
        break;
      default:
        ErrorResponse.forbidden(ForbiddenError.USER_CANNOT_FORWARD_IN_CHANNEL);
    }
  }
}
