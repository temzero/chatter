import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { InviteLinkService } from './invite-link.service';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { ChatMemberService } from '../chat-member/chat-member.service';
import { generateInviteLink } from 'src/common/utils/inviteLink.util';
import { SuccessResponse } from 'src/common/api-response/success';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ErrorResponse } from 'src/common/api-response/errors';
import { SystemEventType } from 'src/shared/types/enums/system-event-type.enum';
import { MessageService } from '../message/message.service';

@UseGuards(JwtAuthGuard)
@Controller('invite')
export class InviteLinkController {
  constructor(
    private readonly inviteLinkService: InviteLinkService,
    private readonly chatMemberService: ChatMemberService,
    private readonly messageService: MessageService,
  ) {}

  @Post(':chatId')
  @HttpCode(HttpStatus.OK)
  async createInvite(
    @CurrentUser('id') userId: string,
    @Param('chatId') chatId: string,
    @Body('expiresAt') expiresAt?: string,
    @Body('maxUses') maxUses?: number,
  ): Promise<SuccessResponse<string>> {
    try {
      const newLink = await this.inviteLinkService.createInviteLink(
        chatId,
        userId,
        expiresAt,
        maxUses,
      );

      const url = generateInviteLink(newLink);
      if (!url) throw new Error('Failed to generate invite URL');

      return new SuccessResponse(url, 'New Invite Link Generated');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to create invite link');
    }
  }

  @Post('/join/:token')
  @HttpCode(HttpStatus.OK)
  async joinChat(
    @CurrentUser('id') currentUserId: string,
    @Param('token') token: string,
  ): Promise<SuccessResponse<string>> {
    try {
      const invite = await this.inviteLinkService.validateAndUse(token);
      const chatId = invite.chat.id;

      // Check if user is already a member
      const memberExist = await this.chatMemberService.isMemberExists(
        chatId,
        currentUserId,
      );

      if (memberExist) {
        return new SuccessResponse(chatId, 'You already joined this chat');
      }

      const joinedMembers = await this.chatMemberService.addMembers(chatId, [
        currentUserId,
      ]);

      const joinedMember = joinedMembers[0]; // Only one member join so just get first from array
      // Emit system event message for MEMBER_JOINED
      await this.messageService.createSystemEventMessage(
        chatId,
        currentUserId,
        SystemEventType.MEMBER_JOINED,
        {
          targetId: joinedMember.userId,
          targetName: joinedMember.nickname ?? joinedMember.user.firstName,
        },
      );

      return new SuccessResponse(chatId, 'You joined the chat successfully');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to join chat');
    }
  }

  @Post('/refresh/:token')
  @HttpCode(HttpStatus.OK)
  async refreshInvite(
    @CurrentUser('id') userId: string,
    @Param('token') rawToken: string,
  ): Promise<SuccessResponse<string>> {
    const token = rawToken?.split('/')?.pop()?.trim();

    if (!token || token.length < 8 || token.includes('/')) {
      throw new BadRequestException('Invalid invite token');
    }
    try {
      const newInvite = await this.inviteLinkService.refreshInviteLink(
        token,
        userId,
      );
      const url = generateInviteLink(newInvite);
      if (!url) throw new Error('Failed to generate refreshed invite URL');

      return new SuccessResponse(url, 'Invite Link Refreshed');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to refresh invite link');
    }
  }

  @Post('/revoke/:token')
  @HttpCode(HttpStatus.OK)
  async revokeInvite(
    @Param('token') rawToken: string,
  ): Promise<SuccessResponse<string>> {
    const token = rawToken?.split('/')?.pop()?.trim();

    if (!token || token.length < 8 || token.includes('/')) {
      throw new BadRequestException('Invalid invite token');
    }
    try {
      const revokedLink = await this.inviteLinkService.revoke(token);
      const url = generateInviteLink(revokedLink);
      if (!url) throw new Error('Failed to regenerate invite URL');

      return new SuccessResponse(url, 'Invite Link Revoked and Regenerated');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to revoke invite link');
    }
  }
}
