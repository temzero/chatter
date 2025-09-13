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
  InitiateCallRequest,
  CallResponse,
  CallActionRequest,
  CallActionResponse,
  RtcOfferRequest,
  RtcOfferResponse,
  RtcAnswerRequest,
  RtcAnswerResponse,
  IceCandidateRequest,
  IceCandidateResponse,
  UpdateCallPayload,
  CallMemberPayload,
} from '../constants/callPayload.type';
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
import { WebsocketNotificationService } from '../services/websocket-notification.service';
import { CallService } from 'src/modules/call/call.service';
import { CallStatus } from 'src/modules/call/type/callStatus';
import { Call } from 'src/modules/call/entities/call.entity';

@WebSocketGateway()
export class CallGateway {
  constructor(
    private readonly websocketNotificationService: WebsocketNotificationService,
    private readonly chatMemberService: ChatMemberService,
    private readonly callService: CallService,
  ) {}

  @SubscribeMessage(CallEvent.INITIATE_CALL)
  async handleCallInitiate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: InitiateCallRequest,
  ) {
    const userId = client.data.userId;
    // Create call - service will handle member validation internally
    const call = await this.callService.createCall({
      chatId: payload.chatId,
      initiatorUserId: userId, // Pass user ID only
      status: CallStatus.DIALING,
      isVideoCall: payload.isVideoCall,
      isGroupCall: payload.isGroupCall,
    });
    const response: CallResponse = {
      callId: call.id,
      chatId: call.chat.id,
      status: call.status,
      isVideoCall: call.isVideoCall,
      isGroupCall: call.isGroupCall,
      initiatorId: call.initiator.id,
      createdAt: call.createdAt.toISOString(),
    };

    // Notify all online chat members except the caller
    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.INCOMING_CALL,
      response,
      { senderId: userId, excludeSender: true },
    );

    return { success: true, callId: call.id };
  }

  @SubscribeMessage(CallEvent.UPDATE_CALL)
  async handleUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: UpdateCallPayload,
  ) {
    const userId = client.data.userId;

    const call = await this.callService.getActiveCallByChatId(payload.chatId);
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

    // broadcast updated call to all members
    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.UPDATE_CALL,
      updatedCall,
      { senderId: userId, excludeSender: false },
    );
  }

  @SubscribeMessage(CallEvent.UPDATE_CALL_MEMBER)
  async handleCallMemberUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallMemberPayload,
  ) {
    const userId = client.data.userId;

    // Verify the member making the update is the same as the one in the payload
    const userMember = await this.chatMemberService.getMemberByChatIdAndUserId(
      payload.chatId,
      userId,
    );

    if (!userMember || userMember.id !== payload.memberId) {
      throw new Error('Unauthorized: Cannot update other members');
    }

    await this.websocketNotificationService.emitToChatMembers(
      payload.chatId,
      CallEvent.UPDATE_CALL_MEMBER,
      payload,
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

    // Get active call
    const activeCall = await this.callService.getActiveCallByChatId(
      payload.chatId,
    );
    if (!activeCall) throw new Error('No active call found');

    // Update call status
    await this.callService.updateCall(activeCall.id, {
      status: CallStatus.IN_PROGRESS,
    });

    // Add participant
    await this.callService.addParticipant(activeCall.id, member);

    // ✅ Use CallResponse instead of CallActionResponse
    const response: CallResponse = {
      callId: activeCall.id,
      chatId: activeCall.chat.id,
      isVideoCall: activeCall.isVideoCall,
      isGroupCall: activeCall.isGroupCall,
      initiatorId: activeCall.initiator.id,
      status: activeCall.status,
      createdAt: activeCall.createdAt.toISOString(),
      startedAt: activeCall.startedAt?.toISOString(),
      endedAt: activeCall.endedAt?.toISOString(),
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

    // Find or get the active call
    let activeCall: Call | null;
    if (payload.callId) {
      activeCall = await this.callService.getCallById(payload.callId);
    } else {
      activeCall = await this.callService.getActiveCallByChatId(payload.chatId);
    }

    if (!activeCall) {
      throw new Error('No active call found');
    }

    // Add user as participant in the database
    await this.callService.addParticipant(activeCall.id, member);

    // Ensure DB call remains IN_PROGRESS
    await this.callService.updateCall(activeCall.id, {
      status: CallStatus.IN_PROGRESS,
    });

    const response: CallActionResponse = {
      callId: activeCall.id,
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

    // Update DB call status to DECLINED
    const activeCall = await this.callService.getActiveCallByChatId(
      payload.chatId,
    );

    if (!activeCall) {
      throw new Error('No active call found');
    }
    await this.callService.updateCall(activeCall.id, {
      status: CallStatus.DECLINED,
      endedAt: new Date(),
    });

    const response: CallActionResponse = {
      callId: activeCall.id,
      memberId: member.id,
      status: activeCall?.status ?? CallStatus.DECLINED,
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

    // Find the call
    let call: Call | null;
    if (payload.callId) {
      call = await this.callService.getCallById(payload.callId);
    } else {
      call = await this.callService.getActiveCallByChatId(payload.chatId);
    }

    if (!call) {
      throw new Error('Call not found');
    }

    // Remove participant from database
    await this.callService.removeParticipant(call.id, member.id);

    // Check if call should end (no participants left)
    const participants = await this.callService.getCallParticipants(call.id);

    if (participants.length === 0) {
      // If caller cancels, delete call + system messages
      if (payload.isCallerCancel) {
        try {
          await this.callService.deleteCallAndSystemMessage(call.id);
        } catch (err) {
          console.error('Failed to delete call or system messages:', err);
        }
      } else {
        // Otherwise update call to COMPLETED
        await this.callService.updateCall(call.id, {
          status: CallStatus.COMPLETED,
          endedAt: new Date(),
        });
      }

      await this.websocketNotificationService.emitToChatMembers(
        payload.chatId,
        CallEvent.END_CALL,
        { chatId: call.chat.id, endedBy: member.id, callId: call.id },
        { senderId: userId, excludeSender: false },
      );
    }

    const response: CallActionResponse = {
      callId: call.id,
      memberId: member.id,
      status: call.status,
      endedAt: call.endedAt?.toISOString(),
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
