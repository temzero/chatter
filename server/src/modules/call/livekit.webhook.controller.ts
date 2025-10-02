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
import { Call } from './entities/call.entity';
import { Chat } from '../chat/entities/chat.entity';
import { User } from '../user/entities/user.entity';

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
  // Participant Joined
  // ----------------------
  private async handleParticipantJoined(roomName: string, userId?: string) {
    if (!userId) {
      console.log('[participant_joined] No participant identity found');
      return;
    }

    const call = await this.callService.getActiveCallByChatId(roomName);
    const chat = call?.chat ?? (await this.chatService.getChatById(roomName));
    const isBroadcast = chat.type === ChatType.CHANNEL;
    const user = await this.userService.getUserById(userId);

    if (!user) return;

    // Common logic: Handle call creation and participant addition
    if (!call) {
      await this.handleNewCall(roomName, user, chat, isBroadcast);
    } else {
      await this.handleExistingCall(call, user, roomName, isBroadcast);
    }
  }

  private async handleNewCall(
    roomName: string,
    user: User,
    chat: Chat,
    isBroadcast: boolean,
  ) {
    const call = await this.callService.createCall({
      chatId: roomName,
      status: isBroadcast ? CallStatus.IN_PROGRESS : CallStatus.DIALING,
      initiatorUser: user,
      ...(isBroadcast && { startedAt: new Date() }),
    });

    // Always emit incoming call first
    await this.websocketCallService.emitIncomingCall(
      call.id,
      roomName,
      user.id,
      chat.type === ChatType.GROUP,
      isBroadcast,
    );

    // Start call immediately for broadcast, otherwise wait for participants
    if (isBroadcast) {
      await this.websocketCallService.emitStartCall(call.id, roomName, user.id);
    }
  }

  private async handleExistingCall(
    call: Call,
    user: User,
    roomName: string,
    isBroadcast: boolean,
  ) {
    const existingUserIds = new Set(call.currentUserIds);

    // Common logic: Add participant if not already in call
    if (!existingUserIds.has(user.id)) {
      call.attendedUsers.push(user);
      call.currentUserIds.push(user.id);

      if (isBroadcast) {
        // For broadcast, just save the call with new participant
        await this.callService.saveCall(call);
      } else {
        // For normal calls, start when second participant joins
        if (call.attendedUsers.length === 2) {
          call.status = CallStatus.IN_PROGRESS;
          call.startedAt = new Date();

          await this.websocketCallService.emitStartCall(
            call.id,
            roomName,
            call.currentUserIds[0],
          );
        }
        await this.callService.saveCall(call);
      }
    } else {
      console.log(
        `[participant_joined] Participant ${user.id} already in call ${call.id}`,
      );
    }
  }

  // ----------------------
  // Participant Left
  // ----------------------
  private async handleParticipantLeft(roomName: string, userId?: string) {
    if (!userId) return;

    const call = await this.callService.getActiveCallByChatId(roomName);
    if (!call) return;

    const chat = call.chat ?? (await this.chatService.getChatById(roomName));
    const isBroadcast = chat.type === ChatType.CHANNEL;

    // Remove user from current participants
    await this.callService.removeCurrentUserId(roomName, userId);

    if (isBroadcast) {
      await this.handleBroadcastParticipantLeft(call, userId, roomName);
    } else {
      await this.handleNormalCallParticipantLeft(call, userId, roomName);
    }
  }

  private async handleBroadcastParticipantLeft(
    call: Call,
    userId: string,
    roomName: string,
  ) {
    // End broadcast only if initiator leaves
    if (call.attendedUsers[0]?.id === userId) {
      await this.endCall(call, roomName, CallStatus.COMPLETED, userId);
    }
  }

  private async handleNormalCallParticipantLeft(
    call: Call,
    userId: string,
    roomName: string,
  ) {
    const remainingUsers =
      call.currentUserIds?.filter((id) => id !== userId) ?? [];

    // End call if 1 or fewer participants remain
    if (remainingUsers.length <= 1) {
      const attendeeCount = call.attendedUsers?.length ?? 0;
      const status =
        attendeeCount <= 1 ? CallStatus.MISSED : CallStatus.COMPLETED;

      await this.endCall(call, roomName, status, userId);
    }
  }

  private async endCall(
    call: Call,
    roomName: string,
    status: CallStatus,
    userId: string,
  ) {
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

  // ----------------------
  // Room Finished
  // ----------------------
  private async handleRoomFinished(roomName: string) {
    console.log('[room_finished] Room:', roomName);
    await this.callService.cleanUpPendingCalls(roomName);
  }
}
