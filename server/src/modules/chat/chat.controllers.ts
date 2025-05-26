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
import {
  DirectChatResponseDto,
  GroupChatResponseDto,
} from './dto/responses/chat-response.dto';
import { ChatType } from './constants/chat-types.constants';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser('id') userId: string,
  ): Promise<
    SuccessResponse<Array<DirectChatResponseDto | GroupChatResponseDto>>
  > {
    try {
      const chats = await this.chatService.getChatsByUserId(userId);

      const transformedChats = chats.map((chat) => {
        return chat.type === ChatType.DIRECT
          ? plainToInstance(DirectChatResponseDto, chat)
          : plainToInstance(GroupChatResponseDto, chat);
      });

      return new SuccessResponse(
        transformedChats,
        'User chats retrieved successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve user chats');
    }
  }

  @Get(':chatId')
  async findOne(
    @Param('chatId') id: string,
  ): Promise<SuccessResponse<DirectChatResponseDto | GroupChatResponseDto>> {
    try {
      const chat = await this.chatService.getChatById(id);

      if (!Object.values(ChatType).includes(chat.type)) {
        throw new Error('Invalid chat type');
      }

      const responseData =
        chat.type === ChatType.DIRECT
          ? plainToInstance(DirectChatResponseDto, chat)
          : plainToInstance(GroupChatResponseDto, chat);

      return new SuccessResponse(
        responseData,
        `${chat.type} chat retrieved successfully`,
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve chat');
    }
  }

  @Post('direct')
  async createOrGetDirectChat(
    @Body() createDirectChatDto: CreateDirectChatDto,
    @CurrentUser('id') userId: string,
  ): Promise<GetOrCreateResponse<DirectChatResponseDto>> {
    try {
      const result = await this.chatService.getOrCreateDirectChat(
        userId,
        createDirectChatDto.partnerId,
      );

      return new GetOrCreateResponse(
        plainToInstance(DirectChatResponseDto, result.chat),
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
  ): Promise<SuccessResponse<GroupChatResponseDto>> {
    try {
      const chat = await this.chatService.createGroupChat(
        userId,
        createGroupChatDto,
      );

      return new SuccessResponse(
        plainToInstance(GroupChatResponseDto, chat),
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
  ): Promise<SuccessResponse<DirectChatResponseDto | GroupChatResponseDto>> {
    try {
      const chat = await this.chatService.getChatById(chatId, false);

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

      const updatedChat = await this.chatService.updateChat(
        chatId,
        updateChatDto,
      );

      const responseData =
        updatedChat.type === ChatType.DIRECT
          ? plainToInstance(DirectChatResponseDto, updatedChat)
          : plainToInstance(GroupChatResponseDto, updatedChat);

      return new SuccessResponse(responseData, 'Chat updated successfully');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to update chat');
    }
  }

  @Delete(':chatId')
  async delete(
    @Param('chatId') chatId: string,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<DirectChatResponseDto | GroupChatResponseDto>> {
    try {
      const deletedChat = await this.chatService.deleteChat(chatId, userId);

      const responseData =
        deletedChat.type === ChatType.DIRECT
          ? plainToInstance(DirectChatResponseDto, deletedChat)
          : plainToInstance(GroupChatResponseDto, deletedChat);

      return new SuccessResponse(
        responseData,
        `${deletedChat.type} chat deleted successfully`,
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to delete chat');
    }
  }
}
