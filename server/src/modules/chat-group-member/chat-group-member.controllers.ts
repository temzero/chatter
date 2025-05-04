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
} from '@nestjs/common';
import { ChatGroupMemberService } from './chat-group-member.service';
import { ChatGroupMemberDto } from 'src/modules/chat-group-member/dto/chat-group-members.dto';
import { ChatGroupMember } from 'src/modules/chat-group-member/entities/chat-group-member.entity';
import { ResponseData } from 'src/common/response-data';

@Controller('chat-group-members')
export class ChatGroupMemberController {
  constructor(private readonly memberService: ChatGroupMemberService) {}

  @Get(':groupId')
  async getGroupMembers(
    @Param('groupId') groupId: string,
  ): Promise<ResponseData<ChatGroupMember[]>> {
    try {
      const members = await this.memberService.findByGroupId(groupId);
      return new ResponseData<ChatGroupMember[]>(
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
      const member = await this.memberService.addMember(dto);
      return new ResponseData<ChatGroupMember>(
        member,
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

  @Delete(':groupId/:userId')
  async removeMember(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
  ): Promise<ResponseData<{ success: boolean }>> {
    try {
      await this.memberService.removeMember(groupId, userId);
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

  @Patch(':groupId/:userId')
  async updateMember(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Body() dto: Partial<ChatGroupMemberDto>,
  ): Promise<ResponseData<ChatGroupMember>> {
    try {
      const updatedMember = await this.memberService.updateMember(
        groupId,
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
