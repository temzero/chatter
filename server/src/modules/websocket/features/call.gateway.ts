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
  InitiateCallRequest,
  IncomingCallResponse,
  CallError,
  CallErrorResponse,
} from '../constants/callPayload.type';
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
import { WebsocketNotificationService } from '../services/websocket-notification.service';
import { CallStatus } from 'src/modules/call/type/callStatus';
import { CallStoreService } from '../services/call-store.service ';

@WebSocketGateway()
export class CallGateway {
  constructor(
    private readonly websocketNotificationService: WebsocketNotificationService,
    private readonly chatMemberService: ChatMemberService,
    private readonly callStore: CallStoreService,
  ) {}

  // @SubscribeMessage(CallEvent.INITIATE_CALL)
  // async handleCallInitiate(
  //   @ConnectedSocket() client: AuthenticatedSocket,
  //   @MessageBody() payload: InitiateCallRequest,
  // ) {
  //   const userId = client.data.userId;

  //   // 1️⃣ Block if caller is already in another call
  //   if (this.callStore.isUserInCall(userId)) {
  //     const errorResponse: CallErrorResponse = {
  //       reason: CallError.CALL_FAILED,
  //     };
  //     return errorResponse;
  //   }

  //   // 2️⃣ Get chat members (exclude caller)
  //   const chatMembers = await this.chatMemberService.getChatMembers(
  //     payload.chatId,
  //   );
  //   const otherMembers = chatMembers.filter((m) => m.userId !== userId);
  //   if (otherMembers.length === 0) {
  //     const errorResponse: CallErrorResponse = {
  //       reason: CallError.INITIATION_FAILED,
  //     };
  //     return errorResponse;
  //   }

  //   // 3️⃣ Filter only free members (not in another call)
  //   const freeMembers = otherMembers.filter(
  //     (m) => !this.callStore.isUserInCall(m.userId),
  //   );

  //   // 4️⃣ If no free members → notify caller line busy
  //   if (freeMembers.length === 0) {
  //     const errorResponse: CallErrorResponse = {
  //       reason: CallError.LINE_BUSY,
  //     };
  //     return errorResponse;
  //   }

  //   // 5️⃣ Get initiator chat member
  //   const initiatorMember =
  //     await this.chatMemberService.getMemberByChatIdAndUserId(
  //       payload.chatId,
  //       userId,
  //     );
  //   if (!initiatorMember) {
  //     const errorResponse: CallErrorResponse = {
  //       reason: CallError.INITIATION_FAILED,
  //     };
  //     return errorResponse;
  //   }

  //   // 6️⃣ Build call response
  //   const response: IncomingCallResponse = {
  //     callId: 'callId',
  //     chatId: payload.chatId,
  //     status: CallStatus.DIALING,
  //     initiatorMemberId: initiatorMember.id,
  //     isVideoCall: payload.isVideoCall,
  //     participantsCount: 1,
  //   };

  //   console.log('Call initiated:', response);

  //   // 7️⃣ Notify only free members
  //   for (const member of freeMembers) {
  //     this.websocketNotificationService.emitToUser(
  //       member.userId,
  //       CallEvent.INCOMING_CALL,
  //       response,
  //     );
  //   }

  //   return { success: true, chatId: payload.chatId };
  // }

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

  @SubscribeMessage(CallEvent.JOIN_CALL)
  async handleCallAccept(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallActionRequest,
  ) {
    console.log('JOIN_CALL', payload);
    const userId = client.data.userId;
    const member = await this.chatMemberService.getMemberByChatIdAndUserId(
      payload.chatId,
      userId,
    );
    if (!member) {
      throw new Error('User is not a member of this chat');
    }

    const response: CallActionResponse = {
      chatId: payload.chatId,
      memberId: member.id,
    };

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.JOIN_CALL,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  @SubscribeMessage(CallEvent.DECLINE_CALL)
  async handleCallReject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallActionRequest,
  ) {
    const userId = client.data.userId;

    const member = await this.chatMemberService.getMemberByChatIdAndUserId(
      payload.chatId,
      userId,
    );

    if (!member) {
      throw new Error('User is not a member of this chat');
    }

    const response: CallActionResponse = {
      chatId: payload.chatId,
      memberId: member.id || userId,
      isCallerCancel: payload.isCallerCancel,
    };

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.DECLINE_CALL,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  @SubscribeMessage(CallEvent.HANG_UP)
  async handleHangup(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallActionRequest,
  ) {
    const userId = client.data.userId;
    const member = await this.chatMemberService.getMemberByChatIdAndUserId(
      payload.chatId,
      userId,
    );

    if (!member) {
      throw new Error('User is not a member of this chat');
    }

    // ✅ No DB call lookup/update here

    // Just broadcast that this user hung up
    const response: CallActionResponse = {
      chatId: payload.chatId,
      memberId: member.id,
      isCallerCancel: payload.isCallerCancel,
    };

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.HANG_UP,
      response,
      { senderId: userId, excludeSender: true },
    );
  }
}
