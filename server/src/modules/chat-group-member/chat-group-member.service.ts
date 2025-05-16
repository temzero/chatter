import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatGroupMember } from 'src/modules/chat-group-member/entities/chat-group-member.entity';
import { ChatGroupMemberDto } from 'src/modules/chat-group-member/dto/request/chat-group-member.dto';
import { ChatGroupMemberResponseDto } from './dto/response/chat-group-member-response.dto';

@Injectable()
export class ChatGroupMemberService {
  constructor(
    @InjectRepository(ChatGroupMember)
    private readonly memberRepository: Repository<ChatGroupMember>,
  ) {}

  async findByGroupId(groupId: string): Promise<ChatGroupMemberResponseDto[]> {
    const members = await this.memberRepository.find({
      where: { chat_group_id: groupId },
      relations: ['user'],
    });

    return members.map((member) => ({
      id: member.user.id,
      username: member.user.username,
      nickname: member.nickname,
      avatar: member.user.avatar,
      first_name: member.user.first_name,
      last_name: member.user.last_name,
      last_seen: member.user.last_seen,
      chat_group_id: member.chat_group_id,
      is_admin: member.is_admin,
      is_banned: member.is_banned,
      muted_until: member.muted_until,
      joinedAt: member.joinedAt,
    }));
  }

  async addMember(dto: ChatGroupMemberDto): Promise<ChatGroupMember> {
    const newMember = this.memberRepository.create(dto);
    return this.memberRepository.save(newMember);
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    const member = await this.memberRepository.findOneBy({
      chat_group_id: groupId,
      user_id: userId,
    });

    if (!member) {
      throw new NotFoundException('Group member not found');
    }

    await this.memberRepository.remove(member);
  }

  async updateMember(
    groupId: string,
    userId: string,
    dto: Partial<ChatGroupMemberDto>,
  ): Promise<ChatGroupMember> {
    const member = await this.memberRepository.findOneBy({
      chat_group_id: groupId,
      user_id: userId,
    });

    if (!member) {
      throw new NotFoundException('Group member not found');
    }

    Object.assign(member, dto);
    return this.memberRepository.save(member);
  }
}
