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
import { ChatService } from './chat.service';
import { CreateChatDto } from 'src/dto/chat/create-chat.dto';
import { UpdateChatDto } from 'src/dto/chat/update-chat.dto';
import { Chat } from 'src/entities/chat/chat.entity';
import { ResponseData } from 'src/common/response-data';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async findAll(): Promise<ResponseData<Chat[]>> {
    try {
      const chats = await this.chatService.getAllChats();
      return new ResponseData<Chat[]>(
        chats,
        HttpStatus.OK,
        'Chats retrieved successfully',
      );
    } catch {
      throw new HttpException(
        'Failed to retrieve chats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @Body() createChatDto: CreateChatDto,
  ): Promise<ResponseData<Chat>> {
    try {
      const chat = await this.chatService.createChat(createChatDto);
      return new ResponseData<Chat>(
        chat,
        HttpStatus.CREATED,
        'Chat created successfully',
      );
    } catch {
      throw new HttpException('Failed to create chat', HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Chat>> {
    try {
      const chat = await this.chatService.getChatById(id);
      if (!chat) {
        throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData<Chat>(
        chat,
        HttpStatus.OK,
        'Chat retrieved successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to retrieve chat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChatDto: UpdateChatDto,
  ): Promise<ResponseData<Chat>> {
    try {
      const updatedChat = await this.chatService.updateChat(id, updateChatDto);
      if (!updatedChat) {
        throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData<Chat>(
        updatedChat,
        HttpStatus.OK,
        'Chat updated successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to update chat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseData<string>> {
    try {
      const deletedChat = await this.chatService.deleteChat(id);
      if (!deletedChat) {
        throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData<string>(
        deletedChat.id,
        HttpStatus.OK,
        'Chat deleted successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to delete chat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
