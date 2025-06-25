import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThan, MoreThan } from 'typeorm';
import { Message } from './entities/message.entity';
import { Chat } from '../chat/entities/chat.entity';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { CreateMessageDto } from './dto/requests/create-message.dto';
import { UpdateMessageDto } from './dto/requests/update-message.dto';
import { ErrorResponse } from '../../common/api-response/errors';
import { GetMessagesDto } from './dto/queries/get-messages.dto';
import { Reaction } from './entities/reaction.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepo: Repository<ChatMember>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Reaction)
    private readonly reactionRepo: Repository<Reaction>,
  ) {}

  private async getFullMessageById(id: string): Promise<Message> {
    try {
      return await this.messageRepo
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.sender', 'sender')
        .leftJoinAndSelect('message.chat', 'chat')
        .leftJoinAndSelect(
          'chat.members',
          'member',
          'member.user_id = sender.id',
        )
        .select([
          'message',
          'sender.id',
          'sender.firstName',
          'sender.lastName',
          'sender.avatarUrl',
          'member.nickname',
        ])
        .where('message.id = :id', { id })
        .getOneOrFail();
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to get full message');
    }
  }

  async createMessage(
    userId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const chat = await this.chatRepo.findOne({
      where: { id: createMessageDto.chatId },
      relations: ['lastMessage'],
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
      const newMessage = this.messageRepo.create({
        senderId: userId,
        ...createMessageDto,
      });

      const savedMessage = await this.messageRepo.save(newMessage);

      chat.lastMessage = savedMessage;
      await this.chatRepo.save(chat);
      const fullMessage = await this.getFullMessageById(savedMessage.id);
      // console.log('Message created:', fullMessage);

      return fullMessage;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to create message');
    }
  }

  async createForwardedMessage(
    senderId: string,
    chatId: string,
    originalMessageId: string,
  ): Promise<Message> {
    // Verify the chat exists and user is a member
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['lastMessage'],
    });
    if (!chat) {
      ErrorResponse.notFound('Chat not found');
    }

    const isMember = await this.chatMemberRepo.exists({
      where: {
        chatId: chatId,
        userId: senderId,
      },
    });
    if (!isMember) {
      ErrorResponse.notFound('You are not a member of this chat');
    }

    // Get the full original message with all relations
    const originalMessage = await this.messageRepo.findOne({
      where: { id: originalMessageId },
      relations: [
        'sender',
        'attachments',
        'forwardedFromMessage',
        'forwardedFromMessage.sender',
      ],
    });
    if (!originalMessage) {
      ErrorResponse.notFound('Original message not found');
    }

    try {
      // Create the forwarded message
      const newMessage = this.messageRepo.create({
        senderId: senderId,
        chatId: chatId,
        forwardedFromMessageId: originalMessage.id,
      });

      // Copy attachments if they exist
      // if (originalMessage.attachments?.length > 0) {
      //   newMessage.attachments = originalMessage.attachments.map(
      //     (attachment) => {
      //       const newAttachment = new Attachment();
      //       newAttachment.fileUrl = attachment.fileUrl;
      //       newAttachment.fileType = attachment.fileType;
      //       newAttachment.fileName = attachment.fileName;
      //       newAttachment.fileSize = attachment.fileSize;
      //       return newAttachment;
      //     },
      //   );
      // }

      const savedMessage = await this.messageRepo.save(newMessage);

      // Update chat's last message
      chat.lastMessage = savedMessage;
      await this.chatRepo.save(chat);

      // Return the full message with all relations
      return await this.getFullMessageById(savedMessage.id);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to forward message');
    }
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

  async getMessagesByChatId(
    chatId: string,
    queryParams: GetMessagesDto,
  ): Promise<Message[]> {
    try {
      const query = this.messageRepo
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.sender', 'sender')
        .leftJoinAndSelect('message.chat', 'chat')
        .leftJoinAndSelect(
          'chat.members',
          'member',
          'member.user_id = sender.id',
        )
        .leftJoinAndSelect('message.reactions', 'reactions')
        .leftJoinAndSelect('message.replyToMessage', 'replyToMessage')
        .leftJoinAndSelect('replyToMessage.sender', 'replySender')
        .leftJoinAndSelect(
          'chat.members',
          'replyMember',
          'replyMember.user_id = replySender.id',
        )
        .leftJoinAndSelect(
          'message.forwardedFromMessage',
          'forwardedFromMessage',
        )
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
        ])
        .where('message.chat_id = :chatId', { chatId })
        .andWhere('message.is_deleted = :isDeleted', { isDeleted: false })
        .orderBy('message.createdAt', 'ASC');

      if (queryParams.limit) query.take(queryParams.limit);
      if (queryParams.offset) query.skip(queryParams.offset);

      return await query.getMany();
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve conversation messages');
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
  ): Promise<number> {
    if (!lastReadMessageId) return 0;
    try {
      // First get the last message in the chat
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

      // If last read message is the same as the last message in chat, return 0
      if (lastMessage && lastMessage.id === lastReadMessageId) {
        return 0;
      }

      // Get the timestamp of the last read message
      const lastReadMessage = await this.messageRepo.findOne({
        where: {
          id: lastReadMessageId,
        },
        select: ['createdAt'],
      });

      // console.log('lastReadMessage', lastReadMessage);

      if (!lastReadMessage) {
        // If last read message was deleted, find the most recent message before it that still exists
        const previousValidMessage = await this.messageRepo.findOne({
          where: {
            chatId,
            isDeleted: false,
            createdAt: LessThan(new Date()), // All messages before now
          },
          order: {
            createdAt: 'DESC',
          },
          select: ['createdAt'],
        });

        if (!previousValidMessage) {
          return 0; // No valid messages in chat
        }

        // Count messages created after the previous valid message
        return await this.messageRepo.count({
          where: {
            chatId,
            createdAt: MoreThan(previousValidMessage.createdAt),
            isDeleted: false,
          },
        });
      }

      // Count messages created after the last read message
      const unreadCount = await this.messageRepo.count({
        where: {
          chatId,
          createdAt: MoreThan(lastReadMessage.createdAt),
          isDeleted: false,
        },
      });

      // console.log('unreadCount', unreadCount);

      return unreadCount;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to get unread message count');
    }
  }

  // async getUnreadMessageCount(
  //   chatId: string,
  //   lastReadMessageId: string | null,
  // ): Promise<number> {
  //   if (!lastReadMessageId) return 0;

  //   try {
  //     // Combined check for last message and count in a single query
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //     const result = await this.messageRepo
  //       .createQueryBuilder('message')
  //       .select([
  //         'COUNT(message.id) AS unread_count',
  //         'MAX(message.id) AS last_message_id',
  //       ])
  //       .where('message.chat_id = :chatId', { chatId })
  //       .andWhere('message.is_deleted = false')
  //       .andWhere(
  //         `message.created_at > COALESCE(
  //         (SELECT m.created_at FROM message m WHERE m.id = :lastReadMessageId),
  //         '1970-01-01'::timestamp
  //       )`,
  //         { lastReadMessageId },
  //       )
  //       .getRawOne();

  //     // If the last message is the one we've read, return 0
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //     if (result.last_message_id === lastReadMessageId) {
  //       return 0;
  //     }

  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //     return Number(result.unread_count) || 0;
  //   } catch (error) {
  //     ErrorResponse.throw(error, 'Failed to get unread message count');
  //   }
  // }

  async softDeleteMessage(id: string): Promise<Message> {
    try {
      const message = await this.getMessageById(id);
      message.isDeleted = true;
      message.deletedAt = new Date();
      await this.messageRepo.save(message);
      return message;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to soft delete message');
    }
  }

  async deleteMessage(id: string): Promise<Message> {
    try {
      const message = await this.getMessageById(id);
      await this.messageRepo.delete(id);
      return message;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to delete message');
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
}
