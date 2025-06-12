import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { GetMessagesDto } from './dto/queries/get-messages.dto';
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
    @CurrentUser('id') userId: string,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<SuccessResponse<MessageResponseDto>> {
    if (!createMessageDto.content && !createMessageDto.attachmentIds) {
      ErrorResponse.badRequest('Message must have at least Text or Attachment');
    }

    const message = await this.messageService.createMessage(
      userId,
      createMessageDto,
    );

    const messageResponse = this.messageMapper.toResponseDto(message);
    console.log('messageResponse: ', messageResponse);

    return new SuccessResponse(messageResponse, 'Message created successfully');
  }

  @Get(':messageId')
  async findOne(
    @Param('messageId') messageId: string,
  ): Promise<SuccessResponse<MessageResponseDto>> {
    const message = await this.messageService.getMessageById(messageId);
    console.log('message: ', message);

    return new SuccessResponse(
      plainToInstance(MessageResponseDto, message),
      'Message retrieved successfully',
    );
  }

  @Put(':messageId')
  async update(
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<MessageResponseDto>> {
    const message = await this.messageService.getMessageById(messageId);
    if (message.senderId !== userId) {
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

  @Get('chat/:chatId')
  async getChatMessages(
    @Param('chatId') chatId: string,
    @Query() queryParams: GetMessagesDto,
  ): Promise<SuccessResponse<MessageResponseDto[]>> {
    const messages = await this.messageService.getMessagesByChatId(
      chatId,
      queryParams,
    );

    // const messagesResponse = plainToInstance(MessageResponseDto, messages);
    const messagesResponse = messages.map((message) =>
      this.messageMapper.toResponseDto(message),
    );

    return new SuccessResponse(
      messagesResponse,
      'Chat messages retrieved successfully',
    );
  }

  @Delete(':messageId')
  async remove(
    @Param('messageId') messageId: string,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<MessageResponseDto>> {
    const message = await this.messageService.getMessageById(messageId);
    if (message.senderId !== userId) {
      ErrorResponse.unauthorized('Unauthorized to delete this message');
    }

    const deletedMessage =
      await this.messageService.softDeleteMessage(messageId);

    return new SuccessResponse(
      plainToInstance(MessageResponseDto, deletedMessage),
      'Message deleted successfully',
    );
  }
}
