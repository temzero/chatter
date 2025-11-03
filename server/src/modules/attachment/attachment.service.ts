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
import { AttachmentUploadRequest } from 'src/shared/types/requests/attachment-upload.request';

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
    type: AttachmentType | null,
    query?: PaginationQuery,
  ): Promise<PaginationResponse<AttachmentResponseDto>> {
    const { lastId, limit = 12 } = query ?? {};

    // Query attachments through the join table
    let attachmentQuery = this.attachmentRepo
      .createQueryBuilder('attachment')
      .innerJoin(
        'message_attachments',
        'ma',
        'ma.attachment_id = attachment.id',
      )
      .innerJoin('message', 'message', 'message.id = ma.message_id')
      .where('message.chatId = :chatId', { chatId })
      .andWhere('message.isDeleted = false');

    // Filter by type
    if (type) {
      attachmentQuery = attachmentQuery.andWhere('attachment.type = :type', {
        type,
      });
    }

    // Apply pagination
    if (lastId) {
      const lastAttachment = await this.attachmentRepo
        .createQueryBuilder('attachment')
        .innerJoin(
          'message_attachments',
          'ma',
          'ma.attachment_id = attachment.id',
        )
        .innerJoin('message', 'message', 'message.id = ma.message_id')
        .where('message.chatId = :chatId', { chatId })
        .andWhere('attachment.id = :lastId', { lastId })
        .getOne();

      if (lastAttachment) {
        attachmentQuery = attachmentQuery.andWhere(
          '(attachment.createdAt < :lastCreatedAt OR (attachment.createdAt = :lastCreatedAt AND attachment.id < :lastId))',
          {
            lastCreatedAt: lastAttachment.createdAt,
            lastId: lastAttachment.id,
          },
        );
      }
    }

    attachmentQuery = attachmentQuery
      .distinct(true)
      .orderBy('attachment.createdAt', 'DESC')
      .addOrderBy('attachment.id', 'DESC')
      .take(limit + 1);

    const attachments = await attachmentQuery.getMany();
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
    const attachment = await this.attachmentRepo.findOne({
      where: { id },
      relations: ['messages'], // Check if used by any messages
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Check if attachment is used by any messages
    if (attachment.messages && attachment.messages.length > 0) {
      throw new NotFoundException(
        'Cannot delete attachment that is still used by messages',
      );
    }

    // Delete files from storage
    if (attachment.url) {
      await this.supabaseService
        .deleteFileByUrl(attachment.url)
        .catch(console.error);
    }
    if (attachment.thumbnailUrl) {
      await this.supabaseService
        .deleteFileByUrl(attachment.thumbnailUrl)
        .catch(console.error);
    }

    // Delete attachment record
    await this.attachmentRepo.delete(id);
  }

  async createAttachment(
    createDto: AttachmentUploadRequest,
  ): Promise<Attachment> {
    const attachment = this.attachmentRepo.create({
      ...createDto,
      createdAt: createDto.createdAt || new Date(),
    });
    return await this.attachmentRepo.save(attachment);
  }

  async createAttachmentsBulk(
    createDtos: AttachmentUploadRequest[],
  ): Promise<Attachment[]> {
    const attachments = this.attachmentRepo.create(
      createDtos.map((dto) => ({
        ...dto,
        createdAt: dto.createdAt || new Date(),
      })),
    );
    return await this.attachmentRepo.save(attachments);
  }

  async deleteAttachmentsByMessageId(messageId: string): Promise<void> {
    // 1. Get the message with its attachments
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['attachments'],
    });

    if (!message || !message.attachments || message.attachments.length === 0) {
      return; // No attachments to process
    }

    // 2. Check each attachment to see if it's used by other messages
    for (const attachment of message.attachments) {
      // Count how many messages reference this attachment
      const messageCount = await this.messageRepo
        .createQueryBuilder('message')
        .innerJoin('message.attachments', 'attachment')
        .where('attachment.id = :attachmentId', { attachmentId: attachment.id })
        .getCount();

      // If this is the only message using the attachment, delete the files
      if (messageCount <= 1) {
        // Delete files from storage
        if (attachment.url) {
          await this.supabaseService
            .deleteFileByUrl(attachment.url)
            .catch((error) => {
              console.error(`Failed to delete file ${attachment.url}:`, error);
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
            });
        }

        // Delete the attachment record from database
        await this.attachmentRepo.delete(attachment.id);
        console.log(`Deleted orphaned attachment: ${attachment.id}`);
      } else {
        console.log(
          `Attachment ${attachment.id} is still used by ${messageCount - 1} other messages, keeping it.`,
        );
      }
    }

    // 3. TypeORM automatically removes entries from message_attachments join table
  }

  // ✅ NEW: Helper method to find existing attachments by URLs (for deduplication)
  async findAttachmentsByUrls(urls: string[]): Promise<Attachment[]> {
    if (!urls.length) return [];

    return await this.attachmentRepo
      .createQueryBuilder('attachment')
      .where('attachment.url IN (:...urls)', { urls })
      .getMany();
  }
}
