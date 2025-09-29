import { Controller, Post, Body } from '@nestjs/common';
import { CallService } from './call.service';
import { CallStatus } from './type/callStatus';
import { MessageService } from '../message/message.service';
import { SystemEventType } from '../message/constants/system-event-type.constants';
import { WebsocketCallService } from '../websocket/services/websocket-call.service';
import { ValidateWebhookPipe } from 'src/common/pipes/validate-webhook.pipe';
import { ChatType } from '../chat/constants/chat-types.constants';
import { LiveKitService } from './liveKit.service';
import { LiveKitWebhookPayload } from '../websocket/constants/LiveKitWebhookPayload.type';
import { UserService } from '../user/user.service';
import { ChatService } from '../chat/chat.service';

@Controller('liveKit/webhook')
export class LiveKitWebhookController {
  constructor(
    private readonly liveKitService: LiveKitService,
    private readonly callService: CallService,
    private readonly messageService: MessageService,
    private readonly websocketCallService: WebsocketCallService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {}

  @Post()
  async handleWebhook(
    @Body(ValidateWebhookPipe) payload: LiveKitWebhookPayload,
  ) {
    const roomName = payload.room?.name;
    if (!roomName) {
      console.warn('[Webhook] No room info in payload:', payload);
      return;
    }

    switch (payload.event) {
      case 'room_started':
        console.log('[room_started] Room:', roomName);
        break;

      case 'participant_joined':
        await this.handleParticipantJoined(
          roomName,
          payload.participant?.identity,
        );
        break;

      case 'participant_left':
        await this.handleParticipantLeft(
          roomName,
          payload.participant?.identity,
        );
        break;

      case 'track_published':
        break;

      case 'track_unpublished':
        break;

      case 'room_finished':
        await this.handleRoomFinished(roomName);
        break;

      default:
        console.log('[Webhook] Unknown event:', payload.event);
        break;
    }
  }

  // ----------------------
  // Private event handlers
  // ----------------------
  private async handleParticipantJoined(roomName: string, userId?: string) {
    if (!userId) {
      console.log('[participant_joined] No participant identity found');
      return;
    }

    let call = await this.callService.getActiveCallByChatId(roomName);
    const chat = call?.chat ?? (await this.chatService.getChatById(roomName));
    console.log('[participant_joined] Existing call:', call ? call.id : 'None');

    const user = await this.userService.getUserById(userId); // fetch User entity
    if (!user) {
      console.log('[participant_joined] User not found');
      return;
    }

    const isBroadcast = chat.type === ChatType.CHANNEL;
    console.log('isBroadcast', isBroadcast);

    if (!call) {
      call = await this.callService.createCall({
        chatId: roomName,
        status: isBroadcast ? CallStatus.IN_PROGRESS : CallStatus.DIALING,
        initiatorUser: user,
        startedAt: isBroadcast ? new Date() : undefined,
      });

      // normal call -> emit incoming call
      const isVideoCall = call.chat?.type === ChatType.GROUP;
      await this.websocketCallService.emitIncomingCall(
        call.id,
        roomName,
        userId,
        isVideoCall,
        isBroadcast,
      );

      if (isBroadcast) {
        await this.websocketCallService.emitStartCall(
          call.id,
          roomName,
          userId,
        );
      }
      // broadcast -> directly start call
    } else {
      const existingAttendees = new Set(call.attendedUsers.map((u) => u.id));
      const isNewUser = !existingAttendees.has(userId);

      if (isNewUser) {
        call.attendedUsers.push(user);

        if (call.attendedUsers.length === 2 && !isBroadcast) {
          // first other participant joined
          call.status = CallStatus.IN_PROGRESS;
          call.startedAt = new Date();
        }

        if (!call.currentUserIds.includes(userId)) {
          call.currentUserIds.push(userId);
        }

        await this.callService.saveCall(call);

        if (call.status === CallStatus.IN_PROGRESS) {
          await this.websocketCallService.emitStartCall(
            call.id,
            roomName,
            call.currentUserIds[0],
          );
        }
      } else {
        console.log(
          `[participant_joined] Participant ${userId} already in call ${call.id}`,
        );
      }
    }
  }

  private async handleParticipantLeft(roomName: string, userId?: string) {
    if (!userId) return;

    const call = await this.callService.getActiveCallByChatId(roomName);
    if (!call) return;

    const chat = call.chat ?? (await this.chatService.getChatById(roomName));
    const isChannel = chat.type === ChatType.CHANNEL;

    // remove the user from the "currently in room" list
    await this.callService.removeCurrentUserId(roomName, userId);

    const remainingUsers =
      call.currentUserIds?.filter((id) => id !== userId) ?? [];

    let shouldEndCall = false;
    let status: CallStatus = CallStatus.COMPLETED;

    if (isChannel && call.attendedUsers[0].id === userId) {
      // channel + initiator left -> end immediately
      shouldEndCall = true;
      status = CallStatus.COMPLETED;
    } else if (remainingUsers.length <= 1) {
      // normal end conditions
      const attendeeCount = call.attendedUsers?.length ?? 0;
      shouldEndCall = true;
      status = attendeeCount <= 1 ? CallStatus.MISSED : CallStatus.COMPLETED;
    }

    if (shouldEndCall) {
      const endedAt = new Date();
      const updatedCall = await this.callService.updateCall(call.id, {
        status,
        endedAt,
        currentUserIds: [],
      });

      await this.websocketCallService.emitEndedCall(
        call.id,
        roomName,
        status,
        userId,
      );

      const sender = call.attendedUsers?.[0];
      if (sender) {
        await this.messageService.createSystemEventMessage(
          call.chat.id,
          sender.id,
          SystemEventType.CALL,
          { call: updatedCall },
        );
      }

      await this.liveKitService.deleteRoom(roomName);
    }
  }

  private async handleRoomFinished(roomName: string) {
    console.log('[room_finished] Room:', roomName);
    await this.callService.cleanUpPendingCalls(roomName);
  }
}
