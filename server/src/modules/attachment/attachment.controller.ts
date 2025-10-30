// src/modules/attachment/controllers/attachments.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { AttachmentResponseDto } from '../message/dto/responses/attachment-response.dto';
import { PaginationQuery } from 'src/shared/types/queries/pagination-query';
import { PaginationResponse } from 'src/shared/types/responses/pagination.response';
import { AttachmentType } from 'src/shared/types/enums/attachment-type.enum';

@Controller('chats/:chatId/attachments')
@UseInterceptors(ClassSerializerInterceptor)
export class AttachmentsController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Get('chat/:chatId/attachment-type/:type')
  async getChatAttachments(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Param('type') type: AttachmentType, // required if part of route
    @Query() queryDto: PaginationQuery,
  ): Promise<PaginationResponse<AttachmentResponseDto>> {
    return this.attachmentService.getChatAttachments(chatId, type, queryDto);
  }

  @Get('count')
  async getAttachmentCount(
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ): Promise<{ count: number }> {
    const count = await this.attachmentService.getAttachmentCountByChat(chatId);
    return { count };
  }

  @Get('count-by-type')
  async getAttachmentsCountByType(
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ): Promise<Record<string, number>> {
    return this.attachmentService.getAttachmentsByTypeCount(chatId);
  }

  @Get(':attachmentId')
  async getAttachment(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ): Promise<AttachmentResponseDto> {
    return this.attachmentService.getAttachmentById(attachmentId);
  }

  @Delete(':attachmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAttachment(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ): Promise<void> {
    await this.attachmentService.deleteAttachment(attachmentId);
  }
}
