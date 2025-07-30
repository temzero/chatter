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
import { mapChatMemberToResponseDto } from './mappers/chat-member.mapper';
import { ChatService } from '../chat/chat.service';
import { ChatType } from '../chat/constants/chat-types.constants';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { SystemEventType } from '../message/constants/system-event-type.constants';
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

  @Get(':chatId/:userId')
  async getMemberByChatIdAndUserId(
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
    const memberResponse = mapChatMemberToResponseDto(member, chatType);
    return new SuccessResponse(
      memberResponse,
      'Chat member retrieved successfully',
    );
  }

  @Post()
  async addMembers(
    @Body() body: { chatId: string; userIds: string[] },
    // @CurrentUser('id') currentUserId: string,
  ): Promise<SuccessResponse<GroupChatMemberResponseDto[]>> {
    const { chatId, userIds } = body;
    const newMembers = await this.memberService.addMembers(chatId, userIds);
    const memberResponses = newMembers.map((member) =>
      plainToInstance(
        GroupChatMemberResponseDto,
        mapChatMemberToResponseDto(member),
      ),
    );

    // Create system message for each added member
    for (const userId of userIds) {
      await this.messageService.createSystemEventMessage(
        chatId,
        userId,
        SystemEventType.MEMBER_JOINED,
      );
    }

    return new SuccessResponse(memberResponses, 'Members added successfully');
  }

  @Patch(':memberId')
  async updateMember(
    @CurrentUser('id') userId: string,
    @Param('memberId') memberId: string,
    @Body() updateDto: UpdateChatMemberDto,
  ): Promise<SuccessResponse<GroupChatMemberResponseDto>> {
    try {
      // 🔍 Get the old member before update
      const oldMember = await this.memberService.findById(memberId);

      // ✅ Perform the update
      const updatedMember = await this.memberService.updateMember(
        memberId,
        updateDto,
      );

      const chatId = updatedMember.chatId;

      // ✅ Explicitly typed array to store message creation promises
      const createSystemMessages: Promise<MessageResponseDto>[] = [];

      // 🔍 Check what's changed before emitting system messages
      const nicknameChanged =
        updateDto.nickname !== undefined &&
        updateDto.nickname !== oldMember.nickname;

      const roleChanged =
        updateDto.role !== undefined && updateDto.role !== oldMember.role;

      const statusChanged =
        updateDto.status !== undefined && updateDto.status !== oldMember.status;

      // 📨 Prepare system event messages
      if (nicknameChanged) {
        createSystemMessages.push(
          this.messageService.createSystemEventMessage(
            chatId,
            userId,
            SystemEventType.MEMBER_UPDATE_NICKNAME,
            JSON.stringify({
              old: oldMember.nickname,
              new: updateDto.nickname,
            }),
          ),
        );
      }

      if (roleChanged) {
        createSystemMessages.push(
          this.messageService.createSystemEventMessage(
            chatId,
            userId,
            SystemEventType.MEMBER_UPDATE_ROLE,
            JSON.stringify({
              old: oldMember.role,
              new: updateDto.role,
            }),
          ),
        );
      }

      if (statusChanged) {
        createSystemMessages.push(
          this.messageService.createSystemEventMessage(
            chatId,
            userId,
            SystemEventType.MEMBER_UPDATE_STATUS,
            JSON.stringify({
              old: oldMember.status,
              new: updateDto.status,
            }),
          ),
        );
      }

      // 🔔 Emit all system messages concurrently
      if (createSystemMessages.length > 0) {
        await Promise.all(createSystemMessages);
      }

      // 🧾 Prepare and return response
      const memberResponse = mapChatMemberToResponseDto(updatedMember);
      const responseData = plainToInstance(
        GroupChatMemberResponseDto,
        memberResponse,
      );
      return new SuccessResponse(responseData, 'Member updated successfully');
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
    const { chatId, oldNickname, newNickname } =
      await this.memberService.updateNickname(memberId, body.nickname);

    await this.messageService.createSystemEventMessage(
      chatId,
      currentUserId,
      SystemEventType.MEMBER_UPDATE_NICKNAME,
      JSON.stringify({
        oldNickname: oldNickname,
        newNickname: newNickname,
      }),
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
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ): Promise<SuccessResponse<{ chatDeleted: boolean }>> {
    const { member, chatDeleted } = await this.memberService.softDeleteMember(
      chatId,
      userId,
    );

    // Create system message for member removal
    await this.messageService.createSystemEventMessage(
      chatId,
      userId,
      SystemEventType.MEMBER_LEFT,
      member.nickname || member.user.firstName,
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
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ): Promise<SuccessResponse<{ chatDeleted: boolean }>> {
    const { member, chatDeleted } = await this.memberService.removeMember(
      chatId,
      userId,
    );
    // Create system message for member removal
    await this.messageService.createSystemEventMessage(
      chatId,
      userId,
      SystemEventType.MEMBER_LEFT,
      member.nickname || member.user.firstName,
    );

    return new SuccessResponse(
      { chatDeleted },
      chatDeleted
        ? 'Chat deleted as no members remain'
        : 'Member removed successfully',
    );
  }
}
