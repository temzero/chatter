import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatMember } from './entities/chat-member.entity';
import { ChatMemberRole } from './constants/chat-member-roles.constants';
import { ChatMemberStatus } from './constants/chat-member-status.constants';
import { AppError } from '../../common/errors';

@Injectable()
export class ChatMemberService {
  constructor(
    @InjectRepository(ChatMember)
    private readonly memberRepo: Repository<ChatMember>,
  ) {}

  async findByChatId(chatId: string): Promise<ChatMember[]> {
    try {
      return await this.memberRepo.find({
        where: { chatId },
        relations: ['user', 'lastReadMessage'],
      });
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve chat members');
    }
  }

  async addMember(
    chatId: string,
    userId: string,
    role: ChatMemberRole = ChatMemberRole.MEMBER,
  ): Promise<ChatMember> {
    try {
      const newMember = this.memberRepo.create({
        chatId,
        userId,
        role,
        status: ChatMemberStatus.ACTIVE,
      });
      return await this.memberRepo.save(newMember);
    } catch (error) {
      AppError.throw(error, 'Failed to add chat member');
    }
  }

  async removeMember(chatId: string, userId: string): Promise<void> {
    try {
      const member = await this.memberRepo.findOneBy({
        chatId,
        userId,
      });

      if (!member) {
        AppError.notFound('Chat member not found');
      }

      await this.memberRepo.remove(member);
    } catch (error) {
      AppError.throw(error, 'Failed to remove chat member');
    }
  }

  async updateMember(
    chatId: string,
    userId: string,
    updates: {
      role?: ChatMemberRole;
      status?: ChatMemberStatus;
      nickname?: string | null;
      customTitle?: string | null;
      mutedUntil?: Date | null;
      lastReadMessageId?: string | null;
    },
  ): Promise<ChatMember> {
    try {
      const member = await this.memberRepo.findOneBy({
        chatId,
        userId,
      });

      if (!member) {
        AppError.notFound('Chat member not found');
      }

      if (updates.role !== undefined) member.role = updates.role;
      if (updates.status !== undefined) member.status = updates.status;
      if (updates.nickname !== undefined) member.nickname = updates.nickname;
      if (updates.customTitle !== undefined)
        member.customTitle = updates.customTitle;
      if (updates.mutedUntil !== undefined)
        member.mutedUntil = updates.mutedUntil;
      if (updates.lastReadMessageId !== undefined)
        member.lastReadMessageId = updates.lastReadMessageId;

      return await this.memberRepo.save(member);
    } catch (error) {
      AppError.throw(error, 'Failed to update chat member');
    }
  }

  async getMember(chatId: string, userId: string): Promise<ChatMember> {
    try {
      const member = await this.memberRepo.findOne({
        where: { chatId, userId },
        relations: ['user', 'lastReadMessage'],
      });

      if (!member) {
        AppError.notFound('Chat member not found');
      }

      return member;
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve chat member');
    }
  }

  async updateLastReadMessage(
    chatId: string,
    userId: string,
    messageId: string,
  ): Promise<ChatMember> {
    try {
      return await this.updateMember(chatId, userId, {
        lastReadMessageId: messageId,
      });
    } catch (error) {
      AppError.throw(error, 'Failed to update last read message');
    }
  }
}
