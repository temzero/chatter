import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatGroup } from 'src/modules/chat-group/entities/chat-group.entity';
import { ChatGroupMember } from 'src/modules/chat-group-member/entities/chat-group-member.entity';
import { ChatGroupDto } from 'src/modules/chat-group/dto/chat-group.dto';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class ChatGroupService {
  constructor(
    @InjectRepository(ChatGroup)
    private readonly chatGroupRepository: Repository<ChatGroup>,

    @InjectRepository(ChatGroupMember)
    private readonly chatGroupMemberRepository: Repository<ChatGroupMember>,
  ) {}

  async getAllGroups(): Promise<ChatGroup[]> {
    return this.chatGroupRepository.find();
  }

  async getGroupsByUserId(userId: string): Promise<ChatGroup[]> {
    const members = await this.chatGroupMemberRepository.find({
      where: { user_id: userId },
      relations: [
        'chatGroup',
        'chatGroup.lastMessage',
        'chatGroup.pinnedMessage',
      ],
    });

    return members
      .map((member) => member.chatGroup)
      .sort((a, b) => {
        const aTime = a.lastMessage?.updatedAt || a.updatedAt;
        const bTime = b.lastMessage?.updatedAt || b.updatedAt;
        return bTime.getTime() - aTime.getTime(); // Descending order (newest first)
      });
  }

  async getGroupById(id: string): Promise<ChatGroup | null> {
    return this.chatGroupRepository.findOne({
      where: { id },
      relations: ['lastMessage', 'pinnedMessage'],
    });
  }

  async createGroup(dto: ChatGroupDto): Promise<ChatGroup> {
    return this.chatGroupRepository.manager.transaction(async (manager) => {
      const {
        name,
        type,
        description,
        avatar,
        is_public,
        is_broadcast_only,
        memberIds,
      } = dto;

      // 1. Create the chat group
      const chatGroup = await manager.save(ChatGroup, {
        name,
        type,
        description,
        avatar,
        is_public,
        is_broadcast_only,
      });

      // 2. Verify all users exist first
      const users = await manager.findByIds(User, memberIds);
      if (users.length !== memberIds.length) {
        throw new Error('One or more users not found');
      }

      // 3. Create group member relations
      const memberEntities = memberIds.map((userId, index) =>
        manager.create(ChatGroupMember, {
          chatGroup,
          user: { id: userId },
          is_admin: index === 0, // First member is admin
        }),
      );

      await manager.save(ChatGroupMember, memberEntities);

      return chatGroup;
    });
  }

  async updateGroup(id: string, dto: ChatGroupDto): Promise<ChatGroup | null> {
    const group = await this.getGroupById(id);
    if (!group) return null;

    Object.assign(group, dto);
    return this.chatGroupRepository.save(group);
  }

  async deleteGroup(id: string): Promise<ChatGroup | null> {
    const group = await this.getGroupById(id);
    if (!group) return null;

    await this.chatGroupRepository.remove(group);
    return group;
  }
}
