import { Injectable } from '@nestjs/common';
import { ChatMemberService } from '@/modules/chat-member/chat-member.service';
import { WebsocketNotificationService } from './websocket-notification.service';
import {
  CallError,
  CallErrorResponse,
  IncomingCallResponse,
  UpdateCallPayload,
} from '@shared/types/call';
import { CallEvent } from '@shared/types/enums/websocket-events.enum';
import { CallStatus } from '@shared/types/call';
import { CallService } from '@/modules/call/call.service';

@Injectable()
export class WebsocketCallService {
  constructor(
    private readonly callService: CallService,
    private readonly chatMemberService: ChatMemberService,
    private readonly websocketNotificationService: WebsocketNotificationService,
  ) {}

  async emitIncomingCall(
    callId: string,
    chatId: string,
    initiatorUserId: string,
    isVideoCall: boolean,
    isBroadcast?: boolean,
  ) {
    // 1. Get initiator member
    const initiatorMember =
      await this.chatMemberService.getMemberByChatIdAndUserId(
        chatId,
        initiatorUserId,
      );

    if (!initiatorMember) {
      console.log('⚠️ Initiator member not found!');
      return { success: false, reason: 'INITIATION_FAILED' };
    }

    // 2. Check if any member is free
    const freeMembersCount = await this.getAvailableMembersCount(
      chatId,
      initiatorUserId,
    );

    if (freeMembersCount === 0) {
      console.log(
        '⚠️ No free members available, sending CALL_ERROR to initiator',
      );
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

    // 3. Build response
    const response: IncomingCallResponse = {
      callId,
      chatId,
      status: CallStatus.DIALING,
      initiatorMemberId: initiatorMember.id,
      initiatorUserId,
      isVideoCall,
      isBroadcast,
      participantsCount: 1,
    };

    console.log(`🔔 Emit INCOMING CALL to chat members (initiator included)`);

    // 4. Emit using the unified method
    await this.websocketNotificationService.emitToChatMembers(
      chatId,
      CallEvent.INCOMING_CALL,
      response,
      {
        senderId: initiatorUserId,
        excludeSender: false, // Include initiator for sync
      },
    );

    return { success: true, chatId, availableMembersCount: freeMembersCount };
  }

  async emitStartCall(callId: string, chatId: string, initiatorUserId: string) {
    const response: UpdateCallPayload = {
      callId,
      chatId,
      initiatorUserId,
    };

    console.log('🔔 Emit START CALL');
    await this.websocketNotificationService.emitToChatMembers(
      chatId,
      CallEvent.START_CALL,
      response,
    );
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
    callStatus: CallStatus,
    senderId: string,
  ) {
    const endCallResponse: UpdateCallPayload = {
      callId,
      chatId,
      callStatus,
    };
    console.log('🔔 Emit END CALL');
    await this.websocketNotificationService.emitToChatMembers(
      chatId,
      CallEvent.CALL_ENDED,
      endCallResponse,
      { senderId },
    );
  }

  // Helper method to check available members count
  private async getAvailableMembersCount(
    chatId: string,
    excludeUserId?: string,
  ): Promise<number> {
    const chatMembers = await this.chatMemberService.getChatMembers(chatId);
    let freeCount = 0;

    for (const member of chatMembers) {
      if (excludeUserId && member.userId === excludeUserId) continue;

      const isInCall = await this.callService.isUserInAnyActiveCall(
        member.userId,
      );
      if (!isInCall) freeCount++;
    }

    return freeCount;
  }
}
