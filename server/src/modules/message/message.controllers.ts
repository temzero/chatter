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
} from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from 'src/models/message.model';
import { ResponseData } from 'src/global/globalClass';
import { CreateMessageDto } from 'src/dto/create-message.dto';
import { UpdateMessageDto } from 'src/dto/update-message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  findAll(): ResponseData<Message[]> {
    try {
      const messages = this.messageService.getMessages();
      return new ResponseData<Message[]>(
        messages,
        HttpStatus.OK,
        'Messages retrieved successfully',
      );
    } catch {
      throw new HttpException(
        'Failed to retrieve messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  create(@Body() createMessageDto: CreateMessageDto): ResponseData<Message> {
    if (!createMessageDto.content && !createMessageDto.media) {
      throw new HttpException(
        'Message must have at least "content" or "media"',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const message = this.messageService.createMessage(createMessageDto);
      return new ResponseData<Message>(
        message,
        HttpStatus.CREATED,
        'Message created successfully',
      );
    } catch {
      throw new HttpException(
        'Failed to create message',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string): ResponseData<Message> {
    try {
      const message = this.messageService.getMessageById(id);
      if (!message) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData<Message>(
        message,
        HttpStatus.OK,
        'Message retrieved successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ): ResponseData<Message> {
    try {
      const updatedMessage = this.messageService.updateMessage(
        id,
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
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string): ResponseData<string> {
    try {
      const deletedMessage = this.messageService.deleteMessage(id);
      if (!deletedMessage) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData<string>(
        deletedMessage.id,
        HttpStatus.OK,
        'Message deleted successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
