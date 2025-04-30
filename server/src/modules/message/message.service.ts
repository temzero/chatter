import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Message } from '../../entities/message.entity';
import { CreateMessageDto } from 'src/dto/create-message.dto';
import { UpdateMessageDto } from 'src/dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async getMessages(includeDeleted = false): Promise<Message[]> {
    const options = includeDeleted ? {} : { where: { isDeleted: false } };
    return this.messageRepository.find(options);
  }

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const newMessage = this.messageRepository.create({
      ...createMessageDto,
      status: 'sent',
      timestamp: new Date(),
    });
    return this.messageRepository.save(newMessage);
  }

  async getMessageById(id: string): Promise<Message | null | undefined> {
    return this.messageRepository.findOne({
      where: {
        id,
        isDeleted: false,
      },
    });
  }

  async updateMessage(
    id: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message | undefined> {
    const message = await this.getMessageById(id);
    if (!message) return undefined;

    if (updateMessageDto.content) {
      message.content = updateMessageDto.content;
      message.editedTimestamp = new Date();
    }

    return this.messageRepository.save(message);
  }

  async deleteMessage(id: string): Promise<Message | undefined> {
    const message = await this.getMessageById(id);
    if (!message) return undefined;

    message.isDeleted = true;
    message.deletedTimestamp = new Date();
    return this.messageRepository.save(message);
  }

  async getMessagesByConversation(
    chatId: string,
    limit?: number,
    offset?: number,
  ): Promise<Message[]> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.chatId = :chatId', { chatId })
      .andWhere('message.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('message.timestamp', 'DESC');

    if (limit) query.take(limit);
    if (offset) query.skip(offset);

    return query.getMany();
  }

  async searchMessages(chatId: string, searchTerm: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: {
        chatId,
        content: Like(`%${searchTerm}%`),
        isDeleted: false,
      },
    });
  }
}
