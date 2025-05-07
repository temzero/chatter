import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Message } from 'src/modules/message/entities/message.entity';
import { CreateMessageDto } from 'src/modules/message/dto/create-message.dto';
import { UpdateMessageDto } from 'src/modules/message/dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async getMessages(options?: {
    relations?: string[];
    order?: { [key: string]: 'ASC' | 'DESC' };
    skip?: number;
    take?: number;
  }): Promise<Message[]> {
    return this.messageRepository.find({
      relations: options?.relations || [
        'sender',
        'chat',
        'metadata',
        'media_items',
      ],
      order: options?.order || { createdAt: 'DESC' }, // Newest first by default
      skip: options?.skip,
      take: options?.take,
    });
  }

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const newMessage = this.messageRepository.create(createMessageDto);
    return this.messageRepository.save(newMessage);
  }

  async getMessageById(id: string): Promise<Message | null | undefined> {
    return this.messageRepository.findOne({
      where: { id },
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
      message.updatedAt = new Date();
    }

    return this.messageRepository.save(message);
  }

  async deleteMessage(id: string): Promise<Message | null> {
    const message = await this.messageRepository.findOneBy({ id });
    if (!message) return null;
    await this.messageRepository.delete(id);
    return message;
  }

  async getMessagesByConversation(
    chat_id: string,
    limit?: number,
    offset?: number,
  ): Promise<Message[]> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.chat_id = :chat_id', { chat_id })
      .andWhere('message.is_deleted = :is_deleted', { is_deleted: false })
      .orderBy('message.timestamp', 'DESC');

    if (limit) query.take(limit);
    if (offset) query.skip(offset);

    return query.getMany();
  }

  async searchMessages(chatId: string, searchTerm: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: {
        chat: { id: chatId },
        content: Like(`%${searchTerm}%`),
      },
      relations: ['chat'], // optional: eager load chat if needed
    });
  }
}
