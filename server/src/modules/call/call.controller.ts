import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CallService } from './call.service';
import { SuccessResponse } from 'src/common/api-response/success';
import { ErrorResponse } from 'src/common/api-response/errors';
import { CallResponseDto } from './dto/call-response.dto';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChatMemberService } from '../chat-member/chat-member.service';
import { LiveKitService } from './liveKit.service';
import { CallStatus } from 'src/shared/types/call';
import { IncomingCallResponse } from 'src/shared/types/call';
import { ChatService } from '../chat/chat.service';
import { ChatType } from 'src/shared/types/enums/chat-type.enum';
import { GenerateLiveKitTokenDto } from './dto/generate-livekit-token.dto';
import { UpdateCallData } from './types/update-call-data.type';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Controller('calls')
@UseGuards(JwtAuthGuard)
export class CallController {
  constructor(
    private readonly liveKitService: LiveKitService,
    private readonly callService: CallService,
    private readonly chatService: ChatService,
    private readonly chatMemberService: ChatMemberService,
  ) {}

  @Get('history')
  async getCallHistory(
    @CurrentUser('id') userId: string,
    @Query() query?: PaginationQueryDto,
  ): Promise<SuccessResponse<{ calls: CallResponseDto[]; hasMore: boolean }>> {
    try {
      const { calls, hasMore } = await this.callService.getCallHistory(
        userId,
        query,
      );

      return new SuccessResponse(
        { calls, hasMore },
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
      if (chatIds.length === 0) {
        return new SuccessResponse([], 'No chats found for user');
      }

      // 2. Get active rooms from LiveKit that match those chatIds
      const activeRooms = await this.liveKitService.getActiveRoomsForUser(
        userId,
        chatIds,
      );

      // 3. Map active rooms into IncomingCallResponse shape
      const pendingCalls: IncomingCallResponse[] = await Promise.all(
        activeRooms.map(async (room) => {
          // 1. Fetch chat data for this room/chatId
          const chat = await this.chatService.getChatById(room.name);
          const callId = await this.callService.getActiveCallIdByChatId(
            room.name,
          );

          // 2. Determine call type
          const isVideoCall = chat.type !== ChatType.DIRECT;
          const isBroadcast = chat.type === ChatType.CHANNEL;

          const status =
            room.numParticipants <= 1
              ? CallStatus.DIALING
              : CallStatus.IN_PROGRESS;

          return {
            callId: callId ?? 'empty',
            chatId: room.name, // roomName = chatId
            status,
            participantsCount: room.numParticipants,
            isVideoCall,
            isBroadcast,
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
      console.error('[getPendingCalls] Error:', error);
      ErrorResponse.throw(error, 'Failed to retrieve pending calls');
    }
  }

  @Get('active/:chatId')
  async getActiveCall(
    @Param('chatId') chatId: string,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<IncomingCallResponse | null>> {
    try {
      // 1. Get active room from LiveKit for this specific chat
      const room = await this.liveKitService.getActiveRoomForChat(
        userId,
        chatId,
      );

      if (!room) {
        return new SuccessResponse(null, 'No active call found');
      }

      // 2. Fetch chat data for this room/chatId
      const chat = await this.chatService.getChatById(room.name);
      const callId = await this.callService.getActiveCallIdByChatId(room.name);

      // 3. Determine call type
      const isVideoCall = chat.type !== ChatType.DIRECT;

      const status =
        room.numParticipants <= 1 ? CallStatus.DIALING : CallStatus.IN_PROGRESS;

      const activeCall: IncomingCallResponse = {
        callId: callId ?? 'empty',
        chatId: room.name,
        status,
        participantsCount: room.numParticipants,
        isVideoCall,
        startedAt: room.creationTime
          ? new Date(Number(room.creationTime) * 1000)
          : undefined,
      };

      return new SuccessResponse(
        activeCall,
        'Active call retrieved successfully',
      );
    } catch (error: unknown) {
      console.error('[getActiveCall] Error:', error);
      ErrorResponse.throw(error, 'Failed to retrieve active call');
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

  @Post('token')
  async getLiveKitToken(
    @CurrentUser('id') userId: string,
    @Body() body: GenerateLiveKitTokenDto,
  ): Promise<SuccessResponse<{ token: string }>> {
    try {
      const { chatId, participantName, avatarUrl } = body;
      const token = await this.liveKitService.generateLiveKitToken(
        chatId,
        userId,
        participantName ?? null,
        avatarUrl ?? null,
      );
      return new SuccessResponse({ token }, 'LiveKit token generated');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to generate LiveKit token');
    }
  }

  @Post(':id')
  async updateCall(
    @Param('id') id: string,
    @Body() body: UpdateCallData,
  ): Promise<SuccessResponse<CallResponseDto>> {
    try {
      const updatedCall = await this.callService.updateCall(id, body);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, updatedCall),
        'Call updated successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to update call');
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
}
