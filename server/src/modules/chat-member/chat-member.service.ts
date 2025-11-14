import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';

import { ChatMember } from './entities/chat-member.entity';
import { ErrorResponse } from '../../common/api-response/errors';
import { UpdateChatMemberDto } from './dto/requests/update-chat-member.dto';
import { User } from '../user/entities/user.entity';
import { Chat } from '../chat/entities/chat.entity';
import { ChatMemberResponseDto } from './dto/responses/chat-member-response.dto';
import { mapChatMemberToChatMemberResDto } from './mappers/chat-member.mapper';
import { ChatType } from 'src/shared/types/enums/chat-type.enum';
import { FriendshipStatus } from 'src/shared/types/enums/friendship-type.enum';
import { ChatMemberStatus } from 'src/shared/types/enums/chat-member-status.enum';
import { PaginationQuery } from 'src/shared/types/queries/pagination-query';
import {
  BadRequestError,
  NotFoundError,
} from 'src/shared/types/enums/error-message.enum';

export const MAX_PINNED = 99;

@Injectable()
export class ChatMemberService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatMember)
    private readonly memberRepo: Repository<ChatMember>,
  ) {}

  async findById(memberId: string): Promise<ChatMember> {
    try {
      const member = await this.memberRepo.findOne({
        where: { id: memberId },
        relations: ['user'],
      });

      if (!member) {
        ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);
      }

      return member;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve chat member by ID');
    }
  }

  async findByChatId(chatId: string): Promise<ChatMember[]> {
    try {
      return await this.memberRepo.find({
        where: { chatId },
        relations: ['user'],
      });
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve chat members');
    }
  }

  async getMemberId(userId: string, chatId: string): Promise<string> {
    try {
      const member = await this.memberRepo.findOne({
        where: { chatId, userId },
        select: ['id'],
      });

      if (!member) {
        ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);
      }

      return member.id;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to get member ID');
    }
  }

  async getChatIdsByUserId(userId: string): Promise<string[]> {
    try {
      const memberships = await this.memberRepo.find({
        where: { userId, deletedAt: IsNull() },
        select: ['chatId'],
      });

      if (!memberships || memberships.length === 0) {
        return [];
      }

      return memberships.map((m) => m.chatId);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve chat IDs by user');
    }
  }

  async findByChatIdWithBlockStatus(
    chatId: string,
    currentUserId: string,
    queryParams: PaginationQuery,
  ): Promise<{
    items: ChatMemberResponseDto[];
    hasMore: boolean;
  }> {
    const { limit = 20, offset = 0, lastId } = queryParams;

    // Get chat to determine type
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      select: ['id', 'type'], // Only select what we need
    });
    if (!chat) {
      ErrorResponse.notFound(NotFoundError.CHAT_NOT_FOUND);
    }
    const chatType: ChatType = chat.type;

    const queryBuilder = this.memberRepo
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoin(
        'block',
        'block1',
        'block1.blockerId = :currentUserId AND block1.blockedId = member.userId',
        { currentUserId },
      )
      .leftJoin(
        'block',
        'block2',
        'block2.blockerId = member.userId AND block2.blockedId = :currentUserId',
        { currentUserId },
      )
      .leftJoin(
        'friendship',
        'friendship',
        '(friendship.sender_id = :currentUserId AND friendship.receiver_id = member.user_id) OR ' +
          '(friendship.sender_id = member.user_id AND friendship.receiver_id = :currentUserId)',
        { currentUserId },
      )
      .addSelect([
        'block1.id AS block1_id',
        'block2.id AS block2_id',
        'friendship.sender_status AS sender_status',
        'friendship.receiver_status AS receiver_status',
      ])
      .where('member.chatId = :chatId AND member.deletedAt IS NULL', { chatId })
      .orderBy('member.createdAt', 'DESC')
      .skip(offset)
      .take(limit + 1); // Get one extra to check hasMore

    // Optional: lastId-based pagination for better performance
    if (lastId) {
      const lastMember = await this.memberRepo.findOne({
        where: { id: lastId },
        select: ['createdAt'],
      });
      if (lastMember) {
        queryBuilder.andWhere('member.createdAt < :lastCreatedAt', {
          lastCreatedAt: lastMember.createdAt,
        });
      }
    }

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    // Check if there are more results
    const hasMore = entities.length > limit;
    if (hasMore) {
      entities.pop(); // Remove the extra item
      raw.pop();
    }

    type RawType = {
      block1_id?: string | null;
      block2_id?: string | null;
      sender_status?: string | null;
      receiver_status?: string | null;
    };

    const items = entities.map((member, i) => {
      const row = raw[i] as RawType;
      const isBlockedByMe = !!row?.block1_id;
      const isBlockedMe = !!row?.block2_id;

      let friendshipStatus: FriendshipStatus | null = null;
      if (row?.sender_status && row?.receiver_status) {
        if (member.userId === currentUserId) {
          friendshipStatus = row.sender_status as FriendshipStatus;
        } else {
          friendshipStatus = row.receiver_status as FriendshipStatus;
        }
      }

      return mapChatMemberToChatMemberResDto(
        member,
        chatType,
        isBlockedByMe,
        isBlockedMe,
        friendshipStatus,
      );
    });

    return { items, hasMore };
  }

  async isMemberExists(chatId: string, userId: string): Promise<boolean> {
    try {
      const count = await this.memberRepo.count({
        where: { chatId, userId, deletedAt: IsNull() },
      });
      return count > 0;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to check member existence');
    }
  }

  async getMemberByChatIdAndUserId(
    chatId: string,
    userId: string,
  ): Promise<ChatMember> {
    try {
      const member = await this.memberRepo.findOne({
        where: { chatId, userId },
        relations: ['user'],
      });

      if (!member) {
        ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);
      }

      return member;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve chat member');
    }
  }

  async getChatMemberId(chatId: string, userId: string): Promise<string> {
    try {
      const member = await this.memberRepo.findOne({
        where: { chatId, userId },
        select: ['id'], // We only need the ID
      });

      if (!member) {
        ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);
      }

      return member.id;
    } catch (error) {
      ErrorResponse.throw(
        error,
        'Failed to retrieve chat member ID from user ID',
      );
    }
  }

  async getChatMembers(chatId: string): Promise<ChatMember[]> {
    try {
      const members = await this.memberRepo.find({
        where: { chatId },
        relations: ['user'],
      });

      if (!members || members.length === 0) {
        ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);
      }

      return members;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve chat members');
    }
  }

  async getAllMemberUserIds(chatId: string): Promise<string[]> {
    try {
      const members = await this.memberRepo.find({
        where: { chatId },
        select: ['userId'], // Select only the userId field
      });

      if (!members || members.length === 0) {
        ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);
      }

      return members.map((member) => member.userId);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve chat members');
    }
  }

  async getMemberUserIdsAndMuteStatus(
    chatId: string,
  ): Promise<Array<{ userId: string; isMuted: boolean }>> {
    try {
      const members = await this.memberRepo.find({
        where: { chatId, deletedAt: IsNull() },
        select: ['userId', 'mutedUntil'],
      });

      if (!members || members.length === 0) {
        ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);
      }

      return members.map((member) => ({
        userId: member.userId,
        isMuted: member.mutedUntil
          ? new Date(member.mutedUntil) > new Date()
          : false,
      }));
    } catch (error) {
      ErrorResponse.throw(
        error,
        'Failed to retrieve chat member IDs and mute statuses',
      );
    }
  }

  async addMembers(chatId: string, userIds: string[]): Promise<ChatMember[]> {
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) {
      ErrorResponse.notFound(NotFoundError.CHAT_NOT_FOUND);
    }

    const users = await this.userRepo.find({
      where: userIds.map((id) => ({ id })),
    });

    if (users.length !== userIds.length) {
      ErrorResponse.badRequest(BadRequestError.ONE_OR_MORE_USER_NOT_FOUND);
    }

    const existingMembers = await this.memberRepo.find({
      where: userIds.map((id) => ({ chatId, userId: id })),
      withDeleted: true, // includes soft-deleted records
      relations: ['user'], // Load user relation for existing members
    });

    const membersToReactivate: ChatMember[] = [];
    const newMembers: ChatMember[] = [];

    for (const user of users) {
      const existing = existingMembers.find((m) => m.userId === user.id);

      if (existing) {
        if (existing.deletedAt) {
          existing.deletedAt = null;
          existing.status = ChatMemberStatus.ACTIVE;
          membersToReactivate.push(existing);
        }
        // If already active, skip
      } else {
        const newMember = this.memberRepo.create({
          chatId,
          userId: user.id,
          user: user, // Set the user relation
        });
        newMembers.push(newMember);
      }
    }

    try {
      const savedReactivated = membersToReactivate.length
        ? await this.memberRepo.save(membersToReactivate)
        : [];
      const savedNew = newMembers.length
        ? await this.memberRepo.save(newMembers)
        : [];

      // Return all saved members with their user relations loaded
      return await this.memberRepo.find({
        where: {
          id: In([...savedReactivated, ...savedNew].map((m) => m.id)),
        },
        relations: ['user'], // Ensure user relation is loaded
      });
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to add chat members');
    }
  }

  async updateMember(
    memberId: string,
    updateDto: UpdateChatMemberDto,
  ): Promise<ChatMember> {
    try {
      const result = await this.memberRepo.update({ id: memberId }, updateDto);

      if (result.affected === 0) {
        ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);
      }

      const member = await this.memberRepo.findOne({
        where: { id: memberId },
        relations: ['user'],
      });

      if (!member) {
        ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);
      }

      return member;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to update chat member');
    }
  }

  async updateLastRead(
    memberId: string,
    messageId: string | null,
  ): Promise<ChatMember> {
    try {
      return await this.updateMember(memberId, {
        lastReadMessageId: messageId,
      });
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to update last read info');
    }
  }

  async updateNickname(
    memberId: string,
    nickname: string | null,
  ): Promise<{
    userId: string;
    chatId: string;
    firstName: string | null;
    oldNickname: string | null;
    newNickname: string | null;
  }> {
    try {
      if (nickname && nickname.length > 32) {
        ErrorResponse.badRequest(BadRequestError.NICKNAME_TOO_LONG);
      }

      const member = await this.memberRepo.findOne({
        where: { id: memberId },
        relations: ['user'],
        select: ['id', 'nickname', 'chatId', 'userId'],
      });

      if (!member) {
        ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);
      }

      const result = await this.memberRepo.update(
        { id: memberId },
        { nickname },
      );

      if (result.affected === 0) {
        ErrorResponse.badRequest(BadRequestError.FAILED_TO_UPDATE_NICKNAME);
      }

      return {
        userId: member.userId,
        chatId: member.chatId,
        firstName: member.user.firstName,
        oldNickname: member.nickname,
        newNickname: nickname,
      };
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to update nickname');
    }
  }

  async softDeleteMember(
    chatId: string,
    userId: string,
  ): Promise<{ member: ChatMember; chatDeleted: boolean }> {
    try {
      // Find the member (only non-deleted ones)
      const member = await this.memberRepo.findOne({
        where: { chatId, userId, deletedAt: IsNull() },
        relations: ['user'],
      });

      if (!member) {
        ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);
      }

      // Soft delete by setting deletedAt
      member.deletedAt = new Date();
      await this.memberRepo.save(member);

      // Count only non-deleted members
      const activeMembers = await this.memberRepo.count({
        where: { chatId, deletedAt: IsNull() },
      });

      let chatDeleted = false;

      // If no active members, permanently delete the chat
      if (activeMembers === 0) {
        await this.chatRepo.delete(chatId);
        chatDeleted = true;
      }

      return { member, chatDeleted };
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to soft delete chat member');
    }
  }

  async restoreMember(
    chatId: string,
    userId: string,
  ): Promise<ChatMember | null> {
    try {
      const result = await this.memberRepo.restore({ chatId, userId });

      if (result.affected === 0) {
        ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);
      }

      return await this.memberRepo.findOne({ where: { chatId, userId } });
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to restore chat member');
    }
  }

  async removeMember(
    chatId: string,
    userId: string,
  ): Promise<{ member: ChatMember; chatDeleted: boolean }> {
    try {
      // Find the member
      const member = await this.memberRepo.findOne({
        where: { chatId, userId },
        relations: ['user'], // for WebSocket payload
      });

      if (!member) {
        ErrorResponse.notFound(NotFoundError.MEMBER_NOT_FOUND);
      }

      // Delete the member
      await this.memberRepo.delete(member.id);

      // Check remaining members
      const remainingMembers = await this.memberRepo.count({
        where: { chatId, deletedAt: IsNull() },
      });

      let chatDeleted = false;
      if (remainingMembers === 0) {
        await this.chatRepo.delete(chatId);
        chatDeleted = true;
      }

      return { member, chatDeleted };
    } catch (error) {
      console.error('Error in removeMember:', error);
      ErrorResponse.throw(error, 'Failed to remove chat member');
    }
  }

  async togglePinChat(
    memberId: string,
    isPinned: boolean,
  ): Promise<ChatMember> {
    // Find the member first
    const member = await this.findById(memberId);

    if (isPinned) {
      // Count current pinned chats of this user
      const pinnedCount = await this.memberRepo.count({
        where: {
          userId: member.userId,
          pinnedAt: Not(IsNull()),
          deletedAt: IsNull(),
        },
      });

      // Throw error if limit exceeded
      if (pinnedCount >= MAX_PINNED) {
        ErrorResponse.badRequest(BadRequestError.MAX_PINNED_CHATS);
      }

      member.pinnedAt = new Date();
    } else {
      member.pinnedAt = null;
    }

    return await this.memberRepo.save(member);
  }

  checkAndClearExpiredMute(member: ChatMember): Date | null {
    if (!member.mutedUntil) return null;

    const now = new Date();
    const mutedUntil = new Date(member.mutedUntil);

    if (mutedUntil <= now) {
      // Fire-and-forget the update (don't await)
      this.clearExpiredMute(member.id).catch(console.error);
      return null;
    }

    return mutedUntil;
  }

  /**
   * Clears an expired mute in the database
   * @param memberId The ID of the member to update
   */
  private async clearExpiredMute(memberId: string): Promise<void> {
    try {
      await this.memberRepo.update(memberId, { mutedUntil: null });
    } catch (error) {
      console.error(
        `Failed to clear expired mute for member ${memberId}`,
        error,
      );
    }
  }
}
