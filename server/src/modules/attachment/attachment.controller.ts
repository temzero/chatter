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
import { AttachmentResponseDto } from './dto/responses/attachment-response.dto';
import { PaginationQuery } from '@shared/types/queries/pagination-query';
import { PaginationResponse } from '@shared/types/responses/pagination.response';
import { AttachmentType } from '@shared/types/enums/attachment-type.enum';
import { SuccessResponse } from '@/common/api-response/success';
import { ErrorResponse } from '@/common/api-response/errors';

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
