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
import { ChatService } from './chat.service';
import { CreateChatDto } from 'src/modules/chat/dto/requests/create-chat.dto';
import { UpdateChatDto } from 'src/modules/chat/dto/requests/update-chat.dto';
import { ResponseData } from 'src/common/response-data';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChatResponseDto } from './dto/responses/chat-response.dto';
import { ChatMemberRole } from '../chat-member/constants/chat-member-roles.constants';
import { AppError } from 'src/common/errors';
import { ChatListResponseDto } from './dto/responses/chat-list-response.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<ChatListResponseDto[]>> {
    try {
      const chats = await this.chatService.getChatsByUserId(userId);

      return new ResponseData<ChatListResponseDto[]>(
        plainToInstance(ChatListResponseDto, chats),
        HttpStatus.OK,
        'User chats retrieved successfully',
      );
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to retrieve user chats');
    }
  }

  @Get(':chatId')
  async findOne(
    @Param('chatId') id: string,
  ): Promise<ResponseData<ChatResponseDto>> {
    try {
      const chat = await this.chatService.getChatById(id);

      return new ResponseData<ChatResponseDto>(
        plainToInstance(ChatResponseDto, chat),
        HttpStatus.OK,
        'Chat retrieved successfully',
      );
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to retrieve chat');
    }
  }

  @Post()
  async create(
    @Body() createChatDto: CreateChatDto,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<ChatResponseDto>> {
    try {
      if (!createChatDto.memberIds.includes(userId)) {
        createChatDto.memberIds.push(userId);
      }

      const chat = await this.chatService.createChat(createChatDto);

      return new ResponseData<ChatResponseDto>(
        plainToInstance(ChatResponseDto, chat),
        HttpStatus.CREATED,
        'Chat created successfully',
      );
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to create chat', HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':chatId')
  async update(
    @Param('chatId') chatId: string,
    @Body() updateChatDto: UpdateChatDto,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<ChatResponseDto>> {
    try {
      const chat = await this.chatService.getChatById(chatId);
      const member = chat.members.find((m) => m.userId === userId);

      if (
        !member ||
        ![ChatMemberRole.ADMIN, ChatMemberRole.OWNER].includes(member.role)
      ) {
        AppError.unauthorized('Unauthorized to update chat');
      }

      const updatedChat = await this.chatService.updateChat(
        chatId,
        updateChatDto,
      );

      return new ResponseData<ChatResponseDto>(
        plainToInstance(ChatResponseDto, updatedChat),
        HttpStatus.OK,
        'Chat updated successfully',
      );
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to update chat');
    }
  }

  @Delete(':chatId')
  async remove(
    @Param('chatId') chatId: string,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<ChatResponseDto>> {
    try {
      const deletedChat = await this.chatService.deleteChat(chatId, userId);
      return new ResponseData<ChatResponseDto>(
        plainToInstance(ChatResponseDto, deletedChat),
        HttpStatus.OK,
        'Chat deleted successfully',
      );
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to delete chat');
    }
  }
}
