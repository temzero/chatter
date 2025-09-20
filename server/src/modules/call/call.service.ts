import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Call } from './entities/call.entity';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { CallStatus } from './type/callStatus';
import { ChatMemberService } from '../chat-member/chat-member.service';
import { ChatType } from '../chat/constants/chat-types.constants';

@Injectable()
export class CallService {
  constructor(
    @InjectRepository(Call)
    private readonly callRepository: Repository<Call>,
    private readonly chatMemberService: ChatMemberService,
  ) {}

  async getCallHistory(userId: string): Promise<Call[]> {
    const calls = await this.callRepository
      .createQueryBuilder('call')
      .leftJoinAndSelect('call.chat', 'chat')
      .leftJoinAndSelect('chat.members', 'chatMember')
      .leftJoinAndSelect('chatMember.user', 'chatMemberUser')
      .leftJoinAndSelect('call.initiator', 'initiator')
      .leftJoinAndSelect('initiator.user', 'initiatorUser')
      .where((qb) => {
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
              CallStatus.MISSED,
              CallStatus.FAILED,
            ],
          })
          .getQuery();
        return `call.id IN ${subQuery}`;
      })
      .orderBy('call.startedAt', 'DESC')
      .getMany();

    calls.forEach((call) => {
      const chat = call.chat;

      if (chat.type === ChatType.DIRECT) {
        const otherMember = chat.members.find((m) => m.user.id !== userId);
        if (otherMember) {
          chat.name =
            otherMember.nickname ||
            `${otherMember.user.firstName ?? ''} ${otherMember.user.lastName ?? ''}`.trim() ||
            otherMember.user.username;
          chat.avatarUrl = otherMember.user.avatarUrl || chat.avatarUrl;
        }
      } else {
        if (!chat.avatarUrl) {
          if (call.initiator?.user?.avatarUrl) {
            chat.avatarUrl = call.initiator.user.avatarUrl;
          } else if (chat.members.length > 0) {
            const memberWithAvatar = chat.members.find(
              (m) => m.user?.avatarUrl,
            );
            chat.avatarUrl =
              memberWithAvatar?.user?.avatarUrl ||
              chat.members[0].user.avatarUrl;
          }
        }
      }
    });

    return calls;
  }

  async getCallById(id: string): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id },
      relations: ['chat', 'initiator'],
    });

    if (!call) {
      throw new NotFoundException(`Call with ID ${id} not found`);
    }

    return call;
  }

  async getCallsByChatId(chatId: string): Promise<Call[]> {
    return await this.callRepository.find({
      where: { chat: { id: chatId } },
      relations: ['initiator'],
      order: { startedAt: 'DESC' },
    });
  }

  async getLastCallByChatId(chatId: string): Promise<Call | null> {
    return await this.callRepository.findOne({
      where: { chat: { id: chatId } },
      relations: ['initiator'],
      order: { startedAt: 'DESC' },
    });
  }

  async getActiveCallByChatId(chatId: string): Promise<Call | null> {
    return this.callRepository.findOne({
      where: {
        chat: { id: chatId },
        status: In([CallStatus.DIALING, CallStatus.IN_PROGRESS]),
      },
      relations: ['chat', 'initiator'],
      order: { createdAt: 'DESC' }, // get the latest active call
    });
  }

  async createCall(createCallDto: CreateCallDto): Promise<Call> {
    const initiatorMember =
      await this.chatMemberService.getMemberByChatIdAndUserId(
        createCallDto.chatId,
        createCallDto.initiatorUserId,
      );

    if (!initiatorMember) {
      throw new Error('Unauthorized: Cannot update other members');
    }

    const call = this.callRepository.create({
      status: createCallDto.status,
      chat: { id: createCallDto.chatId },
      initiator: initiatorMember,
      attendedUserIds: createCallDto.attendedUserIds || [],
    });

    const savedCall = await this.callRepository.save(call);

    if (createCallDto.status === CallStatus.DIALING) {
      const TIMEOUT_MS = 60_000;
      setTimeout(() => {
        void (async () => {
          try {
            const latestCall = await this.callRepository.findOne({
              where: { id: savedCall.id },
            });
            if (latestCall && latestCall.status === CallStatus.DIALING) {
              await this.callRepository.save({
                ...latestCall,
                status: CallStatus.MISSED,
                endedAt: new Date(),
              });
              console.log(
                `Call ${latestCall.id} marked as MISSED due to timeout`,
              );
            }
          } catch (err) {
            console.error('Failed to mark call as MISSED:', err);
          }
        })();
      }, TIMEOUT_MS);
    }

    return this.callRepository.findOneOrFail({
      where: { id: savedCall.id },
      relations: ['chat', 'initiator'],
    });
  }

  async updateCall(id: string, updateCallDto: UpdateCallDto): Promise<Call> {
    const call = await this.getCallById(id);

    if (updateCallDto.attendedUserIds) {
      const existingAttendees = new Set(call.attendedUserIds || []);
      updateCallDto.attendedUserIds.forEach((id) => existingAttendees.add(id));
      updateCallDto.attendedUserIds = Array.from(existingAttendees);
    }

    const updatedCall = this.callRepository.merge(
      call,
      updateCallDto as DeepPartial<Call>,
    );

    return await this.callRepository.save(updatedCall);
  }

  async updateCallStatus(id: string, status: CallStatus): Promise<Call> {
    const call = await this.getCallById(id);
    call.status = status;
    return await this.callRepository.save(call);
  }

  async deleteCall(id: string): Promise<void> {
    const result = await this.callRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Call with ID ${id} not found`);
    }
  }
}
