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
  HttpCode,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ChatService } from './chat.service';
import {
  CreateDirectChatDto,
  CreateGroupChatDto,
} from 'src/modules/chat/dto/requests/create-chat.dto';
import { UpdateChatDto } from 'src/modules/chat/dto/requests/update-chat.dto';
import { SuccessResponse } from 'src/common/api-response/success';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import {
  directChatResponseDto,
  groupChatResponseDto,
} from './dto/responses/chat-response.dto';
import { ChatMemberRole } from '../chat-member/constants/chat-member-roles.constants';
import { ErrorResponse } from 'src/common/api-response/errors';
import { ChatListResponseDto } from './dto/responses/chat-list-response.dto';
import { ChatType } from './constants/chat-types.constants';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<ChatListResponseDto[]>> {
    try {
      const chats = await this.chatService.getChatsByUserId(userId);
      return new SuccessResponse(
        plainToInstance(ChatListResponseDto, chats),
        'User chats retrieved successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve user chats');
    }
  }

  @Get(':chatId')
  async findOne(
    @Param('chatId') id: string,
  ): Promise<SuccessResponse<directChatResponseDto | groupChatResponseDto>> {
    try {
      const chat = await this.chatService.getChatById(id);

      if (!Object.values(ChatType).includes(chat.type)) {
        throw new Error('Invalid chat type');
      }

      const responseData =
        chat.type === ChatType.DIRECT
          ? plainToInstance(directChatResponseDto, chat)
          : plainToInstance(groupChatResponseDto, chat);

      return new SuccessResponse(
        responseData,
        `${chat.type} chat retrieved successfully`,
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve chat');
    }
  }

  @Post('direct')
  async createDirectChat(
    @Body() createDirectChatDto: CreateDirectChatDto,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<directChatResponseDto>> {
    try {
      const chat = await this.chatService.createDirectChat({
        ...createDirectChatDto,
        memberIds: [userId, ...createDirectChatDto.memberIds],
      });

      return new SuccessResponse(
        plainToInstance(directChatResponseDto, chat),
        'Direct chat created successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(
        error,
        'Failed to create direct chat',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('group')
  async createGroupChat(
    @CurrentUser('id') userId: string,
    @Body() createGroupChatDto: CreateGroupChatDto,
  ): Promise<SuccessResponse<groupChatResponseDto>> {
    try {
      const chat = await this.chatService.createGroupChat({
        ...createGroupChatDto,
        memberIds: [userId, ...createGroupChatDto.memberIds],
      });

      return new SuccessResponse(
        plainToInstance(groupChatResponseDto, chat),
        'Group chat created successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(
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
  ): Promise<SuccessResponse<groupChatResponseDto>> {
    try {
      const chat = await this.chatService.getChatById(chatId);
      const member = chat.members.find((m) => m.userId === userId);

      if (
        !member ||
        ![ChatMemberRole.ADMIN, ChatMemberRole.OWNER].includes(member.role)
      ) {
        ErrorResponse.unauthorized('Unauthorized to update chat');
      }

      const updatedChat = await this.chatService.updateChat(
        chatId,
        updateChatDto,
      );

      return new SuccessResponse(
        plainToInstance(groupChatResponseDto, updatedChat),
        'Chat updated successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to update chat');
    }
  }

  @Delete(':chatId')
  async delete(
    @Param('chatId') chatId: string,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<directChatResponseDto | groupChatResponseDto>> {
    try {
      const deletedChat = await this.chatService.deleteChat(chatId, userId);
      const responseDto =
        deletedChat.type === ChatType.DIRECT
          ? plainToInstance(directChatResponseDto, deletedChat)
          : plainToInstance(groupChatResponseDto, deletedChat);

      return new SuccessResponse(
        responseDto,
        `${deletedChat.type} chat deleted successfully`,
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to delete chat');
    }
  }
}
