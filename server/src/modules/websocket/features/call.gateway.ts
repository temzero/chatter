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
  InitiateCallRequest,
  IncomingCallResponse,
  CallActionRequest,
  CallActionResponse,
  RtcOfferRequest,
  RtcOfferResponse,
  RtcAnswerRequest,
  RtcAnswerResponse,
  IceCandidateRequest,
  IceCandidateResponse,
  updateCallPayload,
} from '../constants/callPayload.type';
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
import { ChatService } from 'src/modules/chat/chat.service';
import { WebsocketNotificationService } from '../services/websocket-notification.service';
import { WebsocketCallService } from '../services/websocket-call.service';

@WebSocketGateway()
export class CallGateway {
  constructor(
    private readonly websocketNotificationService: WebsocketNotificationService,
    private readonly websocketCallService: WebsocketCallService,
    private readonly chatMemberService: ChatMemberService,
    private readonly chatService: ChatService,
  ) {}

  /**
   * Clear pending calls for all participants in a chat
   * @param chatId - The chat ID
   * @param userId - The user ID initiating the action
   */
  private async clearPendingCalls(chatId: string, userId: string) {
    const chatMembers = await this.chatMemberService.getChatMembers(chatId);
    chatMembers.forEach((member) => {
      if (member.userId !== userId) {
        const key = `${chatId}:${member.userId}`;
        this.websocketCallService.getAndRemovePendingCall(key);
      }
    });
  }

  @SubscribeMessage(CallEvent.INITIATE_CALL)
  async handleCallInitiate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: InitiateCallRequest,
  ) {
    const userId = client.data.userId;
    const fromMemberId = await this.chatMemberService.getChatMemberId(
      payload.chatId,
      userId,
    );

    const response: IncomingCallResponse = {
      chatId: payload.chatId,
      isVideoCall: payload.isVideoCall,
      fromMemberId,
      timestamp: Date.now(),
    };

    // Store the call for offline users using websocketService
    const chatMembers = await this.chatMemberService.getChatMembers(
      payload.chatId,
    );
    chatMembers.forEach((member) => {
      if (member.userId !== userId) {
        const key = `${payload.chatId}:${member.userId}`;
        this.websocketCallService.addPendingCall(key, response);
      }
    });

    // Notify all online chat members except the caller
    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.INCOMING_CALL,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  @SubscribeMessage(CallEvent.PENDING_CALLS)
  async handleRequestPendingCalls(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const userId = client.data.userId;
    const pendingCalls: IncomingCallResponse[] = [];
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const userChatsResult = await this.chatService.getUserChats(userId);
    const userChats = userChatsResult.chats;

    for (const chat of userChats) {
      const key = `${chat.id}:${userId}`;
      const call = this.websocketCallService.getAndRemovePendingCall(key);

      // Check if call is still valid (within 1 minute)
      if (call && call.timestamp >= oneMinuteAgo) {
        pendingCalls.push(call);
      }
    }

    client.emit(CallEvent.PENDING_CALLS, pendingCalls);
  }

  @SubscribeMessage(CallEvent.UPDATE_CALL)
  async handleUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: updateCallPayload,
  ) {
    const userId = client.data.userId;

    const response: updateCallPayload = {
      chatId: payload.chatId,
      isVideoCall: payload.isVideoCall,
    };

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.UPDATE_CALL,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  @SubscribeMessage(CallEvent.ACCEPT_CALL)
  async handleCallAccept(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallActionRequest,
  ) {
    const userId = client.data.userId;
    const fromMemberId = await this.chatMemberService.getChatMemberId(
      payload.chatId,
      userId,
    );

    const response: CallActionResponse = {
      chatId: payload.chatId,
      fromMemberId,
      timestamp: Date.now(),
      isCallerCancel: payload.isCallerCancel,
    };

    // Clear pending calls for all participants
    await this.clearPendingCalls(payload.chatId, userId);

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.ACCEPT_CALL,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  @SubscribeMessage(CallEvent.REJECT_CALL)
  async handleCallReject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallActionRequest,
  ) {
    const userId = client.data.userId;
    const fromMemberId = await this.chatMemberService.getChatMemberId(
      payload.chatId,
      userId,
    );

    const response: CallActionResponse = {
      chatId: payload.chatId,
      fromMemberId,
      timestamp: Date.now(),
      isCallerCancel: payload.isCallerCancel,
    };

    // Clear pending calls for all participants
    await this.clearPendingCalls(payload.chatId, userId);

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.REJECT_CALL,
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
    const fromMemberId = await this.chatMemberService.getChatMemberId(
      payload.chatId,
      userId,
    );

    const response: CallActionResponse = {
      chatId: payload.chatId,
      fromMemberId,
      timestamp: Date.now(),
    };

    // Clear pending calls for all participants
    await this.clearPendingCalls(payload.chatId, userId);

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.HANG_UP,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  @SubscribeMessage(CallEvent.OFFER_SDP)
  async handleRtcOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RtcOfferRequest,
  ) {
    const userId = client.data.userId;
    const fromMemberId = await this.chatMemberService.getChatMemberId(
      payload.chatId,
      userId,
    );

    const response: RtcOfferResponse = {
      chatId: payload.chatId,
      offer: payload.offer,
      fromMemberId,
    };

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.OFFER_SDP,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  @SubscribeMessage(CallEvent.ANSWER_SDP)
  async handleRtcAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RtcAnswerRequest,
  ) {
    const userId = client.data.userId;
    const fromMemberId = await this.chatMemberService.getChatMemberId(
      payload.chatId,
      userId,
    );

    const response: RtcAnswerResponse = {
      chatId: payload.chatId,
      answer: payload.answer,
      fromMemberId,
      toMemberId: 'sfu',
    };

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.ANSWER_SDP,
      response,
    );
  }

  @SubscribeMessage(CallEvent.ICE_CANDIDATE)
  async handleRtcIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: IceCandidateRequest,
  ) {
    const userId = client.data.userId;
    const fromMemberId = await this.chatMemberService.getChatMemberId(
      payload.chatId,
      userId,
    );

    const response: IceCandidateResponse = {
      chatId: payload.chatId,
      candidate: payload.candidate,
      fromMemberId,
    };

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.ICE_CANDIDATE,
      response,
      {
        senderId: userId,
        excludeSender: true,
      },
    );
  }
}
