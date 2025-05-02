import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatGroupMember } from 'src/entities/chat/chat-group-member.entity';
import { ChatGroupMemberDto } from 'src/dto/chat-group/chat-group-members.dto';

@Injectable()
export class ChatGroupMemberService {
  constructor(
    @InjectRepository(ChatGroupMember)
    private readonly memberRepository: Repository<ChatGroupMember>,
  ) {}

  async findByGroupId(groupId: string): Promise<ChatGroupMember[]> {
    return this.memberRepository.find({
      where: { chat_group_id: groupId },
      relations: ['user'],
    });
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
