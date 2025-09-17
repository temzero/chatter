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
import { LivekitService } from './liveKit.service';
import { PendingCallStatus } from './type/callStatus';
import { IncomingCallResponse } from '../websocket/constants/callPayload.type';
import { ChatService } from '../chat/chat.service';
import { ChatType } from '../chat/constants/chat-types.constants';

@Controller('calls')
@UseGuards(JwtAuthGuard)
export class CallController {
  constructor(
    private readonly liveKitService: LivekitService,
    private readonly callService: CallService,
    private readonly chatService: ChatService,
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
  ): Promise<SuccessResponse<IncomingCallResponse[]>> {
    try {
      // 1. Get all chatIds this user belongs to
      const chatIds = await this.chatMemberService.getChatIdsByUserId(userId);

      // 2. Get active rooms from LiveKit that match those chatIds
      const activeRooms = await this.liveKitService.getActiveRoomsForUser(
        userId,
        chatIds,
      );

      // 3. Map active rooms into IncomingCallResponse shape
      const pendingCalls: IncomingCallResponse[] = await Promise.all(
        activeRooms.map(async (room) => {
          // 1. Fetch chat data for this room/chatId
          const chat = await this.chatService.getChatById(room.name); // or getChatFromData(room.name)

          // 2. Determine call type
          const isGroupCall = chat.type !== ChatType.DIRECT;
          const isVideoCall = isGroupCall ? true : false; // or derive from your rules

          const status =
            room.numParticipants <= 1
              ? PendingCallStatus.DIALING
              : PendingCallStatus.IN_PROGRESS;

          return {
            callId: room.name, // optional, match your call entity if exists
            chatId: room.name, // roomName = chatId
            status,
            participantsCount: room.numParticipants,
            isVideoCall,
            isGroupCall,
            startedAt: room.creationTime
              ? new Date(Number(room.creationTime) * 1000)
              : undefined,
          };
        }),
      );

      return new SuccessResponse(
        pendingCalls,
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
      avatarUrl?: string;
    },
  ): Promise<SuccessResponse<{ token: string }>> {
    try {
      const { roomName, participantName, avatarUrl } = body;
      const token = await this.liveKitService.generateLivekitToken(
        roomName,
        userId,
        participantName,
        avatarUrl,
      );
      return new SuccessResponse({ token }, 'LiveKit token generated');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to generate LiveKit token');
    }
  }
}
