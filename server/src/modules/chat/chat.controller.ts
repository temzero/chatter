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
import {
  GetOrCreateResponse,
  SuccessResponse,
} from 'src/common/api-response/success';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ErrorResponse } from 'src/common/api-response/errors';
import { ChatResponseDto } from './dto/responses/chat-response.dto';
import { ChatType } from './constants/chat-types.constants';
import { SystemEventType } from '../message/constants/system-event-type.constants';
import { MessageService } from '../message/message.service';
import { MessageResponseDto } from '../message/dto/responses/message-response.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<Array<ChatResponseDto>>> {
    try {
      const chats = await this.chatService.getUserChats(userId);
      return new SuccessResponse(chats, 'User chats retrieved successfully');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve user chats');
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
          ErrorResponse.unauthorized('Unauthorized to update chat');
        }
      } else {
        const isAdminOrOwner = await this.chatService.isAdminOrOwner(
          chatId,
          userId,
        );
        if (!isAdminOrOwner) {
          ErrorResponse.unauthorized(
            'User must be Admin or Owner to update chat',
          );
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

  @Put(':chatId/pin/:messageId')
  async pinMessage(
    @Param('chatId') chatId: string,
    @Param('chatId') messageId: string,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<ChatResponseDto>> {
    const updatedChat = await this.chatService.pinMessage(
      chatId,
      messageId,
      userId,
    );

    return new SuccessResponse(updatedChat, 'Message pinned successfully');
  }

  @Put(':chatId/unpin')
  async unpinMessage(
    @Param('chatId') chatId: string,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<ChatResponseDto>> {
    try {
      const updatedChat = await this.chatService.unpinMessage(chatId, userId);

      return new SuccessResponse(
        plainToInstance(ChatResponseDto, updatedChat),
        'Message unpinned successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to unpin message');
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
