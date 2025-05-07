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
import { ChatGroupService } from '../chat-group/chat-group.service';
import { CreateChatDto } from 'src/modules/chat/dto/create-chat.dto';
import { UpdateChatDto } from 'src/modules/chat/dto/update-chat.dto';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { ChatGroup } from '../chat-group/entities/chat-group.entity';
import { ResponseData } from 'src/common/response-data';

type Conversation = Chat | ChatGroup;

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGroupService: ChatGroupService,
  ) {}

  @Get()
  async findAll(): Promise<ResponseData<Chat[]>> {
    try {
      const chats = await this.chatService.getAllChats();
      return new ResponseData<Chat[]>(
        chats,
        HttpStatus.OK,
        'Chats retrieved successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to retrieve chats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  async findAllByUserId(
    @Param('userId') userId: string,
  ): Promise<ResponseData<Chat[]>> {
    try {
      const chats = await this.chatService.getChatsByUserId(userId);
      return new ResponseData<Chat[]>(
        chats,
        HttpStatus.OK,
        'User chats retrieved successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to retrieve user chats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all/user/:userId')
  async findAllCombined(
    @Param('userId') userId: string,
  ): Promise<ResponseData<Conversation[]>> {
    try {
      const [chats, groups] = await Promise.all([
        this.chatService.getChatsByUserId(userId),
        this.chatGroupService.getGroupsByUserId(userId),
      ]);

      const conversations: Conversation[] = [
        ...chats, // Assuming these are already of type `Chat`
        ...groups, // Assuming these are already of type `Group | Channel`
      ].sort((a, b) => {
        const getTime = (Conversation: Conversation) =>
          Conversation.lastMessage?.updatedAt?.getTime() ||
          Conversation.updatedAt.getTime();
        return getTime(b) - getTime(a);
      });

      return new ResponseData(
        conversations,
        HttpStatus.OK,
        'All conversations retrieved successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error
          ? error.message
          : 'Failed to fetch conversations',
        HttpStatus.BAD_REQUEST,
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
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to create chat',
        HttpStatus.BAD_REQUEST,
      );
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
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to retrieve chat',
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
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to update chat',
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
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to delete chat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
