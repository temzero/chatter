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
  InitiateCallPayload,
  IncomingCallPayload,
  CallActionPayload,
  CallUserActionPayload,
  RtcOfferPayload,
  RtcAnswerPayload,
  IceCandidatePayload,
} from '../constants/callPayload.type';
import { ChatService } from 'src/modules/chat/chat.service';

@WebSocketGateway()
export class CallGateway {
  constructor(
    private readonly websocketService: WebsocketService,
    private readonly chatService: ChatService,
  ) {}

  // 1️⃣ Caller initiates a call
  @SubscribeMessage(CallEvent.INITIATE_CALL)
  async handleCallInitiate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: InitiateCallPayload,
  ) {
    const senderId = client.data.userId;

    const response: IncomingCallPayload = {
      chatId: payload.chatId,
      isVideoCall: payload.isVideoCall,
      isGroupCall: payload.isGroupCall,
      callerId: senderId,
      timestamp: Date.now(),
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.INCOMING_CALL,
      response,
      { senderId, excludeSender: true },
    );
  }

  // 2️⃣ Callee accepts
  @SubscribeMessage(CallEvent.ACCEPT_CALL)
  async handleCallAccept(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallActionPayload,
  ) {
    const senderId = client.data.userId;

    const response: CallUserActionPayload = {
      chatId: payload.chatId,
      userId: senderId,
      timestamp: Date.now(),
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.ACCEPT_CALL,
      response,
      {
        senderId,
        excludeSender: true,
      },
    );
  }

  @SubscribeMessage(CallEvent.REJECT_CALL)
  async handleCallReject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallActionPayload,
  ) {
    const senderId = client.data.userId;

    const response: CallUserActionPayload & { isCallerCancel?: boolean } = {
      chatId: payload.chatId,
      userId: senderId,
      timestamp: Date.now(),
      ...(payload.isCallerCancel ? { isCallerCancel: true } : {}), // only added if true
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.REJECT_CALL,
      response,
      {
        senderId,
        excludeSender: true,
      },
    );
  }

  // 4️⃣ Call ends
  @SubscribeMessage(CallEvent.END_CALL)
  async handleCallEnd(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallActionPayload,
  ) {
    const senderId = client.data.userId;

    const response: CallUserActionPayload = {
      chatId: payload.chatId,
      userId: senderId,
      timestamp: Date.now(),
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.END_CALL,
      response,
      {
        senderId,
        excludeSender: true,
      },
    );
  }

  // 5️⃣ WebRTC Signaling: Offer
  @SubscribeMessage(CallEvent.OFFER_SDP)
  async handleRtcOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: { chatId: string; offer: RTCSessionDescriptionInit },
  ) {
    const senderId = client.data.userId;

    const response: RtcOfferPayload = {
      chatId: payload.chatId,
      offer: payload.offer,
      senderId,
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.OFFER_SDP,
      response,
      { senderId, excludeSender: true },
    );
  }

  // 6️⃣ WebRTC Signaling: Answer
  @SubscribeMessage(CallEvent.ANSWER_SDP)
  async handleRtcAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: { chatId: string; answer: RTCSessionDescriptionInit },
  ) {
    const senderId = client.data.userId;

    const response: RtcAnswerPayload = {
      chatId: payload.chatId,
      answer: payload.answer,
      senderId,
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.ANSWER_SDP,
      response,
      { senderId, excludeSender: true },
    );
  }

  // 7️⃣ WebRTC Signaling: ICE Candidate
  @SubscribeMessage(CallEvent.ICE_CANDIDATE)
  async handleRtcIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { chatId: string; candidate: RTCIceCandidateInit },
  ) {
    const senderId = client.data.userId;

    const response: IceCandidatePayload = {
      chatId: payload.chatId,
      candidate: payload.candidate,
      senderId,
    };

    await this.websocketService.emitToChatMembers(
      payload.chatId,
      CallEvent.ICE_CANDIDATE,
      response,
      { senderId, excludeSender: true },
    );
  }
}
