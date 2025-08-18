// src/calls/call.gateway.ts
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { WebsocketService } from '../websocket.service';
import { AuthenticatedSocket } from '../constants/authenticatedSocket.type';
import { CallEvent } from '../constants/callEvent.type';
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

@WebSocketGateway()
export class CallGateway {
  constructor(
    private readonly websocketService: WebsocketService,
    private readonly chatMemberService: ChatMemberService,
  ) {}

  // 1️⃣ Caller initiates a call
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
      isGroupCall: payload.isGroupCall,
      fromMemberId,
      timestamp: Date.now(),
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.INCOMING_CALL,
      response,
      { senderId: userId, excludeSender: true },
    );
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
      isGroupCall: payload.isGroupCall,
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.UPDATE_CALL,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  // 2️⃣ Callee accepts
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

    await this.websocketService.emitToChatMembers(
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

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.REJECT_CALL,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  // 4️⃣ Call ends
  @SubscribeMessage(CallEvent.END_CALL)
  async handleCallEnd(
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

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.END_CALL,
      response,
      { senderId: userId },
    ); // Include sender for full cleanup
  }

  // 5️⃣ WebRTC Signaling: Offer (SFU-compatible)
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
      // SFU will handle routing - no toMemberId needed
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.OFFER_SDP,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  // 6️⃣ WebRTC Signaling: Answer (Directed)
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

    // In SFU mode, answers should go to the SFU server only
    const response: RtcAnswerResponse = {
      chatId: payload.chatId,
      answer: payload.answer,
      fromMemberId,
      toMemberId: 'sfu', // Special ID for SFU server
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.ANSWER_SDP,
      response,
      // { senderId: userId, targetId: 'sfu' }, // Direct to SFU
    );
  }

  // 7️⃣ WebRTC Signaling: ICE Candidate (SFU-compatible)
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
      // No toMemberId - SFU will handle broadcasting
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.ICE_CANDIDATE,
      response,
      {
        senderId: userId,
        // SFU mode: broadcast to all except sender
        excludeSender: true,
        // For P2P: add targetId: payload.toMemberId
      },
    );
  }
}
