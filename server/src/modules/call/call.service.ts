import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { AccessToken, VideoGrant } from 'livekit-server-sdk';
import { Call } from './entities/call.entities';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { CallStatus } from './type/callStatus';
import { ChatMember } from '../chat-member/entities/chat-member.entity';

interface IAccessToken {
  addGrant(grant: VideoGrant): void;
  toJwt(): string;
}

interface AccessTokenOptions {
  identity: string;
  name?: string;
}

interface AccessTokenConstructor {
  new (
    apiKey?: string,
    apiSecret?: string,
    options?: AccessTokenOptions,
  ): IAccessToken;
}

@Injectable()
export class CallService {
  private readonly livekitApiKey: string;
  private readonly livekitApiSecret: string;

  constructor(
    @InjectRepository(Call)
    private readonly callRepository: Repository<Call>,
    @InjectRepository(ChatMember)
    private chatMemberRepository: Repository<ChatMember>,
  ) {
    this.livekitApiKey = process.env.LIVEKIT_API_KEY ?? 'your_api_key';
    this.livekitApiSecret = process.env.LIVEKIT_API_SECRET ?? 'your_api_secret';

    if (
      this.livekitApiKey === 'your_api_key' ||
      this.livekitApiSecret === 'your_api_secret'
    ) {
      console.warn(
        'Using default LiveKit credentials - replace with actual environment variables',
      );
    }
  }

  async createCall(createCallDto: CreateCallDto): Promise<Call> {
    const call = this.callRepository.create(createCallDto as DeepPartial<Call>);
    return await this.callRepository.save(call);
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
    if (call.status !== CallStatus.ONGOING) {
      await this.callRepository.update(id, { status: CallStatus.ONGOING });
    }

    // Return the updated call with relations
    return await this.callRepository.findOne({
      where: { id },
      relations: ['participants', 'participants.user'], // Include user data if needed
    });
  }

  async endCall(id: string): Promise<Call> {
    const call = await this.getCallById(id);

    call.status = CallStatus.ENDED;
    call.endedAt = new Date();

    return await this.callRepository.save(call);
  }

  async deleteCall(id: string): Promise<void> {
    const result = await this.callRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Call with ID ${id} not found`);
    }
  }

  generateLivekitToken(
    roomName: string,
    memberId: string,
    participantName?: string,
  ): string {
    try {
      const TokenClass = AccessToken as unknown as AccessTokenConstructor;
      const at: IAccessToken = new TokenClass(
        this.livekitApiKey,
        this.livekitApiSecret,
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

      return at.toJwt();
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to generate LiveKit token: ${err.message}`);
      }
      throw new Error('Unknown error while generating LiveKit token');
    }
  }
}
