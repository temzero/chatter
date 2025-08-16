import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  MoreThan,
  LessThan,
  IsNull,
} from 'typeorm';
import { Call } from '../entities/call.entity';
import { ChatMember } from '../../chat-member/entities/chat-member.entity';

@Injectable()
export class CallRepository {
  constructor(
    @InjectRepository(Call)
    private readonly repository: Repository<Call>,
  ) {}

  async createCall(createData: {
    chatId: string;
    initiatorId: string;
    isVideo: boolean;
    isGroup: boolean;
    chatMembers: ChatMember[];
  }): Promise<Call> {
    const call = this.repository.create({
      ...createData,
      startedAt: new Date(),
    });
    return this.repository.save(call);
  }

  async findActiveCallByChat(chatId: string): Promise<Call | null> {
    return this.repository.findOne({
      where: {
        chatId,
        endedAt: IsNull(),
      },
      relations: ['chatMembers', 'chatMembers.user', 'initiator'],
    });
  }

  async findById(id: string): Promise<Call | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['chatMembers', 'chatMembers.user', 'initiator'],
    });
  }

  async endCall(id: string, duration?: number): Promise<Call> {
    const call = await this.repository.findOneBy({ id });
    if (!call) {
      throw new Error('Call not found');
    }

    call.endedAt = new Date();
    call.duration =
      duration ||
      Math.floor((call.endedAt.getTime() - call.startedAt.getTime()) / 1000);

    return this.repository.save(call);
  }

  async getCallHistory(
    chatId: string,
    options?: {
      limit?: number;
      fromDate?: Date;
      toDate?: Date;
    },
  ): Promise<Call[]> {
    const where: FindOptionsWhere<Call> = { chatId };

    if (options?.fromDate) {
      where.startedAt = MoreThan(options.fromDate);
    }

    if (options?.toDate) {
      where.startedAt = LessThan(options.toDate);
    }

    return this.repository.find({
      where,
      relations: ['chatMembers', 'chatMembers.user', 'initiator'],
      order: { startedAt: 'DESC' },
      take: options?.limit,
    });
  }

  async getUserCalls(
    userId: string,
    options?: {
      limit?: number;
      onlyActive?: boolean;
    },
  ): Promise<Call[]> {
    const query = this.repository
      .createQueryBuilder('call')
      .innerJoin('call.chatMembers', 'chatMember')
      .innerJoin('chatMember.user', 'user', 'user.id = :userId', { userId })
      .leftJoinAndSelect('call.initiator', 'initiator')
      .leftJoinAndSelect('call.chatMembers', 'allChatMembers')
      .leftJoinAndSelect('allChatMembers.user', 'chatMemberUser');

    if (options?.onlyActive) {
      query.andWhere('call.endedAt IS NULL');
    }

    if (options?.limit) {
      query.take(options.limit);
    }

    return query.orderBy('call.startedAt', 'DESC').getMany();
  }

  async updateCallStats(
    id: string,
    stats: {
      packetsLost?: number;
      jitter?: number;
      rtt?: number;
    },
  ): Promise<void> {
    await this.repository.update(id, { stats });
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.repository.restore(id);
  }
}
