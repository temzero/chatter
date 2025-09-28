import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Call } from './entities/call.entity';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { CallStatus } from './type/callStatus';
import { ChatMemberService } from '../chat-member/chat-member.service';
import { CallResponseDto } from './dto/call-response.dto';
import { mapChatMemberToResponseDto } from '../chat-member/mappers/chat-member.mapper';
import { UserService } from '../user/user.service';

@Injectable()
export class CallService {
  constructor(
    @InjectRepository(Call)
    private readonly callRepository: Repository<Call>,
    private readonly chatMemberService: ChatMemberService,
    private readonly userService: UserService,
  ) {}

  async getCallHistory(
    userId: string,
    options: { limit?: number; offset?: number } = { limit: 20, offset: 0 },
  ): Promise<{ calls: CallResponseDto[]; hasMore: boolean }> {
    const { limit = 20, offset = 0 } = options;

    console.log('limit-offset', limit, offset);

    const query = this.callRepository
      .createQueryBuilder('call')
      .leftJoinAndSelect('call.chat', 'chat')
      .leftJoinAndSelect('call.initiator', 'initiator')
      .leftJoinAndSelect('initiator.user', 'initiatorUser')
      .leftJoinAndSelect('call.attendedUsers', 'attendedUser')
      .where('attendedUser.id = :userId', { userId })
      .andWhere('call.status IN (:...statuses)', {
        statuses: [CallStatus.COMPLETED, CallStatus.MISSED, CallStatus.FAILED],
      })
      .orderBy('call.createdAt', 'DESC')
      // Pagination
      .skip(offset)
      .take(limit + 1);

    const calls = await query.getMany();
    console.log('calls', calls.length);

    let hasMore = false;
    if (calls.length > limit) {
      hasMore = true;
      calls.pop();
    }

    // Map to DTOs
    const callDtos: CallResponseDto[] = calls.map((call) => {
      const dto = new CallResponseDto();
      dto.id = call.id;
      dto.chat = call.chat;
      dto.status = call.status;
      dto.isVideoCall = false;
      dto.startedAt = call.startedAt ?? null;
      dto.endedAt = call.endedAt ?? null;
      dto.updatedAt = call.updatedAt ?? null;
      dto.createdAt = call.createdAt;
      dto.initiator = mapChatMemberToResponseDto(
        call.initiator,
        call.chat.type,
      );

      if (!dto.chat.avatarUrl) {
        dto.chat.avatarUrl = call.initiator?.user?.avatarUrl || null;
      }

      return dto;
    });

    return { calls: callDtos, hasMore };
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
      relations: ['chat', 'initiator', 'attendedUsers'],
      order: { createdAt: 'DESC' }, // get the latest active call
    });
  }

  async getActiveCallIdByChatId(chatId: string): Promise<string | null> {
    const call = await this.callRepository.findOne({
      where: {
        chat: { id: chatId },
        status: In([CallStatus.DIALING, CallStatus.IN_PROGRESS]),
      },
      order: { createdAt: 'DESC' }, // latest active call
      select: ['id', 'createdAt'],
    });

    return call?.id ?? null;
  }

  async createCall(createCallDto: CreateCallDto): Promise<Call> {
    const initiatorMember =
      await this.chatMemberService.getMemberByChatIdAndUserId(
        createCallDto.chatId,
        createCallDto.initiatorUser.id,
      );

    if (!initiatorMember) {
      throw new Error('Unauthorized: Cannot create call for other members');
    }

    const call = this.callRepository.create({
      status: createCallDto.status,
      chat: { id: createCallDto.chatId },
      initiator: initiatorMember,
      attendedUsers: [createCallDto.initiatorUser], // Link to User entity
      currentUserIds: [createCallDto.initiatorUser.id],
    });

    const savedCall = await this.callRepository.save(call);

    return this.callRepository.findOneOrFail({
      where: { id: savedCall.id },
      relations: ['chat', 'initiator', 'attendedUsers'],
    });
  }

  async updateCall(
    id: string,
    updateCallDto: UpdateCallDto,
  ): Promise<Call | undefined> {
    console.log('Update call');
    const call = await this.getCallById(id);
    if (!call) {
      console.log('No call to update');
      return;
    }

    // Handle attendedUserIds -> attendedUsers
    if (updateCallDto.attendedUserIds?.length) {
      // Fetch User entities for each ID
      const users = await Promise.all(
        updateCallDto.attendedUserIds.map((id) =>
          this.userService.getUserById(id),
        ),
      );

      // Merge with existing attendedUsers
      const existing = new Map(call.attendedUsers.map((u) => [u.id, u]));
      users.forEach((u) => existing.set(u.id, u));
      call.attendedUsers = Array.from(existing.values());
    }

    // Merge other fields from DTO
    const updatedCall = this.callRepository.merge(call, {
      status: updateCallDto.status,
      startedAt: updateCallDto.startedAt,
      endedAt: updateCallDto.endedAt,
      currentUserIds: updateCallDto.currentUserIds ?? call.currentUserIds,
      // keep isVideoCall or duration if you use them in entity
    } as DeepPartial<Call>);

    return await this.callRepository.save(updatedCall);
  }

  async updateCallStatus(id: string, status: CallStatus): Promise<Call> {
    const call = await this.getCallById(id);
    call.status = status;
    return await this.callRepository.save(call);
  }

  async removeCurrentUserId(chatId: string, userId: string): Promise<Call> {
    // 1. Get active call by ID or roomName
    const call = await this.getActiveCallByChatId(chatId);

    if (!call) {
      throw new NotFoundException(`Active call not found for ${chatId}`);
    }

    // 2. Remove user from currentUserIds
    const updatedCurrent = new Set(call.currentUserIds || []);
    if (!updatedCurrent.has(userId)) {
      // User not in call, nothing to do
      return call;
    }
    updatedCurrent.delete(userId);

    // 3. Update the call entity
    call.currentUserIds = Array.from(updatedCurrent);
    return await this.callRepository.save(call);
  }

  async isUserInCall(chatId: string, userId: string): Promise<boolean> {
    const call = await this.callRepository
      .createQueryBuilder('call')
      .where('call.chat_id = :chatId', { chatId })
      .andWhere('call.status IN (:...statuses)', {
        statuses: [CallStatus.DIALING, CallStatus.IN_PROGRESS],
      })
      .andWhere(':userId = ANY(call.currentUserIds)', { userId })
      .getOne();

    return !!call;
  }

  async isUserInAnyActiveCall(userId: string): Promise<boolean> {
    const call = await this.callRepository
      .createQueryBuilder('call')
      .where('call.status IN (:...statuses)', {
        statuses: [CallStatus.DIALING, CallStatus.IN_PROGRESS],
      })
      .andWhere(':userId = ANY(call.currentUserIds)', { userId })
      .getOne();

    return !!call;
  }

  async cleanUpPendingCalls(chatId: string): Promise<void> {
    const activeCalls = await this.callRepository.find({
      where: {
        chat: { id: chatId },
        status: In([CallStatus.DIALING, CallStatus.IN_PROGRESS]),
      },
      relations: ['attendedUsers'], // ensure users are loaded
    });

    if (!activeCalls || activeCalls.length === 0) {
      console.log(`[cleanUpPendingCalls] No pending calls for chat ${chatId}`);
      return;
    }

    for (const call of activeCalls) {
      // Delete if call has no attendees or just initiator
      const attendeeCount = call.attendedUsers?.length ?? 0;
      const shouldDelete = attendeeCount <= 1;

      if (shouldDelete) {
        await this.deleteCall(call.id);
        console.log(
          `[cleanUpPendingCalls] Deleted call ${call.id} for chat ${chatId} (attendees: ${attendeeCount})`,
        );
      } else {
        console.log(
          `[cleanUpPendingCalls] Keeping call ${call.id} for chat ${chatId} (attendees: ${attendeeCount})`,
        );
      }
    }
  }

  async saveCall(call: Call): Promise<Call> {
    return await this.callRepository.save(call);
  }

  async deleteCall(id: string): Promise<void> {
    const result = await this.callRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Call with ID ${id} not found`);
    }
  }
}
