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
import { ChatMemberRole } from './constants/chat-member-roles.constants';
import {
  GroupChatMemberResponseDto,
  DirectChatMemberResponseDto,
} from './dto/responses/chat-member-response.dto';
import { UpdateChatMemberDto } from './dto/requests/update-chat-member.dto';
import { mapChatMemberToResponseDto } from './mappers/chat-member.mapper';
import { ChatService } from '../chat/chat.service';
import { ChatType } from '../chat/constants/chat-types.constants';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('chat-members')
@UseGuards(JwtAuthGuard)
export class ChatMemberController {
  constructor(
    private readonly memberService: ChatMemberService,
    private readonly chatService: ChatService,
  ) {}

  // @Get('direct/:chatId')
  // async getDirectChatMembers(
  //   @Param('chatId') chatId: string,
  // ): Promise<SuccessResponse<DirectChatMemberResponseDto[]>> {
  //   const members = await this.memberService.findByChatId(chatId);
  //   const membersResponse = members.map(
  //     (member) =>
  //       mapChatMemberToResponseDto(
  //         member,
  //         ChatType.DIRECT,
  //       ) as DirectChatMemberResponseDto,
  //   );
  //   return new SuccessResponse(
  //     membersResponse,
  //     'Direct chat members retrieved successfully',
  //   );
  // }

  // @Get('group/:chatId')
  // async getGroupChatMembers(
  //   @Param('chatId') chatId: string,
  // ): Promise<SuccessResponse<GroupChatMemberResponseDto[]>> {
  //   const members = await this.memberService.findByChatId(chatId);
  //   const membersResponse = members.map((member) =>
  //     mapChatMemberToResponseDto(member, ChatType.GROUP),
  //   );
  //   return new SuccessResponse(
  //     membersResponse,
  //     'Group chat members retrieved successfully',
  //   );
  // }

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

  // @Get(':memberId')
  // async getMember(
  //   @Param('memberId') memberId: string,
  // ): Promise<SuccessResponse<GroupChatMemberResponseDto>> {
  //   const member = await this.memberService.getMember(memberId);
  //   const memberResponse = mapChatMemberToResponseDto(member);
  //   return new SuccessResponse(
  //     memberResponse,
  //     'Chat member retrieved successfully',
  //   );
  // }

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
  async addMember(
    @Body() body: { chatId: string; userId: string; role?: ChatMemberRole },
  ): Promise<SuccessResponse<GroupChatMemberResponseDto>> {
    const { chatId, userId, role } = body;
    const newMember = await this.memberService.addMember(chatId, userId, role);
    const memberResponse = plainToInstance(
      GroupChatMemberResponseDto,
      mapChatMemberToResponseDto(newMember),
    );
    return new SuccessResponse(memberResponse, 'Member added successfully');
  }

  @Patch(':memberId')
  async updateMember(
    @Param('memberId') memberId: string,
    @Body()
    updateDto: UpdateChatMemberDto,
  ): Promise<SuccessResponse<GroupChatMemberResponseDto>> {
    const updatedMember = await this.memberService.updateMember(
      memberId,
      updateDto,
    );
    const memberResponse = mapChatMemberToResponseDto(updatedMember);
    return new SuccessResponse(
      plainToInstance(GroupChatMemberResponseDto, memberResponse),
      'Member updated successfully',
    );
  }

  @Patch('nickname/:memberId')
  async updateNickname(
    @Param('memberId') memberId: string,
    @Body() body: { nickname: string },
  ): Promise<SuccessResponse<string>> {
    const nickname = await this.memberService.updateNickname(
      memberId,
      body.nickname,
    );
    return new SuccessResponse(nickname ?? '', 'Nickname updated successfully');
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

  @Delete(':chatId/:userId')
  async removeMember(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ): Promise<SuccessResponse<GroupChatMemberResponseDto>> {
    const removedMember = await this.memberService.removeMember(chatId, userId);
    const memberResponse = mapChatMemberToResponseDto(removedMember);
    return new SuccessResponse(memberResponse, 'Member removed successfully');
  }
}
