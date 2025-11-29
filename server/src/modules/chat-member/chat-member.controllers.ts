import {
  Controller,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SuccessResponse } from '@/common/api-response/success';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChatMemberService } from './chat-member.service';
import { ChatMemberResponseDto } from './dto/responses/chat-member-response.dto';
import { UpdateChatMemberDto } from './dto/requests/update-chat-member.dto';
import { mapChatMemberToChatMemberResDto } from './mappers/chat-member.mapper';
import { ChatService } from '../chat/chat.service';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { SystemEventType } from '@shared/types/enums/system-event-type.enum';
import { MessageService } from '../message/message.service';
import { MessageResponseDto } from '../message/dto/responses/message-response.dto';
import { ErrorResponse } from '@/common/api-response/errors';
import { PaginationQuery } from '@shared/types/queries/pagination-query';
import { PaginationResponse } from '@shared/types/responses/pagination.response';

@Controller('chat-members')
@UseGuards(JwtAuthGuard)
export class ChatMemberController {
  constructor(
    private readonly memberService: ChatMemberService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  @Get('members/:chatId')
  async getChatMembers(
    @CurrentUser('id') currentUserId: string,
    @Param('chatId') chatId: string,
    @Query() queryParams: PaginationQuery,
  ): Promise<SuccessResponse<PaginationResponse<ChatMemberResponseDto>>> {
    const payload = await this.memberService.findByChatIdWithBlockStatus(
      chatId,
      currentUserId,
      queryParams, // Pass pagination params
    );

    return new SuccessResponse(payload, 'Chat members retrieved successfully');
  }

  @Get('member/:memberId')
  async fetchMemberById(
    @Param('memberId') memberId: string,
  ): Promise<SuccessResponse<ChatMemberResponseDto>> {
    const member = await this.memberService.findById(memberId);

    const chatType = await this.chatService.getChatType(member.chatId);
    const memberResponse = mapChatMemberToChatMemberResDto(member, chatType);

    return new SuccessResponse(
      memberResponse,
      'Chat member retrieved successfully',
    );
  }

  @Get('chat/:chatId/user/:userId')
  async fetchMemberByChatIdAndUserId(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ): Promise<SuccessResponse<ChatMemberResponseDto>> {
    const member = await this.memberService.getMemberByChatIdAndUserId(
      chatId,
      userId,
    );
    const chatType = await this.chatService.getChatType(chatId);
    const memberResponse = mapChatMemberToChatMemberResDto(member, chatType);
    return new SuccessResponse(
      memberResponse,
      'Chat member retrieved successfully',
    );
  }

  @Post('join/:chatId')
  async joinChat(
    @Param('chatId') chatId: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    const members = await this.memberService.addMembers(chatId, [
      currentUserId,
    ]);

    if (members.length === 0) {
      throw new Error('Failed to join chat');
    }

    const joinedMember = members[0];

    await this.messageService.createSystemEventMessage(
      chatId,
      currentUserId,
      SystemEventType.MEMBER_JOINED,
      {
        targetId: joinedMember.userId,
        targetName: joinedMember.nickname ?? joinedMember.user.firstName,
      },
    );

    return new SuccessResponse(
      mapChatMemberToChatMemberResDto(joinedMember),
      'Successfully joined the chat',
    );
  }

  @Post()
  async addMembers(
    @Body() body: { chatId: string; userIds: string[] },
    @CurrentUser('id') currentUserId: string,
  ) {
    const members = await this.memberService.addMembers(
      body.chatId,
      body.userIds,
    );

    // System messages
    for (const member of members) {
      await this.messageService.createSystemEventMessage(
        body.chatId,
        currentUserId,
        SystemEventType.MEMBER_ADDED,
        {
          targetId: member.userId,
          targetName: member.nickname ?? member.user.firstName,
        },
      );
    }

    return new SuccessResponse(
      members.map((m) => mapChatMemberToChatMemberResDto(m)),
      'Members added successfully',
    );
  }

  @Patch(':memberId')
  async updateMember(
    @CurrentUser('id') userId: string,
    @Param('memberId') memberId: string,
    @Body() updateDto: UpdateChatMemberDto,
  ): Promise<SuccessResponse<ChatMemberResponseDto>> {
    try {
      const oldMember = await this.memberService.findById(memberId);
      const updatedMember = await this.memberService.updateMember(
        memberId,
        updateDto,
      );
      const chatId = updatedMember.chatId;

      const createSystemMessages: Promise<MessageResponseDto>[] = [];

      if (
        updateDto.nickname !== undefined &&
        updateDto.nickname !== oldMember.nickname
      ) {
        createSystemMessages.push(
          this.messageService.createSystemEventMessage(
            chatId,
            userId,
            SystemEventType.MEMBER_UPDATE_NICKNAME,
            {
              oldValue: oldMember.nickname ?? undefined,
              newValue: updateDto.nickname,
              targetId: oldMember.user.id,
              targetName: oldMember.user.firstName,
            },
          ),
        );
      }

      if (updateDto.role !== undefined && updateDto.role !== oldMember.role) {
        createSystemMessages.push(
          this.messageService.createSystemEventMessage(
            chatId,
            userId,
            SystemEventType.MEMBER_UPDATE_ROLE,
            {
              oldValue: oldMember.role,
              newValue: updateDto.role,
              targetId: oldMember.user.id,
              targetName: oldMember.user.firstName,
            },
          ),
        );
      }

      if (
        updateDto.status !== undefined &&
        updateDto.status !== oldMember.status
      ) {
        createSystemMessages.push(
          this.messageService.createSystemEventMessage(
            chatId,
            userId,
            SystemEventType.MEMBER_UPDATE_STATUS,
            {
              oldValue: oldMember.status,
              newValue: updateDto.status,
              targetId: oldMember.user.id,
              targetName: oldMember.user.firstName,
            },
          ),
        );
      }

      if (createSystemMessages.length > 0) {
        await Promise.all(createSystemMessages);
      }

      const memberResponse = mapChatMemberToChatMemberResDto(updatedMember);
      return new SuccessResponse(
        plainToInstance(ChatMemberResponseDto, memberResponse),
        'Member updated successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to update member');
    }
  }

  @Patch('nickname/:memberId')
  async updateNickname(
    @CurrentUser('id') currentUserId: string,
    @Param('memberId') memberId: string,
    @Body() body: { nickname: string },
  ): Promise<SuccessResponse<string>> {
    const { userId, chatId, firstName, oldNickname, newNickname } =
      await this.memberService.updateNickname(memberId, body.nickname);

    await this.messageService.createSystemEventMessage(
      chatId,
      currentUserId,
      SystemEventType.MEMBER_UPDATE_NICKNAME,
      {
        oldValue: oldNickname ?? undefined,
        newValue: newNickname ?? undefined,
        targetId: userId,
        targetName: firstName ?? undefined,
      },
    );

    return new SuccessResponse(
      newNickname ?? '',
      'Nickname updated successfully',
    );
  }

  @Patch('last-read/:memberId/:messageId')
  async updateLastReadMessage(
    @Param('memberId') memberId: string,
    @Param('messageId') messageId: string | null,
  ): Promise<SuccessResponse<ChatMemberResponseDto>> {
    const updatedMember = await this.memberService.updateLastRead(
      memberId,
      messageId,
    );
    return new SuccessResponse(
      plainToInstance(ChatMemberResponseDto, updatedMember),
      'Last read message updated successfully',
    );
  }

  @Patch('pin/:memberId')
  async pinChat(
    @Param('memberId') memberId: string,
    @Body() body: { isPinned: boolean },
  ): Promise<SuccessResponse<ChatMemberResponseDto>> {
    const updatedMember = await this.memberService.togglePinChat(
      memberId,
      body.isPinned,
    );

    return new SuccessResponse(
      plainToInstance(ChatMemberResponseDto, updatedMember),
      body.isPinned ? 'Chat pinned successfully' : 'Chat unpinned successfully',
    );
  }

  @Patch('mute/:memberId')
  async updateMute(
    @Param('memberId') memberId: string,
    @Body() body: { mutedUntil: string | null },
  ): Promise<SuccessResponse<Date | null>> {
    const parsedMutedUntil =
      body.mutedUntil !== null ? new Date(body.mutedUntil) : null;

    const updatedMember = await this.memberService.updateMember(memberId, {
      mutedUntil: parsedMutedUntil,
    });

    return new SuccessResponse(
      updatedMember.mutedUntil,
      'Muted until updated successfully',
    );
  }

  @Delete('soft-delete/:chatId/:userId')
  async softDeleteMember(
    @CurrentUser('id') currentUserId: string,
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ): Promise<SuccessResponse<{ chatDeleted: boolean }>> {
    const { chatDeleted } = await this.memberService.softDeleteMember(
      chatId,
      userId,
    );

    const isSelfRemoval = currentUserId === userId;
    const eventType = isSelfRemoval
      ? SystemEventType.MEMBER_LEFT
      : SystemEventType.MEMBER_KICKED;

    await this.messageService.createSystemEventMessage(
      chatId,
      currentUserId,
      eventType,
      {
        targetId: userId,
      },
    );

    return new SuccessResponse(
      { chatDeleted },
      chatDeleted
        ? 'Chat deleted as no members remain'
        : 'Member removed successfully',
    );
  }

  @Delete(':chatId/:userId')
  async hardDeleteMember(
    @CurrentUser('id') currentUserId: string,
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ): Promise<SuccessResponse<{ chatDeleted: boolean }>> {
    const { member, chatDeleted } = await this.memberService.removeMember(
      chatId,
      userId,
    );

    const isSelfRemoval = currentUserId === userId;
    const eventType = isSelfRemoval
      ? SystemEventType.MEMBER_LEFT
      : SystemEventType.MEMBER_KICKED;

    await this.messageService.createSystemEventMessage(
      chatId,
      currentUserId,
      eventType,
      {
        targetId: userId,
        targetName: member.nickname ?? member.user.firstName,
      },
    );

    return new SuccessResponse(
      { chatDeleted },
      chatDeleted
        ? 'Chat deleted as no members remain'
        : 'Member removed successfully',
    );
  }
}
