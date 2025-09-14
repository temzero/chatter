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
import { ChatMemberService } from '../chat-member/chat-member.service';
import { ChatType } from '../chat/constants/chat-types.constants';

@Injectable()
export class CallService {
  private readonly livekitApiKeyName: string;
  private readonly livekitApiKeySecret: string;

  constructor(
    @InjectRepository(Call)
    private readonly callRepository: Repository<Call>,

    private readonly messageService: MessageService,
    private readonly chatMemberService: ChatMemberService, // Assume this service exists
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

  async getCallHistory(userId: string): Promise<any[]> {
    const calls = await this.callRepository
      .createQueryBuilder('call')
      .leftJoinAndSelect('call.chat', 'chat')
      .leftJoinAndSelect('chat.members', 'chatMember') // Load ALL members
      .leftJoinAndSelect('chatMember.user', 'chatMemberUser')
      .leftJoinAndSelect('call.initiator', 'initiator')
      .leftJoinAndSelect('initiator.user', 'initiatorUser')
      .leftJoinAndSelect('call.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'participantUser')
      // Remove the member filtering from here
      .where((qb) => {
        // Use subquery to find calls where the user is a member
        const subQuery = qb
          .subQuery()
          .select('call.id')
          .from(Call, 'call')
          .innerJoin('call.chat', 'chat2')
          .innerJoin('chat2.members', 'member')
          .where('member.userId = :userId', { userId })
          .andWhere('call.status IN (:...statuses)', {
            statuses: [
              CallStatus.COMPLETED,
              CallStatus.DECLINED,
              CallStatus.MISSED,
              CallStatus.FAILED,
            ],
          })
          .getQuery();
        return `call.id IN ${subQuery}`;
      })
      .orderBy('call.startedAt', 'DESC')
      .getMany();

    return calls.map((call) => {
      let chatName = call.chat.name;
      let chatAvatar = call.chat.avatarUrl;

      if (call.chat.type === ChatType.DIRECT) {
        // Now all members are loaded, so we can find the other one
        const otherMember = call.chat.members.find((m) => m.user.id !== userId);

        if (otherMember) {
          chatName =
            otherMember.nickname ||
            `${otherMember.user.firstName ?? ''} ${otherMember.user.lastName ?? ''}`.trim() ||
            otherMember.user.username;

          chatAvatar = otherMember.user.avatarUrl || chatAvatar;
        }
      } else {
        // Group chat logic remains the same
        if (!chatAvatar) {
          if (call.initiator?.user?.avatarUrl) {
            chatAvatar = call.initiator.user.avatarUrl;
          } else if (call.chat.members.length > 0) {
            const memberWithAvatar = call.chat.members.find(
              (m) => m.user?.avatarUrl,
            );
            chatAvatar =
              memberWithAvatar?.user?.avatarUrl ||
              call.chat.members[0].user.avatarUrl;
          }
        }
      }

      return {
        callId: call.id,
        chatId: call.chat.id,
        isVideoCall: call.isVideoCall,
        isGroupCall: call.isGroupCall,
        status: call.status,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
        chatName,
        chatAvatar,
      };
    });
  }

  async getPendingCalls(userId: string): Promise<Call[]> {
    return await this.callRepository.find({
      where: {
        participants: { user: { id: userId } },
        status: In([CallStatus.DIALING, CallStatus.IN_PROGRESS]),
      },
      relations: ['chat', 'initiator', 'participants', 'participants.user'],
      order: { startedAt: 'DESC' },
    });
  }

  async createCall(createCallDto: CreateCallDto): Promise<Call> {
    // Verify the member making the update is the same as the one in the payload
    const initiatorMember =
      await this.chatMemberService.getMemberByChatIdAndUserId(
        createCallDto.chatId,
        createCallDto.initiatorUserId,
      );

    if (!initiatorMember) {
      throw new Error('Unauthorized: Cannot update other members');
    }
    // save call first
    const call = this.callRepository.create({
      status: createCallDto.status,
      isVideoCall: createCallDto.isVideoCall,
      isGroupCall: createCallDto.isGroupCall,
      chat: { id: createCallDto.chatId },
      initiator: initiatorMember,
      participants: [initiatorMember],
    });

    const savedCall = await this.callRepository.save(call);

    // now system message will see it (because it's committed)
    await this.messageService.createSystemEventMessage(
      createCallDto.chatId,
      createCallDto.initiatorUserId,
      SystemEventType.CALL,
      { callId: savedCall.id },
    );

    return this.callRepository.findOneOrFail({
      where: { id: savedCall.id },
      relations: ['chat', 'initiator'],
    });
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

    // Check if participant already exists
    const exists = call.participants.some((p) => p.id === memberId);

    if (!exists) {
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

    // Return the updated call
    return await this.callRepository.findOne({
      where: { id },
      relations: ['participants', 'participants.user'],
    });
  }

  async getCallParticipants(callId: string): Promise<ChatMember[]> {
    const call = await this.callRepository.findOne({
      where: { id: callId },
      relations: ['participants'],
    });

    if (!call) {
      throw new NotFoundException(`Call with ID ${callId} not found`);
    }

    return call.participants;
  }

  async addParticipant(callId: string, member: ChatMember): Promise<Call> {
    const call = await this.getCallById(callId);

    // Check if participant is already in call
    const alreadyParticipant = call.participants.some(
      (p) => p.id === member.id,
    );
    if (alreadyParticipant) {
      return call; // no-op, return current state
    }

    // Add participant via relation
    await this.callRepository
      .createQueryBuilder()
      .relation(Call, 'participants')
      .of(call)
      .add(member.id);

    // Refresh and return updated call with participants
    const updatedCall = await this.callRepository.findOne({
      where: { id: callId },
      relations: ['chat', 'initiator', 'participants'],
    });
    if (!updatedCall) {
      throw new NotFoundException(`Call with ID ${callId} not found`);
    }
    return updatedCall;
  }

  async removeParticipant(callId: string, memberId: string): Promise<boolean> {
    const call = await this.getCallById(callId);

    // Ensure the participant is actually in the call
    const isParticipant = call.participants.some((p) => p.id === memberId);
    if (!isParticipant) {
      return false; // nothing to remove
    }

    // Remove relation
    await this.callRepository
      .createQueryBuilder()
      .relation(Call, 'participants')
      .of(call)
      .remove(memberId);

    // Refresh and return updated call
    return true;
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
