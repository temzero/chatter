import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Message } from './entities/message.entity';
import { Chat } from '../chat/entities/chat.entity';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { CreateMessageDto } from './dto/requests/create-message.dto';
import { UpdateMessageDto } from './dto/requests/update-message.dto';
import { ErrorResponse } from '../../common/api-response/errors';
import { GetMessagesDto } from './dto/queries/get-messages.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepo: Repository<ChatMember>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  // async createMessage(
  //   userId: string,
  //   createMessageDto: CreateMessageDto,
  // ): Promise<Message> {
  //   // check if chat exist
  //   // check if user is member of that chat
  //   try {
  //     const newMessage = this.messageRepo.create(createMessageDto);
  //     return await this.messageRepo.save(newMessage);
  //   } catch (error) {
  //     ErrorResponse.throw(error, 'Failed to create message');
  //   }
  // }

  async createMessage(
    userId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    // Check if chat exists
    const chat = await this.chatRepo.findOne({
      where: { id: createMessageDto.chatId },
      relations: ['lastMessage'], // optional if needed later
    });
    if (!chat) {
      ErrorResponse.notFound('Chat not found');
    }

    // Check if user is a member of the chat
    const isMember = await this.chatMemberRepo.exists({
      where: {
        chatId: createMessageDto.chatId,
        userId: userId,
      },
    });
    if (!isMember) {
      ErrorResponse.notFound('You are not a member of this chat');
    }

    // Check if reply message exists when replyToMessageId is provided
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

      // Update chat.lastMessage to savedMessage
      chat.lastMessage = savedMessage;
      await this.chatRepo.save(chat);

      return savedMessage;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to create message');
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
}
