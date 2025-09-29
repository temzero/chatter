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
import { CallService } from 'src/modules/call/call.service';
import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';

@Injectable()
export class WebsocketCallService {
  constructor(
    private readonly callStore: CallStoreService,
    private readonly chatService: ChatService,
    private readonly callService: CallService,
    private readonly chatMemberService: ChatMemberService,
    private readonly websocketNotificationService: WebsocketNotificationService,
  ) {}

  // async emitIncomingCall(
  //   callId: string,
  //   chatId: string,
  //   initiatorUserId: string,
  //   isVideoCall: boolean,
  // ) {
  //   // 1. Get chat members
  //   const chatMembers = await this.chatMemberService.getChatMembers(chatId);
  //   const otherMembers = chatMembers.filter(
  //     (m) => m.userId !== initiatorUserId,
  //   );

  //   // 2. Filter only free members
  //   const freeMembers = otherMembers.filter(
  //     (m) => !this.callStore.isUserInCall(m.userId),
  //   );

  //   if (freeMembers.length === 0) {
  //     const errorPayload: CallErrorResponse = {
  //       reason: CallError.LINE_BUSY,
  //       callId,
  //       chatId,
  //     };
  //     this.websocketNotificationService.emitToUser(
  //       initiatorUserId,
  //       CallEvent.CALL_ERROR,
  //       errorPayload,
  //     );
  //     return { success: false, reason: CallError.LINE_BUSY };
  //   }

  //   // 3. Get initiator member
  //   const initiatorMember =
  //     await this.chatMemberService.getMemberByChatIdAndUserId(
  //       chatId,
  //       initiatorUserId,
  //     );
  //   if (!initiatorMember) {
  //     return { success: false, reason: 'INITIATION_FAILED' };
  //   }

  //   // 4. Build response
  //   const response: IncomingCallResponse = {
  //     callId,
  //     chatId,
  //     status: CallStatus.DIALING,
  //     initiatorMemberId: initiatorMember.id,
  //     isVideoCall,
  //     participantsCount: 1,
  //   };

  //   console.log('🔔 Emit INCOMING CALL');
  //   // 5. Emit to free members
  //   for (const member of freeMembers) {
  //     this.websocketNotificationService.emitToUser(
  //       member.userId,
  //       CallEvent.INCOMING_CALL,
  //       response,
  //     );
  //   }

  //   return { success: true, chatId };
  // }
  async emitIncomingCall(
    callId: string,
    chatId: string,
    initiatorUserId: string,
    isVideoCall: boolean,
    isBroadcast?: boolean,
  ) {
    // 1. Get chat members
    const chatMembers = await this.chatMemberService.getChatMembers(chatId);
    // const otherMembers = chatMembers.filter(
    //   (m) => m.userId !== initiatorUserId,
    // );

    // 2. Filter only free members (not in any active call)
    const freeMembers: ChatMember[] = [];
    for (const member of chatMembers) {
      const isInCall = await this.callService.isUserInAnyActiveCall(
        member.userId,
      );
      if (!isInCall) {
        freeMembers.push(member);
      }
    }

    if (freeMembers.length === 0) {
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

    // 3. Get initiator member
    const initiatorMember =
      await this.chatMemberService.getMemberByChatIdAndUserId(
        chatId,
        initiatorUserId,
      );
    if (!initiatorMember) {
      console.log('⚠️ Initiator member not found!');
      return { success: false, reason: 'INITIATION_FAILED' };
    }

    // 4. Build response
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

    console.log('🔔 Emit INCOMING CALL to free members');

    // 5. Emit to free members
    for (const member of freeMembers) {
      console.log(`🔹 Emitting INCOMING_CALL to ${member.userId}`);
      this.websocketNotificationService.emitToUser(
        member.userId,
        CallEvent.INCOMING_CALL,
        response,
      );
    }

    // Emit to caller to sync call info
    this.websocketNotificationService.emitToUser(
      initiatorUserId,
      CallEvent.INCOMING_CALL,
      response,
    );

    return { success: true, chatId };
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
}
