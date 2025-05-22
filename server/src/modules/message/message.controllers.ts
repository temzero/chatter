import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/requests/create-message.dto';
import { UpdateMessageDto } from './dto/requests/update-message.dto';
import { ResponseData } from '../../common/response-data';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { MessageResponseDto } from './dto/responses/message-response.dto';
import { AppError } from '../../common/errors';
import { GetMessagesDto } from './dto/queries/get-messages.dto';

@Controller('message')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<ResponseData<MessageResponseDto>> {
    if (!createMessageDto.content && !createMessageDto.attachmentIds) {
      AppError.badRequest('Message must have at least Text or Attachment');
    }

    const message = await this.messageService.createMessage(
      userId,
      createMessageDto,
    );

    return new ResponseData<MessageResponseDto>(
      plainToInstance(MessageResponseDto, message),
      HttpStatus.CREATED,
      'Message created successfully',
    );
  }

  @Get(':messageId')
  async findOne(
    @Param('messageId') messageId: string,
  ): Promise<ResponseData<MessageResponseDto>> {
    const message = await this.messageService.getMessageById(messageId);

    return new ResponseData<MessageResponseDto>(
      plainToInstance(MessageResponseDto, message),
      HttpStatus.OK,
      'Message retrieved successfully',
    );
  }

  @Put(':messageId')
  async update(
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<MessageResponseDto>> {
    // Verify the user is the message sender before allowing update
    const message = await this.messageService.getMessageById(messageId);
    if (message.senderId !== userId) {
      AppError.unauthorized('Unauthorized to update this message');
    }

    const updatedMessage = await this.messageService.updateMessage(
      messageId,
      updateMessageDto,
    );

    return new ResponseData<MessageResponseDto>(
      plainToInstance(MessageResponseDto, updatedMessage),
      HttpStatus.OK,
      'Message updated successfully',
    );
  }

  @Get('chat/:chatId')
  async getChatMessages(
    @Param('chatId') chatId: string,
    @Query() queryParams: GetMessagesDto,
    // @CurrentUser('id') userId: string,
  ): Promise<ResponseData<MessageResponseDto[]>> {
    // Optional: Verify user is a member of the chat
    const messages = await this.messageService.getMessagesByChatId(
      chatId,
      queryParams,
    );

    return new ResponseData<MessageResponseDto[]>(
      plainToInstance(MessageResponseDto, messages),
      HttpStatus.OK,
      'Chat messages retrieved successfully',
    );
  }

  @Delete(':messageId')
  async remove(
    @Param('messageId') messageId: string,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<MessageResponseDto>> {
    // Verify the user is the message sender before allowing deletion
    const message = await this.messageService.getMessageById(messageId);
    if (message.senderId !== userId) {
      AppError.unauthorized('Unauthorized to delete this message');
    }

    const deletedMessage =
      await this.messageService.softDeleteMessage(messageId);

    return new ResponseData<MessageResponseDto>(
      plainToInstance(MessageResponseDto, deletedMessage),
      HttpStatus.OK,
      'Message deleted successfully',
    );
  }
}
