import { Injectable } from '@nestjs/common';
import { CallStoreService } from './call-store.service ';
import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
import { WebsocketNotificationService } from './websocket-notification.service';
import {
  CallError,
  CallErrorResponse,
  IncomingCallResponse,
  UpdateCallPayload,
} from '../constants/callPayload.type';
import { CallEvent } from '../constants/websocket-events';
import { CallStatus } from 'src/modules/call/type/callStatus';
import { ChatService } from 'src/modules/chat/chat.service';

@Injectable()
export class WebsocketCallService {
  constructor(
    private readonly callStore: CallStoreService,
    private readonly chatService: ChatService,
    private readonly chatMemberService: ChatMemberService,
    private readonly websocketNotificationService: WebsocketNotificationService,
  ) {}

  async emitIncomingCall(
    callId: string,
    chatId: string,
    initiatorUserId: string,
    isVideoCall: boolean,
  ) {
    // 1. Get chat members
    const chatMembers = await this.chatMemberService.getChatMembers(chatId);
    const otherMembers = chatMembers.filter(
      (m) => m.userId !== initiatorUserId,
    );

    // 2. Filter only free members
    const freeMembers = otherMembers.filter(
      (m) => !this.callStore.isUserInCall(m.userId),
    );
    if (freeMembers.length === 0) {
      const errorPayload: CallErrorResponse = {
        reason: CallError.LINE_BUSY,
        callId,
        chatId,
      };
      this.websocketNotificationService.emitToUser(
        initiatorUserId,
        CallEvent.CALL_ERROR,
        errorPayload,
      );
      return { success: false, reason: CallError.LINE_BUSY };
    }

    // 3. Get initiator member
    const initiatorMember =
      await this.chatMemberService.getMemberByChatIdAndUserId(
        chatId,
        initiatorUserId,
      );
    if (!initiatorMember) {
      return { success: false, reason: 'INITIATION_FAILED' };
    }

    // 4. Build response
    const response: IncomingCallResponse = {
      callId,
      chatId,
      status: CallStatus.DIALING,
      initiatorMemberId: initiatorMember.id,
      isVideoCall,
      participantsCount: 1,
    };

    console.log('🔔 Emit INCOMING CALL');
    // 5. Emit to free members
    for (const member of freeMembers) {
      this.websocketNotificationService.emitToUser(
        member.userId,
        CallEvent.INCOMING_CALL,
        response,
      );
    }

    return { success: true, chatId };
  }

  async emitUpdateCall(
    callId: string,
    chatId: string,
    callStatus: CallStatus,
    senderId: string,
  ) {
    const updateCallResponse: UpdateCallPayload = {
      callId,
      chatId,
      callStatus,
    };

    console.log('🔔 Emit UPDATE CALL');

    await this.websocketNotificationService.emitToChatMembers(
      chatId,
      CallEvent.UPDATE_CALL,
      updateCallResponse,
      { senderId, excludeSender: false },
    );
  }

  async emitEndedCall(
    callId: string,
    chatId: string,
    callStatus: CallStatus.MISSED | CallStatus.COMPLETED,
    endedAt: Date,
  ) {
    const endCallResponse: UpdateCallPayload = {
      callId,
      chatId,
      callStatus,
      endedAt: endedAt.toISOString(),
    };
    console.log('🔔 Emit END CALL');
    await this.websocketNotificationService.emitToChatMembers(
      chatId,
      CallEvent.UPDATE_CALL,
      endCallResponse,
    );
  }
}
