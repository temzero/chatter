import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { AccessToken, VideoGrant } from 'livekit-server-sdk';
import { Call } from './entities/call.entity';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { CallStatus } from './type/callStatus';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { MessageService } from '../message/message.service';
import { SystemEventType } from '../message/constants/system-event-type.constants';
import { Chat } from '../chat/entities/chat.entity';

@Injectable()
export class CallService {
  private readonly livekitApiKeyName: string;
  private readonly livekitApiKeySecret: string;

  constructor(
    @InjectRepository(Call)
    private readonly callRepository: Repository<Call>,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(ChatMember)
    private chatMemberRepository: Repository<ChatMember>,
    private readonly messageService: MessageService,
  ) {
    this.livekitApiKeyName = process.env.LIVEKIT_API_KEY_NAME ?? 'your_api_key';
    this.livekitApiKeySecret =
      process.env.LIVEKIT_API_KEY_SECRET ?? 'your_api_secret';

    if (
      this.livekitApiKeyName === 'your_api_key' ||
      this.livekitApiKeySecret === 'your_api_secret'
    ) {
      console.warn(
        'Using default LiveKit credentials - replace with actual environment variables',
      );
    }
  }

  async createCall(createCallDto: CreateCallDto): Promise<Call> {
    console.log('createCall data');

    // ✅ Ensure chat exists
    const chat = await this.chatRepository.findOneBy({
      id: createCallDto.chatId,
    });
    if (!chat) {
      throw new Error(`Chat not found: ${createCallDto.chatId}`);
    }

    // ✅ Ensure initiator exists
    const initiator = await this.chatMemberRepository.findOneBy({
      id: createCallDto.initiatorMemberId,
    });
    if (!initiator) {
      throw new Error(
        `ChatMember not found: ${createCallDto.initiatorMemberId}`,
      );
    }

    // ✅ Create and link relations
    const call = this.callRepository.create({
      status: createCallDto.status,
      isVideoCall: createCallDto.isVideoCall,
      isGroupCall: createCallDto.isGroupCall,
      chat,
      initiator,
    });

    const savedCall = await this.callRepository.save(call);
    console.log('savedCall', savedCall);

    // ✅ Create system message (chat and initiator are now linked)
    await this.createCallSystemMessage(
      savedCall.chat.id,
      savedCall.id,
      createCallDto.initiatorId,
    );

    return savedCall;
  }

  async getCallById(id: string): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id },
      relations: ['chat', 'initiator', 'participants'],
    });

    if (!call) {
      throw new NotFoundException(`Call with ID ${id} not found`);
    }

    return call;
  }

  async getActiveCallByChatId(chatId: string): Promise<Call | null> {
    return await this.callRepository.findOne({
      where: {
        chat: { id: chatId },
        status: In([CallStatus.DIALING, CallStatus.IN_PROGRESS]),
      },
      relations: ['chat', 'initiator', 'participants'],
      order: { startedAt: 'DESC' }, // latest one if multiple
    });
  }

  async getCallsByChatId(chatId: string): Promise<Call[]> {
    return await this.callRepository.find({
      where: { chat: { id: chatId } },
      relations: ['initiator', 'participants'],
      order: { startedAt: 'DESC' },
    });
  }

  async updateCall(id: string, updateCallDto: UpdateCallDto): Promise<Call> {
    const call = await this.getCallById(id);
    const updatedCall = this.callRepository.merge(
      call,
      updateCallDto as DeepPartial<Call>,
    );
    return await this.callRepository.save(updatedCall);
  }

  async joinCall(id: string, memberId: string): Promise<Call | null> {
    const call = await this.getCallById(id);

    // Verify the chat member exists
    const chatMember = await this.chatMemberRepository.findOne({
      where: { id: memberId },
    });

    if (!chatMember) {
      throw new NotFoundException(`ChatMember with ID ${memberId} not found`);
    }

    // Check if participant already exists
    const existingParticipant = call.participants.some(
      (participant) => participant.id === memberId,
    );

    if (!existingParticipant) {
      // Most efficient way - uses single query
      await this.callRepository
        .createQueryBuilder()
        .relation(Call, 'participants')
        .of(call)
        .add(memberId);
    }

    // Update status if needed
    if (call.status !== CallStatus.DIALING) {
      await this.callRepository.update(id, { status: CallStatus.DIALING });
    }

    // Return the updated call with relations
    return await this.callRepository.findOne({
      where: { id },
      relations: ['participants', 'participants.user'], // Include user data if needed
    });
  }

  async endCall(id: string): Promise<Call> {
    const call = await this.getCallById(id);

    call.status = CallStatus.COMPLETED;
    call.endedAt = new Date();

    return await this.callRepository.save(call);
  }

  async deleteCall(id: string): Promise<void> {
    const result = await this.callRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Call with ID ${id} not found`);
    }
  }

  async generateLivekitToken(
    roomName: string,
    memberId: string,
    participantName?: string,
  ): Promise<string> {
    try {
      const at = new AccessToken(
        this.livekitApiKeyName,
        this.livekitApiKeySecret,
        {
          identity: memberId,
          name: participantName,
        },
      );

      const grant: VideoGrant = {
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
      };

      at.addGrant(grant);

      const generatedToken = await at.toJwt();
      return generatedToken;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to generate LiveKit token: ${err.message}`);
      }
      throw new Error('Unknown error while generating LiveKit token');
    }
  }

  async createCallSystemMessage(
    chatId: string,
    callId: string,
    initiatorId: string,
  ) {
    console.log('createCallSystemMessage');

    return this.messageService.createSystemEventMessage(
      chatId,
      initiatorId,
      SystemEventType.CALL,
      {
        callId,
      },
    );
  }

  /**
   * Deletes a call and its associated system message.
   * Used when a call is cancelled.
   */
  async deleteCallAndSystemMessage(callId: string): Promise<void> {
    // 1. Find the call
    const call = await this.callRepository.findOne({
      where: { id: callId },
      relations: ['chat', 'initiator'],
    });

    if (!call) {
      throw new NotFoundException(`Call with ID ${callId} not found`);
    }

    // 2. Delete the system message(s) associated with this call
    const systemMessages = await this.messageService.messageRepo.find({
      where: {
        call: { id: callId },
        systemEvent: SystemEventType.CALL,
      },
    });

    if (systemMessages.length > 0) {
      const systemMessageIds = systemMessages.map((m) => m.id);
      await this.messageService.messageRepo.delete(systemMessageIds);
    }

    // 3. Delete the call itself
    const result = await this.callRepository.delete(callId);

    if (result.affected === 0) {
      throw new NotFoundException(
        `Call with ID ${callId} could not be deleted`,
      );
    }
  }
}
