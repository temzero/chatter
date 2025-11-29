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
  Query,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ChatService } from './chat.service';
import { CreateDirectChatDto } from './dto/requests/create-direct-chat.dto';
import { CreateGroupChatDto } from './dto/requests/create-group-chat.dto';
import { UpdateChatDto } from '@/modules/chat/dto/requests/update-chat.dto';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ErrorResponse } from '@/common/api-response/errors';
import { ChatResponseDto } from './dto/responses/chat-response.dto';
import { ChatType } from '@shared/types/enums/chat-type.enum';
import { SystemEventType } from '@shared/types/enums/system-event-type.enum';
import { MessageService } from '../message/message.service';
import { MessageResponseDto } from '../message/dto/responses/message-response.dto';
import { PaginationQuery } from '@shared/types/queries/pagination-query';
import { PaginationResponse } from '@shared/types/responses/pagination.response';
import {
  GetOrCreateResponse,
  SuccessResponse,
} from '@/common/api-response/success';
import { ForbiddenError } from '@shared/types/enums/error-message.enum';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findInitialChats(
    @CurrentUser('id') userId: string,
    @Query() query?: PaginationQuery,
  ): Promise<SuccessResponse<PaginationResponse<ChatResponseDto>>> {
    try {
      const payload = await this.chatService.getInitialChats(userId, query);

      return new SuccessResponse(payload, 'User chats retrieved successfully');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve user chats');
    }
  }

  @Get('more')
  @HttpCode(HttpStatus.OK)
  async findByPagination(
    @CurrentUser('id') userId: string,
    @Query() queryParams: PaginationQuery,
  ): Promise<SuccessResponse<PaginationResponse<ChatResponseDto>>> {
    try {
      const payload = await this.chatService.getUnpinnedChats(
        userId,
        queryParams,
      );

      return new SuccessResponse(payload, 'User chats retrieved successfully');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve user chats');
    }
  }

  @Get('saved')
  async getSavedChat(
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<ChatResponseDto>> {
    try {
      const savedChat = await this.chatService.getSavedChat(userId);
      return new SuccessResponse(
        savedChat,
        'Saved chat retrieved successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve saved chat');
    }
  }

  @Get(':chatId')
  async findOne(
    @Param('chatId') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<ChatResponseDto>> {
    try {
      const chat = await this.chatService.getUserChat(id, userId);

      return new SuccessResponse(
        chat,
        `${chat.type} chat retrieved successfully`,
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve chat');
    }
  }

  @Post('direct')
  async getOrCreateDirectChat(
    @Body() createDirectChatDto: CreateDirectChatDto,
    @CurrentUser('id') userId: string,
  ): Promise<GetOrCreateResponse<ChatResponseDto>> {
    try {
      const result = await this.chatService.getOrCreateDirectChat(
        userId,
        createDirectChatDto.partnerId,
      );

      return new GetOrCreateResponse(
        plainToInstance(ChatResponseDto, result.chat),
        result.wasExisting,
        result.wasExisting
          ? 'Direct chat already created — retrieved successfully'
          : 'Direct chat created successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(
        error,
        'Failed to process direct chat request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('direct/by-userid/:partnerId')
  async getDirectChatByUserId(
    @Param('partnerId') partnerId: string,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<ChatResponseDto>> {
    try {
      const chat = await this.chatService.getDirectChatByUserId(
        userId,
        partnerId,
      );

      return new SuccessResponse(chat, 'Direct chat fetched successfully');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to fetch direct chat by userId');
    }
  }

  @Post('group')
  async createGroupChat(
    @CurrentUser('id') userId: string,
    @Body() createGroupChatDto: CreateGroupChatDto,
  ): Promise<SuccessResponse<ChatResponseDto>> {
    try {
      const chat = await this.chatService.createGroupChat(
        userId,
        createGroupChatDto,
      );

      return new SuccessResponse(
        plainToInstance(ChatResponseDto, chat),
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
    @CurrentUser('id') userId: string,
    @Param('chatId') chatId: string,
    @Body() updateChatDto: UpdateChatDto,
  ): Promise<SuccessResponse<ChatResponseDto>> {
    try {
      const chat = await this.chatService.getUserChat(chatId, userId);

      if (chat.type === ChatType.DIRECT) {
        const isParticipant = await this.chatService.isChatParticipant(
          chatId,
          userId,
        );
        if (!isParticipant) {
          ErrorResponse.forbidden(ForbiddenError.NOT_CHAT_PARTICIPANT);
        }
      } else {
        const isAdminOrOwner = await this.chatService.isAdminOrOwner(
          chatId,
          userId,
        );
        if (!isAdminOrOwner) {
          ErrorResponse.forbidden(ForbiddenError.INSUFFICIENT_PERMISSIONS);
        }
      }

      // 🔍 Check what’s changed
      const nameChanged =
        updateChatDto.name !== undefined && updateChatDto.name !== chat.name;
      const avatarChanged =
        updateChatDto.avatarUrl !== undefined &&
        updateChatDto.avatarUrl !== chat.avatarUrl;
      const descriptionChanged =
        updateChatDto.description !== undefined &&
        updateChatDto.description !== chat.description;

      // ✅ Update the chat
      const updatedChat = await this.chatService.updateChat(
        chat,
        updateChatDto,
      );

      const createSystemMessages: Promise<MessageResponseDto>[] = [];

      if (nameChanged) {
        createSystemMessages.push(
          this.messageService.createSystemEventMessage(
            chatId,
            userId,
            SystemEventType.CHAT_RENAMED,
            {
              oldValue: chat.name ?? undefined,
              newValue: updateChatDto.name,
            },
          ),
        );
      }

      if (avatarChanged) {
        createSystemMessages.push(
          this.messageService.createSystemEventMessage(
            chatId,
            userId,
            SystemEventType.CHAT_UPDATE_AVATAR,
            {
              oldValue: chat.avatarUrl ?? undefined,
              newValue: updateChatDto.avatarUrl,
            },
          ),
        );
      }

      if (descriptionChanged) {
        createSystemMessages.push(
          this.messageService.createSystemEventMessage(
            chatId,
            userId,
            SystemEventType.CHAT_UPDATE_DESCRIPTION,
            {
              oldValue: chat.description ?? undefined,
              newValue: updateChatDto.description,
            },
          ),
        );
      }

      if (createSystemMessages.length > 0) {
        await Promise.all(createSystemMessages);
      }

      const responseData = plainToInstance(ChatResponseDto, updatedChat);
      return new SuccessResponse(responseData, 'Chat updated successfully');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to update chat');
    }
  }

  @Delete(':chatId')
  async delete(
    @Param('chatId') chatId: string,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<ChatResponseDto>> {
    try {
      const deletedChat = await this.chatService.deleteChat(chatId, userId);

      const responseData =
        deletedChat.type === ChatType.DIRECT
          ? plainToInstance(ChatResponseDto, deletedChat)
          : plainToInstance(ChatResponseDto, deletedChat);

      return new SuccessResponse(
        responseData,
        `${deletedChat.type} chat deleted successfully`,
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to delete chat');
    }
  }
}
