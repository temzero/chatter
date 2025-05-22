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
  ): Promise<ResponseData<ChatMemberResponseDto[]>> {
    const members = await this.memberService.findByChatId(chatId);
    const membersResponse = members.map(mapChatMemberToResponseDto);
    return new ResponseData(
      membersResponse,
      HttpStatus.OK,
      'Chat members retrieved successfully',
    );
  }

  @Get(':chatId/:userId')
  async getMember(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ): Promise<ResponseData<ChatMemberResponseDto>> {
    const member = await this.memberService.getMember(chatId, userId);
    const memberResponse = mapChatMemberToResponseDto(member);
    return new ResponseData(
      memberResponse,
      HttpStatus.OK,
      'Chat member retrieved successfully',
    );
  }

  @Post()
  async addMember(
    @Body() body: { chatId: string; userId: string; role?: ChatMemberRole },
  ) {
    const { chatId, userId, role } = body;
    const newMember = await this.memberService.addMember(chatId, userId, role);

    return new ResponseData(
      newMember,
      HttpStatus.CREATED,
      'Member added successfully',
    );
  }

  @Patch(':chatId/:userId')
  async updateMember(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
    @Body()
    updateDto: UpdateChatMemberDto,
  ): Promise<ResponseData<ChatMemberResponseDto>> {
    const updatedMember = await this.memberService.updateMember(
      chatId,
      userId,
      updateDto,
    );
    const memberResponse = mapChatMemberToResponseDto(updatedMember);
    return new ResponseData(
      plainToInstance(ChatMemberResponseDto, memberResponse),
      HttpStatus.OK,
      'Member updated successfully',
    );
  }

  @Patch('last-read/:chatId/:userId')
  async updateLastReadMessage(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
    @Body() body: { messageId: string },
  ): Promise<ResponseData<ChatMemberResponseDto>> {
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
  }

  @Delete(':chatId/:userId')
  async removeMember(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ) {
    const removedMember = await this.memberService.removeMember(chatId, userId);

    return new ResponseData(
      removedMember,
      HttpStatus.OK,
      'Member removed successfully',
    );
  }
}
