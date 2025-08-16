import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';

import { ChatMember } from './entities/chat-member.entity';
import { ErrorResponse } from '../../common/api-response/errors';
import { UpdateChatMemberDto } from './dto/requests/update-chat-member.dto';
import { User } from '../user/entities/user.entity';
import { Chat } from '../chat/entities/chat.entity';
import { ChatMemberResponseDto } from './dto/responses/chat-member-response.dto';
import { mapChatMemberToResponseDto } from './mappers/chat-member.mapper';
import { ChatType } from '../chat/constants/chat-types.constants';
import { FriendshipStatus } from '../friendship/constants/friendship-status.constants';
import { ChatMemberStatus } from './constants/chat-member-status.constants';

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
        ErrorResponse.notFound('Chat member not found');
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

  async findByChatIdWithBlockFilter(
    chatId: string,
    currentUserId: string,
  ): Promise<ChatMember[]> {
    try {
      return await this.memberRepo
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
        .where('member.chatId = :chatId', { chatId })
        .andWhere('block1.id IS NULL AND block2.id IS NULL')
        .getMany();
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve filtered chat members');
    }
  }

  async findByChatIdWithBlockStatus(
    chatId: string,
    currentUserId: string,
    chatType: ChatType,
  ): Promise<ChatMemberResponseDto[]> {
    const { entities, raw } = await this.memberRepo
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
      // Updated friendship join to match your entity
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
        // Get both statuses and determine the overall friendship status
        'friendship.sender_status AS sender_status',
        'friendship.receiver_status AS receiver_status',
      ])
      .where('member.chatId = :chatId AND member.deletedAt IS NULL', { chatId })
      .getRawAndEntities();

    type RawType = {
      block1_id?: string | null;
      block2_id?: string | null;
      sender_status?: string | null;
      receiver_status?: string | null;
    };

    return entities.map((member, i) => {
      const row = raw[i] as RawType;
      const isBlockedByMe = !!row?.block1_id;
      const isBlockedMe = !!row?.block2_id;

      // Determine friendship status based on who is the current user
      let friendshipStatus: FriendshipStatus | null = null;
      if (row?.sender_status && row?.receiver_status) {
        if (member.userId === currentUserId) {
          // Current user is the sender
          friendshipStatus = row.sender_status as FriendshipStatus;
        } else {
          // Current user is the receiver
          friendshipStatus = row.receiver_status as FriendshipStatus;
        }
      }

      return mapChatMemberToResponseDto(
        member,
        chatType,
        isBlockedByMe,
        isBlockedMe,
        friendshipStatus,
      );
    });
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
        ErrorResponse.notFound('Chat member not found!');
      }

      return member;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve chat member');
    }
  }

  async getChatMemberIdFromUserId(
    chatId: string,
    userId: string,
  ): Promise<string> {
    try {
      const member = await this.memberRepo.findOne({
        where: { chatId, userId },
        select: ['id'], // We only need the ID
      });

      if (!member) {
        ErrorResponse.notFound('Chat member not found');
      }

      return member.id;
    } catch (error) {
      ErrorResponse.throw(
        error,
        'Failed to retrieve chat member ID from user ID',
      );
    }
  }

  async getAllMembers(chatId: string): Promise<ChatMember[]> {
    try {
      const members = await this.memberRepo.find({
        where: { chatId },
        relations: ['user'],
      });

      if (!members || members.length === 0) {
        ErrorResponse.notFound(
          'No members found for this chat or chat does not exist!',
        );
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
        ErrorResponse.notFound(
          'No members found for this chat or chat does not exist!',
        );
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
        ErrorResponse.notFound(
          'No members found for this chat or chat does not exist!',
        );
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

  async getChatIdsByUserId(userId: string): Promise<string[]> {
    try {
      const chatMemberships = await this.memberRepo.find({
        where: { userId },
        select: ['chatId'],
      });

      if (!chatMemberships || chatMemberships.length === 0) {
        ErrorResponse.notFound('User is not a member of any chats');
      }

      return chatMemberships.map((member) => member.chatId);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve chat IDs by user ID');
    }
  }

  async addMembers(chatId: string, userIds: string[]): Promise<ChatMember[]> {
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) {
      ErrorResponse.notFound('Chat does not exist');
    }

    const users = await this.userRepo.find({
      where: userIds.map((id) => ({ id })),
    });

    if (users.length !== userIds.length) {
      ErrorResponse.notFound('One or more users do not exist');
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
        ErrorResponse.notFound('Chat member not found');
      }

      const member = await this.memberRepo.findOne({
        where: { id: memberId },
        relations: ['user'],
      });

      if (!member) {
        ErrorResponse.notFound('Chat member not found');
      }

      return member;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to update chat member');
    }
  }

  async updateLastRead(
    memberId: string,
    messageId: string,
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
        ErrorResponse.badRequest('Nickname must be 32 characters or less');
      }

      const member = await this.memberRepo.findOne({
        where: { id: memberId },
        relations: ['user'],
        select: ['id', 'nickname', 'chatId', 'userId'],
      });

      if (!member) {
        ErrorResponse.notFound('Chat member not found');
      }

      const result = await this.memberRepo.update(
        { id: memberId },
        { nickname },
      );

      if (result.affected === 0) {
        ErrorResponse.notFound('Failed to update nickname');
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
        ErrorResponse.notFound('Chat member not found');
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
        ErrorResponse.notFound('Chat member not found or already active');
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
        ErrorResponse.notFound('Member not found');
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
