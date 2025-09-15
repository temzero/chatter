import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CallService } from './call.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { SuccessResponse } from 'src/common/api-response/success';
import { ErrorResponse } from 'src/common/api-response/errors';
import { CallResponseDto } from './dto/call-response.dto';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChatMemberService } from '../chat-member/chat-member.service';

@Controller('calls')
@UseGuards(JwtAuthGuard)
export class CallController {
  constructor(
    private readonly callService: CallService,
    private readonly chatMemberService: ChatMemberService,
  ) {}

  @Get('history')
  async getCallHistory(
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<CallResponseDto[]>> {
    try {
      const calls = await this.callService.getCallHistory(userId);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, calls),
        'Call history retrieved successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve call history');
    }
  }

  @Get('pending')
  async getPendingCalls(
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<CallResponseDto[]>> {
    try {
      const calls = await this.callService.getPendingCalls(userId);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, calls),
        'Pending calls retrieved successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve pending calls');
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCall(
    @Body() createCallDto: CreateCallDto,
  ): Promise<SuccessResponse<CallResponseDto>> {
    try {
      const call = await this.callService.createCall(createCallDto);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, call),
        'Call created successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to create call');
    }
  }

  @Get(':id')
  async getCall(
    @Param('id') id: string,
  ): Promise<SuccessResponse<CallResponseDto>> {
    try {
      const call = await this.callService.getCallById(id);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, call),
        'Call retrieved successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve call');
    }
  }

  @Get('chat/:chatId')
  async getCallsByChat(
    @Param('chatId') chatId: string,
  ): Promise<SuccessResponse<CallResponseDto[]>> {
    try {
      const calls = await this.callService.getCallsByChatId(chatId);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, calls),
        'Calls retrieved successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve calls by chat');
    }
  }

  @Patch(':id')
  async updateCall(
    @Param('id') id: string,
    @Body() updateCallDto: UpdateCallDto,
  ): Promise<SuccessResponse<CallResponseDto>> {
    try {
      const updated = await this.callService.updateCall(id, updateCallDto);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, updated),
        'Call updated successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to update call');
    }
  }

  @Post('join/:callId/:chatId')
  async joinCall(
    @CurrentUser('id') userId: string,
    @Param('callId') callId: string,
    @Param('chatId') chatId: string,
  ): Promise<SuccessResponse<CallResponseDto>> {
    const myMemberId = await this.chatMemberService.getMemberId(userId, chatId);

    try {
      const updated = await this.callService.joinCall(callId, myMemberId);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, updated),
        'Joined call successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to join call');
    }
  }

  @Post(':id/end')
  async endCall(
    @Param('id') id: string,
  ): Promise<SuccessResponse<CallResponseDto>> {
    try {
      const ended = await this.callService.endCall(id);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, ended),
        'Call ended successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to end call');
    }
  }

  @Delete(':id')
  async deleteCall(@Param('id') id: string): Promise<SuccessResponse<null>> {
    try {
      await this.callService.deleteCall(id);
      return new SuccessResponse(null, 'Call deleted successfully');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to delete call');
    }
  }

  @Post('token')
  async getLivekitToken(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      roomName: string;
      participantName?: string;
    },
  ): Promise<SuccessResponse<{ token: string }>> {
    try {
      const { roomName, participantName } = body;
      const token = await this.callService.generateLivekitToken(
        roomName,
        userId,
        participantName,
      );
      return new SuccessResponse({ token }, 'LiveKit token generated');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to generate LiveKit token');
    }
  }
}
