import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { MessageService } from './message.service';
import { UpdateMessageDto } from './dto/requests/update-message.dto';
import { SuccessResponse } from '../../common/api-response/success';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { MessageResponseDto } from './dto/responses/message-response.dto';
import { ErrorResponse } from '../../common/api-response/errors';
import { PaginationQuery } from '@shared/types/queries/pagination-query';
import { PaginationResponse } from '@shared/types/responses/pagination.response';
import { ForbiddenError } from '@shared/types/enums/error-message.enum';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':messageId')
  async findOne(
    @Param('messageId') messageId: string,
  ): Promise<SuccessResponse<MessageResponseDto>> {
    const message = await this.messageService.getMessageById(messageId);

    return new SuccessResponse(
      plainToInstance(MessageResponseDto, message),
      'Message retrieved successfully',
    );
  }

  @Get('chat/:chatId')
  async getChatMessages(
    @CurrentUser('id') currentUserId: string,
    @Param('chatId') chatId: string,
    @Query() query?: PaginationQuery,
  ): Promise<SuccessResponse<PaginationResponse<MessageResponseDto>>> {
    const payload = await this.messageService.getMessagesByChatId(
      chatId,
      currentUserId,
      query,
    );

    return new SuccessResponse(payload, 'Chat messages retrieved successfully');
  }

  @Put(':messageId')
  async update(
    @CurrentUser('id') currentUserId: string,
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<SuccessResponse<MessageResponseDto>> {
    const message = await this.messageService.getMessageById(messageId);
    if (message.senderId !== currentUserId) {
      ErrorResponse.forbidden(ForbiddenError.INSUFFICIENT_PERMISSIONS);
    }

    const updatedMessage = await this.messageService.updateMessage(
      messageId,
      updateMessageDto,
    );

    return new SuccessResponse(
      plainToInstance(MessageResponseDto, updatedMessage),
      'Message updated successfully',
    );
  }
}
