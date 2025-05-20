import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/requests/create-message.dto';
import { UpdateMessageDto } from './dto/requests/update-message.dto';
import { AppError } from '../../common/errors';
import { GetMessagesDto } from './dto/queries/get-messages.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      const newMessage = this.messageRepo.create(createMessageDto);
      return await this.messageRepo.save(newMessage);
    } catch (error) {
      AppError.throw(error, 'Failed to create message');
    }
  }

  async getMessageById(id: string): Promise<Message> {
    try {
      const message = await this.messageRepo.findOne({
        where: { id },
        relations: ['sender', 'chat', 'metadata', 'media_items'],
      });

      if (!message) {
        AppError.notFound('Message not found');
      }

      return message;
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve message');
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
      AppError.throw(error, 'Failed to update message');
    }
  }

  async deleteMessage(id: string): Promise<Message> {
    try {
      const message = await this.getMessageById(id);
      await this.messageRepo.delete(id);
      return message;
    } catch (error) {
      AppError.throw(error, 'Failed to delete message');
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
        .orderBy('message.timestamp', 'DESC');

      if (queryParams.limit) query.take(queryParams.limit);
      if (queryParams.offset) query.skip(queryParams.offset);

      return await query.getMany();
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve conversation messages');
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
      AppError.throw(error, 'Failed to search messages');
    }
  }

  async getLastMessage(chatId: string): Promise<Message | null> {
    try {
      return await this.messageRepo.findOne({
        where: { chat: { id: chatId } },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve last message');
    }
  }
}
