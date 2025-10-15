import {
  Controller,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SuccessResponse } from 'src/common/api-response/success';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChatMemberService } from './chat-member.service';
import {
  GroupChatMemberResponseDto,
  DirectChatMemberResponseDto,
} from './dto/responses/chat-member-response.dto';
import { UpdateChatMemberDto } from './dto/requests/update-chat-member.dto';
import { mapChatMemberToChatMemberResDto } from './mappers/chat-member.mapper';
import { ChatService } from '../chat/chat.service';
import { ChatType } from 'src/shared/types/enums/chat-type.enum';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { SystemEventType } from 'src/shared/types/enums/system-event-type.enum';
import { MessageService } from '../message/message.service';
import { MessageResponseDto } from '../message/dto/responses/message-response.dto';
import { ErrorResponse } from 'src/common/api-response/errors';

@Controller('chat-members')
@UseGuards(JwtAuthGuard)
export class ChatMemberController {
  constructor(
    private readonly memberService: ChatMemberService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  @Get('direct/:chatId')
  async getDirectChatMembers(
    @Param('chatId') chatId: string,
    @CurrentUser('id') currentUserId: string,
  ): Promise<SuccessResponse<DirectChatMemberResponseDto[]>> {
    const members = await this.memberService.findByChatIdWithBlockStatus(
      chatId,
      currentUserId,
      ChatType.DIRECT,
    );

    return new SuccessResponse(
      members as DirectChatMemberResponseDto[],
      'Direct chat members retrieved successfully',
    );
  }

  @Get('group/:chatId')
  async getGroupChatMembers(
    @Param('chatId') chatId: string,
    @CurrentUser('id') currentUserId: string,
  ): Promise<SuccessResponse<GroupChatMemberResponseDto[]>> {
    const members = await this.memberService.findByChatIdWithBlockStatus(
      chatId,
      currentUserId,
      ChatType.GROUP,
    );

    return new SuccessResponse(
      members as GroupChatMemberResponseDto[],
      'Group chat members retrieved successfully',
    );
  }

  @Get(':memberId')
  async fetchMemberById(
    @Param('memberId') memberId: string,
  ): Promise<
    SuccessResponse<GroupChatMemberResponseDto | DirectChatMemberResponseDto>
  > {
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
  ): Promise<
    SuccessResponse<GroupChatMemberResponseDto | DirectChatMemberResponseDto>
  > {
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
    const member = await this.memberService.addMembers(chatId, [currentUserId]);

    await this.messageService.createSystemEventMessage(
      chatId,
      currentUserId, // The user who joined is the sender
      SystemEventType.MEMBER_JOINED,
    );

    return new SuccessResponse(member, 'Successfully joined the chat');
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
  ): Promise<SuccessResponse<GroupChatMemberResponseDto>> {
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
        plainToInstance(GroupChatMemberResponseDto, memberResponse),
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
    @Param('messageId') messageId: string,
  ): Promise<SuccessResponse<GroupChatMemberResponseDto>> {
    const updatedMember = await this.memberService.updateLastRead(
      memberId,
      messageId,
    );
    return new SuccessResponse(
      plainToInstance(GroupChatMemberResponseDto, updatedMember),
      'Last read message updated successfully',
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
      !isSelfRemoval ? { targetId: userId } : undefined,
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
      !isSelfRemoval
        ? {
            targetId: userId,
            targetName: member.nickname ?? member.user.firstName,
          }
        : undefined,
    );

    return new SuccessResponse(
      { chatDeleted },
      chatDeleted
        ? 'Chat deleted as no members remain'
        : 'Member removed successfully',
    );
  }
}
