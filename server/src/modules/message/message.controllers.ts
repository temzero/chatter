import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from 'src/modules/message/entities/message.entity';
import { ResponseData } from 'src/common/response-data';
import { CreateMessageDto } from 'src/modules/message/dto/create-message.dto';
import { UpdateMessageDto } from 'src/modules/message/dto/update-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('message')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // @Get()
  // async findAll(): Promise<ResponseData<Message[]>> {
  //   try {
  //     const messages = await this.messageService.getMessages();
  //     return new ResponseData<Message[]>(
  //       messages,
  //       HttpStatus.OK,
  //       'Messages retrieved successfully',
  //     );
  //   } catch (error: unknown) {
  //     if (error instanceof HttpException) throw error;
  //     throw new HttpException(
  //       error || 'Failed to retrieve messages',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  @Post()
  async create(
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<ResponseData<Message>> {
    if (!createMessageDto.content && !createMessageDto.media) {
      throw new HttpException(
        'Message must have at least "content" or "media"',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const message = await this.messageService.createMessage(createMessageDto);
      return new ResponseData<Message>(
        message,
        HttpStatus.CREATED,
        'Message created successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to create message',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':messageId')
  async findOne(
    @Param('messageId') messageId: string,
  ): Promise<ResponseData<Message>> {
    try {
      const message = await this.messageService.getMessageById(messageId);
      if (!message) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData<Message>(
        message,
        HttpStatus.OK,
        'Message retrieved successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to retrieve message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':messageId')
  async update(
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<ResponseData<Message>> {
    try {
      const updatedMessage = await this.messageService.updateMessage(
        messageId,
        updateMessageDto,
      );
      if (!updatedMessage) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData<Message>(
        updatedMessage,
        HttpStatus.OK,
        'Message updated successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to update message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':messageId')
  async remove(
    @Param('messageId') messageId: string,
  ): Promise<ResponseData<string>> {
    try {
      const deletedMessage = await this.messageService.deleteMessage(messageId);
      if (!deletedMessage) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData<string>(
        deletedMessage.id,
        HttpStatus.OK,
        'Message deleted successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to delete message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
