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

@Controller('message')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<MessageResponseDto>> {
    try {
      if (!createMessageDto.content && !createMessageDto.attachmentIds) {
        AppError.badRequest('Message must have at least "content" or "media"');
      }

      // Ensure the sender is the current user
      createMessageDto.senderId = userId;

      const message = await this.messageService.createMessage(createMessageDto);

      return new ResponseData<MessageResponseDto>(
        plainToInstance(MessageResponseDto, message),
        HttpStatus.CREATED,
        'Message created successfully',
      );
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to create message', HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':messageId')
  async findOne(
    @Param('messageId') messageId: string,
  ): Promise<ResponseData<MessageResponseDto>> {
    try {
      const message = await this.messageService.getMessageById(messageId);

      return new ResponseData<MessageResponseDto>(
        plainToInstance(MessageResponseDto, message),
        HttpStatus.OK,
        'Message retrieved successfully',
      );
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to retrieve message');
    }
  }

  @Put(':messageId')
  async update(
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<MessageResponseDto>> {
    try {
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
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to update message');
    }
  }

  @Delete(':messageId')
  async remove(
    @Param('messageId') messageId: string,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<MessageResponseDto>> {
    try {
      // Verify the user is the message sender before allowing deletion
      const message = await this.messageService.getMessageById(messageId);
      if (message.senderId !== userId) {
        AppError.unauthorized('Unauthorized to delete this message');
      }

      const deletedMessage = await this.messageService.deleteMessage(messageId);

      return new ResponseData<MessageResponseDto>(
        plainToInstance(MessageResponseDto, deletedMessage),
        HttpStatus.OK,
        'Message deleted successfully',
      );
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to delete message');
    }
  }

  @Get('chat/:chatId')
  async getChatMessages(
    @Param('chatId') chatId: string,
    // @CurrentUser('id') userId: string,
  ): Promise<ResponseData<MessageResponseDto[]>> {
    try {
      // Optional: Verify user is a member of the chat
      const messages = await this.messageService.getMessagesByChat(chatId);

      return new ResponseData<MessageResponseDto[]>(
        plainToInstance(MessageResponseDto, messages),
        HttpStatus.OK,
        'Chat messages retrieved successfully',
      );
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to retrieve chat messages');
    }
  }
}
