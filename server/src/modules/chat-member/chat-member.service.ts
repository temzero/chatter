import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatMember } from './entities/chat-member.entity';
import { ChatMemberRole } from './constants/chat-member-roles.constants';
import { ErrorResponse } from '../../common/api-response/errors';
import { UpdateChatMemberDto } from './dto/requests/update-chat-member.dto';
import { User } from '../user/entities/user.entity';
import { Chat } from '../chat/entities/chat.entity';
import { ChatMemberResponseDto } from './dto/responses/chat-member-response.dto';
import { mapChatMemberToResponseDto } from './mappers/chat-member.mapper';
import { ChatType } from '../chat/constants/chat-types.constants';

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
      .addSelect(['block1.id AS block1_id', 'block2.id AS block2_id']) // Explicitly select block IDs
      .where('member.chatId = :chatId', { chatId })
      .getRawAndEntities();

    type BlockRaw = { block1_id?: string | null; block2_id?: string | null };
    const typedRaw = raw as BlockRaw[];

    return entities.map((member, i) => {
      const row = typedRaw[i];
      const isBlockedByMe = !!row?.block1_id; // Check if block record exists
      const isBlockedMe = !!row?.block2_id;

      return mapChatMemberToResponseDto(
        member,
        chatType,
        isBlockedByMe,
        isBlockedMe,
      );
    });
  }

  async getMember(memberId: string): Promise<ChatMember> {
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
      ErrorResponse.throw(error, 'Failed to retrieve chat member');
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
        ErrorResponse.notFound('Chat member not found or Chat not exist!');
      }

      return member;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve chat member');
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
        select: ['userId'],
      });

      if (!members || members.length === 0) {
        ErrorResponse.notFound(
          'No members found for this chat or chat does not exist!',
        );
      }

      return members.map((member) => member.userId);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve chat member IDs');
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

  async addMember(
    chatId: string,
    userId: string,
    role: ChatMemberRole = ChatMemberRole.MEMBER,
  ): Promise<ChatMember> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      ErrorResponse.notFound('User does not exist');
    }

    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) {
      ErrorResponse.notFound('Chat does not exist');
    }

    const existingMember = await this.memberRepo.findOne({
      where: { chatId, userId },
    });
    if (existingMember) {
      ErrorResponse.badRequest('User is already a member of this chat');
    }

    const newMember = this.memberRepo.create({
      chatId,
      userId,
      role,
    });

    try {
      return await this.memberRepo.save(newMember);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to add chat member');
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
  ): Promise<string | null> {
    try {
      if (nickname && nickname.length > 32) {
        ErrorResponse.badRequest('Nickname must be 32 characters or less');
      }

      const result = await this.memberRepo.update(
        { id: memberId },
        { nickname },
      );

      if (result.affected === 0) {
        ErrorResponse.notFound('Chat member not found');
      }

      return nickname;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to update nickname');
    }
  }

  async removeMember(chatId: string, userId: string): Promise<ChatMember> {
    try {
      const member = await this.memberRepo.findOneBy({
        chatId,
        userId,
      });

      if (!member) {
        ErrorResponse.notFound('Member not found');
      }

      await this.memberRepo.remove(member);
      return member;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to remove chat member');
    }
  }
}
