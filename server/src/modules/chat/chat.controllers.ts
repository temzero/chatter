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
import { ChatService } from './chat.service';
import { ChatGroupService } from '../chat-group/chat-group.service';
import { CreateChatDto } from 'src/modules/chat/dto/request/create-chat.dto';
import { UpdateChatDto } from 'src/modules/chat/dto/request/update-chat.dto';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { ResponseData } from 'src/common/response-data';
import type { ChatDto } from 'src/modules/chat/dto/response/chats.dto';
import {
  mapChatToPrivateChatDto,
  mapChatToGroupChatDto,
} from 'src/modules/chat/mappers/combinedChatMappers';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

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
  ): Promise<ResponseData<ChatDto[]>> {
    try {
      const [chats, groups] = await Promise.all([
        this.chatService.getChatsByUserId(userId),
        this.chatGroupService.getGroupsByUserId(userId),
      ]);

      const combinedChats: ChatDto[] = [
        ...chats.map((chat) => mapChatToPrivateChatDto(chat, userId)),
        ...groups.map(mapChatToGroupChatDto),
      ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return new ResponseData(
        combinedChats,
        HttpStatus.OK,
        'All combinedChats retrieved successfully',
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error
          ? error.message
          : 'Failed to fetch combinedChats',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':chatId')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('chatId') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ResponseData<ChatDto>> {
    try {
      console.log('user: ', user);
      if (!user || !user.sub) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      // Try to get as group first
      const groupChat = await this.chatGroupService.getGroupById(id);
      if (groupChat) {
        return new ResponseData<ChatDto>(
          mapChatToGroupChatDto(groupChat),
          HttpStatus.OK,
          'Group chat retrieved successfully',
        );
      }

      // If not a group, try as private chat
      const privateChat = await this.chatService.getChatById(id);
      if (!privateChat) {
        throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
      }

      return new ResponseData<ChatDto>(
        mapChatToPrivateChatDto(privateChat, user.sub), // Use user.sub (user ID from JWT)
        HttpStatus.OK,
        'Private chat retrieved successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to retrieve chat',
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
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to create chat',
        HttpStatus.BAD_REQUEST,
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
