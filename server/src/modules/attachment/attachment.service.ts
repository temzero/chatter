// src/modules/attachment/services/attachment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entity/attachment.entity';
import { AttachmentResponseDto } from '../message/dto/responses/attachment-response.dto';
import { PaginationQuery } from 'src/shared/types/queries/pagination-query';
import { PaginationResponse } from 'src/shared/types/responses/pagination.response';
import { AttachmentType } from 'src/shared/types/enums/attachment-type.enum';
import { plainToInstance } from 'class-transformer';
import { Message } from '../message/entities/message.entity';
import { SupabaseService } from '../superbase/supabase.service';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepo: Repository<Attachment>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getChatAttachments(
    chatId: string,
    type: AttachmentType,
    queryDto: PaginationQuery,
  ): Promise<PaginationResponse<AttachmentResponseDto>> {
    const { lastId, limit = 50 } = queryDto;

    // Simple query using chatId - no JOIN needed!
    let query = this.attachmentRepo
      .createQueryBuilder('attachment')
      .where('attachment.chatId = :chatId', { chatId })
      .orderBy('attachment.createdAt', 'DESC')
      .take(limit + 1); // Get one extra to check if there's more

    // Filter by attachment type if provided
    if (type) {
      query = query.andWhere('attachment.type = :type', { type });
    }

    // Pagination using createdAt
    if (lastId) {
      const lastAttachment = await this.attachmentRepo.findOne({
        where: { id: lastId },
      });

      if (lastAttachment) {
        query = query.andWhere('attachment.createdAt < :lastCreatedAt', {
          lastCreatedAt: lastAttachment.createdAt,
        });
      }
    }

    const attachments = await query.getMany();
    const hasMore = attachments.length > limit;
    const items = hasMore ? attachments.slice(0, limit) : attachments;

    return {
      items: plainToInstance(AttachmentResponseDto, items),
      hasMore,
    };
  }

  async getAttachmentById(id: string): Promise<AttachmentResponseDto> {
    const attachment = await this.attachmentRepo.findOne({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return plainToInstance(AttachmentResponseDto, attachment);
  }

  async deleteAttachment(id: string): Promise<void> {
    const result = await this.attachmentRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Attachment not found');
    }
  }

  async getAttachmentCountByChat(chatId: string): Promise<number> {
    return this.attachmentRepo
      .createQueryBuilder('attachment')
      .where('attachment.chatId = :chatId', { chatId })
      .getCount();
  }

  async getAttachmentsByTypeCount(
    chatId: string,
  ): Promise<Record<string, number>> {
    const result = await this.attachmentRepo
      .createQueryBuilder('attachment')
      .select('attachment.type', 'type')
      .addSelect('COUNT(attachment.id)', 'count')
      .where('attachment.chatId = :chatId', { chatId })
      .groupBy('attachment.type')
      .getRawMany<{ type: string; count: string }>();

    const counts: Record<string, number> = {};

    result.forEach((item) => {
      counts[item.type] = Number(item.count);
    });

    return counts;
  }

  async createAttachment(
    createDto: Partial<Attachment>,
  ): Promise<AttachmentResponseDto> {
    const attachment = this.attachmentRepo.create(createDto);
    const savedAttachment = await this.attachmentRepo.save(attachment);
    return plainToInstance(AttachmentResponseDto, savedAttachment);
  }

  async createAttachments(
    messageId: string, // ✅ Accept messageId as parameter
    chatId: string, // ✅ Accept chatId as parameter
    attachmentDtos: Omit<Partial<Attachment>, 'messageId' | 'chatId'>[], // ✅ Exclude these from DTOs
  ): Promise<AttachmentResponseDto[]> {
    // ✅ Validate that message exists
    const messageExists = await this.messageRepo.exists({
      where: { id: messageId },
    });
    if (!messageExists) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    // ✅ Create attachments with guaranteed messageId and chatId
    const attachments = this.attachmentRepo.create(
      attachmentDtos.map((dto) => ({
        ...dto,
        messageId, // ✅ Always set correctly
        chatId, // ✅ Always set correctly
      })),
    );

    const savedAttachments = await this.attachmentRepo.save(attachments);
    return plainToInstance(AttachmentResponseDto, savedAttachments);
  }

  async deleteAttachmentsByMessageId(messageId: string): Promise<void> {
    // 1. Get all attachments for this message first
    const attachments = await this.attachmentRepo.find({
      where: { messageId },
      select: ['id', 'url', 'thumbnailUrl'], // Only select needed fields
    });

    if (attachments.length === 0) {
      return; // No attachments to delete
    }

    // 2. Delete files from storage if SupabaseService is provided
    for (const attachment of attachments) {
      if (attachment.url) {
        await this.supabaseService
          .deleteFileByUrl(attachment.url)
          .catch((error) => {
            console.error(`Failed to delete file ${attachment.url}:`, error);
            // Continue with other files even if one fails
          });
      }
      if (attachment.thumbnailUrl) {
        await this.supabaseService
          .deleteFileByUrl(attachment.thumbnailUrl)
          .catch((error) => {
            console.error(
              `Failed to delete thumbnail ${attachment.thumbnailUrl}:`,
              error,
            );
            // Continue with other files even if one fails
          });
      }
    }

    // 3. Delete attachment records from database
    const result = await this.attachmentRepo.delete({ messageId });

    console.log(
      `Deleted ${result.affected} attachments for message ${messageId}`,
    );
  }
}
