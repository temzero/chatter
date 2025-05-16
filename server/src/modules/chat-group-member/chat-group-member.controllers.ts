import {
  Controller,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Get,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ChatGroupMemberService } from './chat-group-member.service';
import { ChatGroupMemberDto } from 'src/modules/chat-group-member/dto/request/chat-group-member.dto';
import { ChatGroupMember } from 'src/modules/chat-group-member/entities/chat-group-member.entity';
import { ResponseData } from 'src/common/response-data';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChatGroupMemberResponseDto } from './dto/response/chat-group-member-response.dto';

@Controller('chat-group-members')
@UseGuards(JwtAuthGuard)
export class ChatGroupMemberController {
  constructor(private readonly memberService: ChatGroupMemberService) {}

  @Get(':groupChatId')
  async getGroupMembers(
    @Param('groupChatId') groupChatId: string,
  ): Promise<ResponseData<ChatGroupMemberResponseDto[]>> {
    try {
      const members = await this.memberService.findByGroupId(groupChatId);
      return new ResponseData<ChatGroupMemberResponseDto[]>(
        members,
        HttpStatus.OK,
        'Group members retrieved successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async addMember(
    @Body() dto: ChatGroupMemberDto,
  ): Promise<ResponseData<ChatGroupMember>> {
    try {
      const newMember = await this.memberService.addMember(dto);
      return new ResponseData<ChatGroupMember>(
        newMember,
        HttpStatus.CREATED,
        'Member added successfully',
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error || 'Unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':groupChatId/:userId')
  async removeMember(
    @Param('groupChatId') groupChatId: string,
    @Param('userId') userId: string,
  ): Promise<ResponseData<{ success: boolean }>> {
    try {
      await this.memberService.removeMember(groupChatId, userId);
      return new ResponseData<{ success: boolean }>(
        { success: true },
        HttpStatus.OK,
        'Member removed successfully',
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error || 'Unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':groupChatId/:userId')
  async updateMember(
    @Param('groupChatId') groupChatId: string,
    @Param('userId') userId: string,
    @Body() dto: Partial<ChatGroupMemberDto>,
  ): Promise<ResponseData<ChatGroupMember>> {
    try {
      const updatedMember = await this.memberService.updateMember(
        groupChatId,
        userId,
        dto,
      );
      return new ResponseData<ChatGroupMember>(
        updatedMember,
        HttpStatus.OK,
        'Member updated successfully',
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error || 'Unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
