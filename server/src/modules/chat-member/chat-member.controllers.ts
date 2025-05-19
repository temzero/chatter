import {
  Controller,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Get,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResponseData } from 'src/common/response-data';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChatMemberService } from './chat-member.service';
import { ChatMemberRole } from './constants/chat-member-roles.constants';
import { ChatMemberStatus } from './constants/chat-member-status.constants';
import { ChatMemberResponseDto } from './dto/responses/chat-member-response.dto';
import { AppError } from 'src/common/errors';

@Controller('chat-members')
@UseGuards(JwtAuthGuard)
export class ChatMemberController {
  constructor(private readonly memberService: ChatMemberService) {}

  @Get(':chatId')
  async getChatMembers(
    @Param('chatId') chatId: string,
  ): Promise<ResponseData<ChatMemberResponseDto[]>> {
    try {
      const members = await this.memberService.findByChatId(chatId);
      return new ResponseData(
        plainToInstance(ChatMemberResponseDto, members),
        HttpStatus.OK,
        'Chat members retrieved successfully',
      );
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve chat members');
    }
  }

  @Get(':chatId/:userId')
  async getMember(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ): Promise<ResponseData<ChatMemberResponseDto>> {
    try {
      const member = await this.memberService.getMember(chatId, userId);
      return new ResponseData(
        plainToInstance(ChatMemberResponseDto, member),
        HttpStatus.OK,
        'Chat member retrieved successfully',
      );
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve chat member');
    }
  }

  @Post()
  async addMember(
    @Body() body: { chatId: string; userId: string; role?: ChatMemberRole },
  ): Promise<ResponseData<ChatMemberResponseDto>> {
    try {
      const { chatId, userId, role } = body;
      const newMember = await this.memberService.addMember(
        chatId,
        userId,
        role,
      );
      return new ResponseData(
        plainToInstance(ChatMemberResponseDto, newMember),
        HttpStatus.CREATED,
        'Member added successfully',
      );
    } catch (error) {
      AppError.throw(error, 'Failed to add member', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':chatId/:userId')
  async removeMember(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ): Promise<ResponseData<{ success: boolean }>> {
    try {
      await this.memberService.removeMember(chatId, userId);
      return new ResponseData(
        { success: true },
        HttpStatus.OK,
        'Member removed successfully',
      );
    } catch (error) {
      AppError.throw(error, 'Failed to remove member');
    }
  }

  @Patch(':chatId/:userId')
  async updateMember(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
    @Body()
    updates: {
      role?: ChatMemberRole;
      status?: ChatMemberStatus;
      nickname?: string | null;
      customTitle?: string | null;
      mutedUntil?: Date | null;
      lastReadMessageId?: string | null;
    },
  ): Promise<ResponseData<ChatMemberResponseDto>> {
    try {
      const updatedMember = await this.memberService.updateMember(
        chatId,
        userId,
        updates,
      );
      return new ResponseData(
        plainToInstance(ChatMemberResponseDto, updatedMember),
        HttpStatus.OK,
        'Member updated successfully',
      );
    } catch (error) {
      AppError.throw(error, 'Failed to update member');
    }
  }

  @Patch(':chatId/:userId/last-read')
  async updateLastReadMessage(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
    @Body() body: { messageId: string },
  ): Promise<ResponseData<ChatMemberResponseDto>> {
    try {
      const { messageId } = body;
      const updatedMember = await this.memberService.updateLastReadMessage(
        chatId,
        userId,
        messageId,
      );
      return new ResponseData(
        plainToInstance(ChatMemberResponseDto, updatedMember),
        HttpStatus.OK,
        'Last read message updated successfully',
      );
    } catch (error) {
      AppError.throw(error, 'Failed to update last read message');
    }
  }
}
