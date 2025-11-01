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
import { SuccessResponse } from 'src/common/api-response/success';
import { ErrorResponse } from 'src/common/api-response/errors';

@Controller('attachments')
@UseInterceptors(ClassSerializerInterceptor)
export class AttachmentsController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Get('chat/:chatId/attachment-type/:type') // type is now optional
  async getChatAttachmentsByType(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Param('type') type: AttachmentType,
    @Query() query?: PaginationQuery,
  ): Promise<SuccessResponse<PaginationResponse<AttachmentResponseDto>>> {
    try {
      const payload = await this.attachmentService.getChatAttachments(
        chatId,
        type,
        query,
      );

      return new SuccessResponse(payload, 'Attachments retrieved successfully');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve attachments');
    }
  }

  @Get('chat/:chatId') // type is now optional
  async getChatAttachments(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Query() query?: PaginationQuery,
  ): Promise<SuccessResponse<PaginationResponse<AttachmentResponseDto>>> {
    try {
      const payload = await this.attachmentService.getChatAttachments(
        chatId,
        null,
        query,
      );

      return new SuccessResponse(payload, 'Attachments retrieved successfully');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve attachments');
    }
  }

  @Get('count')
  async getAttachmentCount(
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ): Promise<SuccessResponse<{ count: number }>> {
    try {
      const count =
        await this.attachmentService.getAttachmentCountByChat(chatId);
      return new SuccessResponse(
        { count },
        'Attachment count retrieved successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve attachment count');
    }
  }

  @Get('count-by-type')
  async getAttachmentsCountByType(
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ): Promise<SuccessResponse<Record<string, number>>> {
    try {
      const counts =
        await this.attachmentService.getAttachmentsByTypeCount(chatId);
      return new SuccessResponse(
        counts,
        'Attachment counts by type retrieved successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(
        error,
        'Failed to retrieve attachment counts by type',
      );
    }
  }

  @Get(':attachmentId')
  async getAttachment(
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ): Promise<SuccessResponse<AttachmentResponseDto>> {
    try {
      const attachment =
        await this.attachmentService.getAttachmentById(attachmentId);
      return new SuccessResponse(
        attachment,
        'Attachment retrieved successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve attachment');
    }
  }

  @Delete(':attachmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAttachment(
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ): Promise<void> {
    await this.attachmentService.deleteAttachment(attachmentId);
  }
}
