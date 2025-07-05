import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/requests/create-message.dto';
import { UpdateMessageDto } from './dto/requests/update-message.dto';
import { SuccessResponse } from '../../common/api-response/success';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { MessageResponseDto } from './dto/responses/message-response.dto';
import { ErrorResponse } from '../../common/api-response/errors';
import { GetMessagesQuery } from './dto/queries/get-messages.dto';
import { MessageMapper } from './mappers/message.mapper';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageMapper: MessageMapper,
  ) {}

  @Post()
  async create(
    @CurrentUser('id') currentUserId: string,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<SuccessResponse<MessageResponseDto>> {
    if (!createMessageDto.content && !createMessageDto.attachments) {
      ErrorResponse.badRequest('Message must have at least Text or Attachment');
    }

    const message = await this.messageService.createMessage(
      currentUserId,
      createMessageDto,
    );

    const messageResponse = this.messageMapper.toMessageResponseDto(message);
    // console.log('messageResponse: ', messageResponse);

    return new SuccessResponse(messageResponse, 'Message created successfully');
  }

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
    @Query() queryParams: GetMessagesQuery,
  ): Promise<
    SuccessResponse<{ messages: MessageResponseDto[]; hasMore: boolean }>
  > {
    const { messages, hasMore } = await this.messageService.getMessagesByChatId(
      chatId,
      currentUserId,
      queryParams,
    );

    const messagesResponse = messages.map((message) =>
      this.messageMapper.toMessageResponseDto(message),
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
