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
import {
  CreateDirectChatDto,
  CreateGroupChatDto,
} from 'src/modules/chat/dto/requests/create-chat.dto';
import { UpdateChatDto } from 'src/modules/chat/dto/requests/update-chat.dto';
import { ResponseData } from 'src/common/response-data';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import {
  directChatResponseDto,
  groupChatResponseDto,
} from './dto/responses/chat-response.dto';
import { ChatMemberRole } from '../chat-member/constants/chat-member-roles.constants';
import { AppError } from 'src/common/errors';
import { ChatListResponseDto } from './dto/responses/chat-list-response.dto';
import { ChatType } from './constants/chat-types.constants';

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
  ): Promise<ResponseData<directChatResponseDto | groupChatResponseDto>> {
    try {
      const chat = await this.chatService.getChatById(id);

      if (!Object.values(ChatType).includes(chat.type)) {
        throw new Error('Invalid chat type');
      }
      console.log(chat.type);

      if (chat.type === ChatType.DIRECT) {
        return new ResponseData<directChatResponseDto>(
          plainToInstance(directChatResponseDto, chat),
          HttpStatus.OK,
          'Direct chat retrieved successfully', // More specific message
        );
      } else {
        return new ResponseData<groupChatResponseDto>(
          plainToInstance(groupChatResponseDto, chat),
          HttpStatus.OK,
          'Group chat retrieved successfully', // More specific message
        );
      }
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to retrieve chat');
    }
  }

  @Post('direct')
  async createDirectChat(
    @Body() createDirectChatDto: CreateDirectChatDto,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<directChatResponseDto>> {
    try {
      const chat = await this.chatService.createDirectChat({
        ...createDirectChatDto,
        memberIds: [...createDirectChatDto.memberIds, userId], // Include current user
      });

      return new ResponseData<directChatResponseDto>(
        plainToInstance(directChatResponseDto, chat),
        HttpStatus.CREATED,
        'Direct chat created successfully',
      );
    } catch (error: unknown) {
      AppError.throw(
        error,
        'Failed to create direct chat',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('group')
  async createGroupChat(
    @Body() createGroupChatDto: CreateGroupChatDto,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<groupChatResponseDto>> {
    try {
      if (!createGroupChatDto.memberIds.includes(userId)) {
        createGroupChatDto.memberIds.push(userId);
      }

      const chat = await this.chatService.createGroupChat(createGroupChatDto);

      return new ResponseData<groupChatResponseDto>(
        plainToInstance(groupChatResponseDto, chat),
        HttpStatus.CREATED,
        'Group chat created successfully',
      );
    } catch (error: unknown) {
      AppError.throw(
        error,
        'Failed to create group chat',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':chatId')
  async update(
    @Param('chatId') chatId: string,
    @Body() updateChatDto: UpdateChatDto,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<groupChatResponseDto>> {
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

      return new ResponseData<groupChatResponseDto>(
        plainToInstance(groupChatResponseDto, updatedChat),
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
  ): Promise<ResponseData<directChatResponseDto | groupChatResponseDto>> {
    try {
      const deletedChat = await this.chatService.deleteChat(chatId, userId);

      if (deletedChat.type === ChatType.DIRECT) {
        return new ResponseData<directChatResponseDto>(
          plainToInstance(directChatResponseDto, deletedChat),
          HttpStatus.OK,
          'Direct chat deleted successfully',
        );
      } else {
        return new ResponseData<groupChatResponseDto>(
          plainToInstance(groupChatResponseDto, deletedChat),
          HttpStatus.OK,
          'Group chat deleted successfully',
        );
      }
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to delete chat');
    }
  }
}
