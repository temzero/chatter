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
import { ChatMemberResponseDto } from './dto/responses/chat-member-response.dto';
import { UpdateChatMemberDto } from './dto/requests/update-chat-member.dto';
import { mapChatMemberToResponseDto } from './mappers/chat-member.mapper.dto';

@Controller('chat-members')
@UseGuards(JwtAuthGuard)
export class ChatMemberController {
  constructor(private readonly memberService: ChatMemberService) {}

  @Get(':chatId')
  async getChatMembers(
    @Param('chatId') chatId: string,
  ): Promise<SuccessResponse<ChatMemberResponseDto[]>> {
    const members = await this.memberService.findByChatId(chatId);
    const membersResponse = members.map(mapChatMemberToResponseDto);
    return new SuccessResponse(
      membersResponse,
      'Chat members retrieved successfully',
    );
  }

  @Get(':chatId/:userId')
  async getMember(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ): Promise<SuccessResponse<ChatMemberResponseDto>> {
    const member = await this.memberService.getMember(chatId, userId);
    const memberResponse = mapChatMemberToResponseDto(member);
    return new SuccessResponse(
      memberResponse,
      'Chat member retrieved successfully',
    );
  }

  @Post()
  async addMember(
    @Body() body: { chatId: string; userId: string; role?: ChatMemberRole },
  ): Promise<SuccessResponse<ChatMemberResponseDto>> {
    const { chatId, userId, role } = body;
    const newMember = await this.memberService.addMember(chatId, userId, role);
    const memberResponse = mapChatMemberToResponseDto(newMember);
    return new SuccessResponse(memberResponse, 'Member added successfully');
  }

  @Patch(':chatId/:userId')
  async updateMember(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
    @Body()
    updateDto: UpdateChatMemberDto,
  ): Promise<SuccessResponse<ChatMemberResponseDto>> {
    const updatedMember = await this.memberService.updateMember(
      chatId,
      userId,
      updateDto,
    );
    const memberResponse = mapChatMemberToResponseDto(updatedMember);
    return new SuccessResponse(
      plainToInstance(ChatMemberResponseDto, memberResponse),
      'Member updated successfully',
    );
  }

  @Patch('nickname/:chatId/:userId')
  async updateNickname(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
    @Body() body: { nickname: string },
  ): Promise<SuccessResponse<string>> {
    const nickname = await this.memberService.updateNickname(
      chatId,
      userId,
      body.nickname,
    );
    return new SuccessResponse(nickname ?? '', 'Nickname updated successfully');
  }

  @Patch('last-read/:chatId/:userId')
  async updateLastReadMessage(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
    @Body() body: { messageId: string },
  ): Promise<SuccessResponse<ChatMemberResponseDto>> {
    const { messageId } = body;
    const updatedMember = await this.memberService.updateLastReadMessage(
      chatId,
      userId,
      messageId,
    );
    return new SuccessResponse(
      plainToInstance(ChatMemberResponseDto, updatedMember),
      'Last read message updated successfully',
    );
  }

  @Delete(':chatId/:userId')
  async removeMember(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ): Promise<SuccessResponse<ChatMemberResponseDto>> {
    const removedMember = await this.memberService.removeMember(chatId, userId);
    const memberResponse = mapChatMemberToResponseDto(removedMember);
    return new SuccessResponse(memberResponse, 'Member removed successfully');
  }
}
