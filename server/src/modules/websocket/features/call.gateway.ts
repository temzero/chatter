// src/calls/call.gateway.ts
import { NotFoundException } from '@nestjs/common';
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
  RtcOfferRequest,
  RtcOfferResponse,
  RtcAnswerRequest,
  RtcAnswerResponse,
  IceCandidateRequest,
  IceCandidateResponse,
  UpdateCallPayload,
  InitiateCallRequest,
  IncomingCallResponse,
} from '../constants/callPayload.type';
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
import { WebsocketNotificationService } from '../services/websocket-notification.service';
import { CallService } from 'src/modules/call/call.service';
import { PendingCallStatus } from 'src/modules/call/type/callStatus';
import { LivekitService } from 'src/modules/call/liveKit.service';

@WebSocketGateway()
export class CallGateway {
  constructor(
    private readonly websocketNotificationService: WebsocketNotificationService,
    private readonly chatMemberService: ChatMemberService,
    private readonly callService: CallService,
    private readonly liveKitService: LivekitService,
  ) {}

  @SubscribeMessage(CallEvent.INITIATE_CALL)
  async handleCallInitiate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: InitiateCallRequest,
  ) {
    const userId = client.data.userId;

    const initiatorMember =
      await this.chatMemberService.getMemberByChatIdAndUserId(
        payload.chatId,
        userId,
      );

    if (!initiatorMember) throw new Error('Initiator not found');

    // Instead of saving in DB, just create a lightweight response
    const response: IncomingCallResponse = {
      chatId: payload.chatId,
      isVideoCall: payload.isVideoCall,
      isGroupCall: payload.isGroupCall,
      status: PendingCallStatus.DIALING,
      initiatorMemberId: initiatorMember.id,
      participantsCount: 1,
    };

    console.log('Call initiated (signaling only):', response);

    // Notify other members
    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.INCOMING_CALL,
      response,
      { senderId: userId, excludeSender: true },
    );

    return { success: true, chatId: payload.chatId };
  }

  @SubscribeMessage(CallEvent.UPDATE_CALL)
  async handleUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: UpdateCallPayload,
  ) {
    const userId = client.data.userId;

    const call = await this.callService.getLastCallByChatId(payload.chatId);
    if (!call) {
      throw new NotFoundException(
        `No active call found for chat ${payload.chatId}`,
      );
    }

    // persist update in DB
    const updatedCall = await this.callService.updateCall(call.id, {
      isVideoCall: payload.isVideoCall,
      status: payload.callStatus, // optional: allow frontend to send status updates
    });

    const responsePayload: UpdateCallPayload = {
      callId: updatedCall.id,
      chatId: payload.chatId,
      isVideoCall: updatedCall.isVideoCall,
      callStatus: updatedCall.status,
    };

    // broadcast updated call to all members
    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.UPDATE_CALL,
      responsePayload,
      { senderId: userId, excludeSender: false },
    );
  }

  @SubscribeMessage(CallEvent.ACCEPT_CALL)
  async handleCallAccept(
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
      memberId: member.id,
    };

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.ACCEPT_CALL,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  @SubscribeMessage(CallEvent.JOIN_CALL)
  async handleJoinCall(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { chatId: string; callId?: string },
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
      memberId: member.id,
    };

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.JOIN_CALL,
      response,
      { senderId: userId, excludeSender: false },
    );
  }

  @SubscribeMessage(CallEvent.REJECT_CALL)
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

    // ✅ No DB call status update (since no call data exists yet)

    const response: CallActionResponse = {
      chatId: payload.chatId,
      memberId: member.id || userId,
      isCallerCancel: payload.isCallerCancel,
    };

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

  @SubscribeMessage(CallEvent.P2P_OFFER_SDP)
  async handleP2PWebRtcOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RtcOfferRequest,
  ) {
    const userId = client.data.userId;
    const member = await this.chatMemberService.getMemberByChatIdAndUserId(
      payload.chatId,
      userId,
    );

    if (!member) {
      throw new Error('User is not a member of this chat');
    }

    const response: RtcOfferResponse = {
      callId: payload.callId,
      offer: payload.offer,
      memberId: member.id,
    };

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.P2P_OFFER_SDP,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  @SubscribeMessage(CallEvent.P2P_ANSWER_SDP)
  async handleRtcAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RtcAnswerRequest,
  ) {
    const userId = client.data.userId;
    const member = await this.chatMemberService.getMemberByChatIdAndUserId(
      payload.chatId,
      userId,
    );

    if (!member) {
      throw new Error('User is not a member of this chat');
    }

    const response: RtcAnswerResponse = {
      callId: payload.callId,
      answer: payload.answer,
      memberId: member.id,
    };

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.P2P_ANSWER_SDP,
      response,
      { senderId: userId, excludeSender: true },
    );
  }

  @SubscribeMessage(CallEvent.ICE_CANDIDATE)
  async handleRtcIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: IceCandidateRequest,
  ) {
    const userId = client.data.userId;
    const member = await this.chatMemberService.getMemberByChatIdAndUserId(
      payload.chatId,
      userId,
    );

    if (!member) {
      throw new Error('User is not a member of this chat');
    }

    const response: IceCandidateResponse = {
      callId: payload.callId,
      candidate: payload.candidate,
      memberId: member.id,
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
