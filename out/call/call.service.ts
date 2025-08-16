import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call } from './entities/call.entity';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { CreateCallDto } from './dtos/create-call.dto';
import { MessageService } from '../message/message.service';
import { SystemEventType } from '../message/constants/system-event-type.constants';
import { WebsocketService } from '../websocket/websocket.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class CallService {
  constructor(
    @InjectRepository(Call)
    private readonly callRepository: Repository<Call>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepository: Repository<ChatMember>,
    private readonly messageService: MessageService,
    private readonly websocketService: WebsocketService,
    private readonly chatService: ChatService,
  ) {}

  async initiateCall(createCallDto: CreateCallDto, userId: string) {
    // Validate chat exists and user is a member
    await this.validateChatMembership(
      createCallDto.chatId,
      userId, // Use the userId parameter instead of createCallDto.userId
    );

    // Get active chat members
    const chatMembers = await this.chatMemberRepository.find({
      where: {
        chatId: createCallDto.chatId,
        status: 'active',
      },
      relations: ['user'],
    });

    // Create call record
    const call = this.callRepository.create({
      chatId: createCallDto.chatId,
      initiatorId: userId, // Use the userId parameter here
      isVideo: createCallDto.isVideo,
      isGroup: createCallDto.isGroup,
      chatMembers: chatMembers,
      startedAt: new Date(),
    });

    const savedCall = await this.callRepository.save(call);

    // Create system message
    const message = await this.messageService.createSystemEventMessage(
      createCallDto.chatId,
      userId, // Use the userId parameter here
      SystemEventType.CALL_INITIATED,
      {
        callId: savedCall.id,
        isVideo: createCallDto.isVideo,
        isGroup: createCallDto.isGroup,
      },
    );

    // Update call with message reference
    await this.callRepository.update(savedCall.id, { messageId: message.id });

    // Notify participants via WebSocket
    this.websocketService.emitToChatMembers(
      createCallDto.chatId,
      'call_initiated',
      {
        callId: savedCall.id,
        initiatorId: userId, // Use the userId parameter here
        isVideo: createCallDto.isVideo,
      },
    );

    return this.toCallResponseDto(savedCall);
  }

  async endCall(callId: string, userId: string, duration?: number) {
    const call = await this.callRepository.findOne({
      where: { id: callId },
      relations: ['chatMembers', 'chatMembers.user'],
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    // Verify user was a participant
    const isParticipant = call.chatMembers.some(
      (member) => member.user.id === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException('You were not a participant in this call');
    }

    // Update call record
    call.endedAt = new Date();
    call.duration =
      duration ||
      Math.floor((call.endedAt.getTime() - call.startedAt.getTime()) / 1000);

    const updatedCall = await this.callRepository.save(call);

    // Create system message
    await this.messageService.createSystemEventMessage(
      call.chatId,
      userId,
      SystemEventType.CALL_ENDED,
      {
        callId: call.id,
        duration: call.duration,
      },
    );

    // Notify participants
    this.websocketService.emitToChatMembers(call.chatId, 'call_ended', {
      callId: call.id,
      duration: call.duration,
    });

    return this.toCallResponseDto(updatedCall);
  }

  async getCallHistory(chatId: string, userId: string) {
    await this.validateChatMembership(chatId, userId);

    const calls = await this.callRepository.find({
      where: { chatId },
      relations: ['chatMembers', 'initiator'],
      order: { startedAt: 'DESC' },
    });

    return calls.map(this.toCallResponseDto);
  }

  async getCallDetails(callId: string, userId: string) {
    const call = await this.callRepository.findOne({
      where: { id: callId },
      relations: ['chatMembers', 'chatMembers.user', 'initiator'],
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    // Verify user was a participant
    const isParticipant = call.chatMembers.some(
      (member) => member.user.id === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException('You were not a participant in this call');
    }

    return this.toCallResponseDto(call);
  }

  async deleteCallRecord(callId: string, userId: string) {
    const call = await this.callRepository.findOne({
      where: { id: callId },
      relations: ['initiator'],
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    // Only initiator can delete
    if (call.initiator.id !== userId) {
      throw new ForbiddenException('Only call initiator can delete the record');
    }

    await this.callRepository.softDelete(callId);
    return { success: true };
  }

  private async validateChatMembership(chatId: string, userId: string) {
    const isMember = await this.chatService.isUserChatMember(chatId, userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this chat');
    }
  }

  private toCallResponseDto(call: Call) {
    return {
      id: call.id,
      chatId: call.chatId,
      initiator: call.initiator,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      duration: call.duration,
      isVideo: call.isVideo,
      isGroup: call.isGroup,
      participants: call.chatMembers.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        avatar: member.user.avatar,
      })),
      stats: call.stats,
    };
  }
}
