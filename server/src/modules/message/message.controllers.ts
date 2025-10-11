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
import { MessageMapper } from './mappers/message.mapper';
import { PaginationQuery } from './dto/queries/pagination-query.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageMapper: MessageMapper,
  ) {}

  @Get(':messageId')
  async findOne(
    @Param('messageId') messageId: string,
  ): Promise<SuccessResponse<MessageResponseDto>> {
    const message = await this.messageService.getMessageById(messageId);
    // console.log('message: ', message);

    return new SuccessResponse(
      plainToInstance(MessageResponseDto, message),
      'Message retrieved successfully',
    );
  }

  @Get('chat/:chatId')
  async getChatMessages(
    @CurrentUser('id') currentUserId: string,
    @Param('chatId') chatId: string,
    @Query() queryParams: PaginationQuery,
  ): Promise<
    SuccessResponse<{ messages: MessageResponseDto[]; hasMore: boolean }>
  > {
    const { messages, hasMore } = await this.messageService.getMessagesByChatId(
      chatId,
      currentUserId,
      queryParams,
    );

    const messagesResponse = messages.map((message) =>
      this.messageMapper.mapMessageToMessageResDto(message),
    );

    return new SuccessResponse(
      { messages: messagesResponse, hasMore },
      'Chat messages retrieved successfully',
    );
  }

  @Put(':messageId')
  async update(
    @CurrentUser('id') currentUserId: string,
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<SuccessResponse<MessageResponseDto>> {
    const message = await this.messageService.getMessageById(messageId);
    if (message.senderId !== currentUserId) {
      ErrorResponse.unauthorized('Unauthorized to update this message');
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
