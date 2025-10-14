// src/calls/call.gateway.ts
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { AuthenticatedSocket } from '../constants/authenticatedSocket.type';
import { CallEvent } from '../constants/websocket-events';
import {
  CallActionRequest,
  CallActionResponse,
  UpdateCallPayload,
  // InitiateCallRequest,
  // IncomingCallResponse,
  // CallError,
  // CallErrorResponse,
} from '../constants/callPayload.type';
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
import { WebsocketNotificationService } from '../services/websocket-notification.service';

@WebSocketGateway()
export class CallGateway {
  constructor(
    private readonly websocketNotificationService: WebsocketNotificationService,
    private readonly chatMemberService: ChatMemberService,
  ) {}

  @SubscribeMessage(CallEvent.UPDATE_CALL)
  async handleUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: UpdateCallPayload,
  ) {
    const userId = client.data.userId;
    // 🚫 No DB update here — this is ephemeral state only
    const responsePayload: UpdateCallPayload = {
      callId: payload.callId, // rely on payload or generate from context
      chatId: payload.chatId,
      isVideoCall: payload.isVideoCall,
      callStatus: payload.callStatus,
    };

    // ✅ Broadcast updated call state to all chat members
    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.UPDATE_CALL,
      responsePayload,
      { senderId: userId, excludeSender: false },
    );
  }

  @SubscribeMessage(CallEvent.DECLINE_CALL)
  async handleCallDecline(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallActionRequest,
  ) {
    const userId = client.data.userId;

    const chatMembers = await this.chatMemberService.findByChatId(
      payload.chatId,
    );

    if (chatMembers.length > 2) {
      console.log(
        `[DECLINE_CALL] Ignored for group chat (chatId=${payload.chatId}, userId=${userId})`,
      );
      return;
    }

    const myMember = chatMembers.find((m) => m.userId === userId);
    if (!myMember) {
      throw new Error('Sender is not a member of this chat');
    }

    const response: CallActionResponse = {
      callId: payload.callId,
      chatId: payload.chatId,
      memberId: myMember.id || userId,
      isCallerCancel: payload.isCallerCancel,
    };

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.DECLINE_CALL,
      response,
      { senderId: userId, excludeSender: true },
    );
  }
}
