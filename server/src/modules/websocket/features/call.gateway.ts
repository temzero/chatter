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
    const fromMemberId = await this.chatMemberService.getChatMemberIdFromUserId(
      payload.chatId,
      userId,
    );

    const response: IncomingCallResponse = {
      chatId: payload.chatId,
      isVideoCall: payload.isVideoCall,
      isGroupCall: payload.isGroupCall,
      fromMemberId,
      timestamp: Date.now(),
      ...(payload.toMemberId ? { toMemberId: payload.toMemberId } : {}),
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.INCOMING_CALL,
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
    const fromMemberId = await this.chatMemberService.getChatMemberIdFromUserId(
      payload.chatId,
      userId,
    );

    const response: CallActionResponse = {
      chatId: payload.chatId,
      fromMemberId,
      timestamp: Date.now(),
      ...(payload.isCallerCancel ? { isCallerCancel: true } : {}),
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
    const fromMemberId = await this.chatMemberService.getChatMemberIdFromUserId(
      payload.chatId,
      userId,
    );

    const response: CallActionResponse = {
      chatId: payload.chatId,
      fromMemberId,
      timestamp: Date.now(),
      ...(payload.isCallerCancel ? { isCallerCancel: true } : {}),
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
    const fromMemberId = await this.chatMemberService.getChatMemberIdFromUserId(
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
      { senderId: userId, excludeSender: true },
    );
  }

  // 5️⃣ WebRTC Signaling: Offer
  @SubscribeMessage(CallEvent.OFFER_SDP)
  async handleRtcOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RtcOfferRequest,
  ) {
    const userId = client.data.userId;
    const fromMemberId = await this.chatMemberService.getChatMemberIdFromUserId(
      payload.chatId,
      userId,
    );

    const response: RtcOfferResponse = {
      chatId: payload.chatId,
      offer: payload.offer,
      fromMemberId,
      ...(payload.toMemberId ? { toMemberId: payload.toMemberId } : {}),
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.OFFER_SDP,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  // 6️⃣ WebRTC Signaling: Answer
  @SubscribeMessage(CallEvent.ANSWER_SDP)
  async handleRtcAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RtcAnswerRequest,
  ) {
    const userId = client.data.userId;
    const fromMemberId = await this.chatMemberService.getChatMemberIdFromUserId(
      payload.chatId,
      userId,
    );

    const response: RtcAnswerResponse = {
      chatId: payload.chatId,
      answer: payload.answer,
      fromMemberId,
      toMemberId: payload.toMemberId,
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.ANSWER_SDP,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  // 7️⃣ WebRTC Signaling: ICE Candidate
  @SubscribeMessage(CallEvent.ICE_CANDIDATE)
  async handleRtcIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: IceCandidateRequest,
  ) {
    const userId = client.data.userId;
    const fromMemberId = await this.chatMemberService.getChatMemberIdFromUserId(
      payload.chatId,
      userId,
    );

    const response: IceCandidateResponse = {
      chatId: payload.chatId,
      candidate: payload.candidate,
      fromMemberId,
      toMemberId: payload.toMemberId,
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.ICE_CANDIDATE,
      response,
      { senderId: userId, excludeSender: true },
    );
  }
}
