// src/modules/block/block.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './entity/block.entity';
import { User } from '../user/entities/user.entity';
import { CreateBlockDto } from './dto/create-block.dto';
import { BlockResponseDto } from './dto/block-response.dto';
import { plainToInstance } from 'class-transformer';
import { ErrorResponse } from '../../common/api-response/errors';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(Block)
    private readonly blockRepo: Repository<Block>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createBlock(
    blockerId: string,
    createBlockDto: CreateBlockDto,
  ): Promise<BlockResponseDto> {
    // 1. Validate
    if (blockerId === createBlockDto.blockedId) {
      ErrorResponse.badRequest('Cannot block yourself');
    }

    const blockedUser = await this.userRepo.findOneBy({
      id: createBlockDto.blockedId,
    });
    if (!blockedUser) {
      ErrorResponse.notFound('User not found');
    }

    // 2. Check existing block
    const exists = await this.blockRepo.existsBy({
      blockerId,
      blockedId: createBlockDto.blockedId,
    });
    if (exists) {
      ErrorResponse.badRequest('User already blocked');
    }

    // 3. Create block
    const block = await this.blockRepo.save({
      blockerId,
      blockedId: createBlockDto.blockedId,
      reason: createBlockDto.reason,
    });

    return plainToInstance(BlockResponseDto, block);
  }

  async removeBlock(
    blockerId: string,
    blockedId: string,
  ): Promise<BlockResponseDto> {
    const block = await this.blockRepo.findOneBy({ blockerId, blockedId });
    if (!block) {
      ErrorResponse.notFound('Block relationship not found');
    }

    await this.blockRepo.delete({ blockerId, blockedId });
    return plainToInstance(BlockResponseDto, block);
  }

  async getBlockedUsers(userId: string): Promise<string[]> {
    const blocks = await this.blockRepo.find({
      where: [{ blockerId: userId }, { blockedId: userId }],
    });

    return blocks.map((block) =>
      block.blockerId === userId ? block.blockedId : block.blockerId,
    );
  }

  async getMutualBlocks(userId1: string, userId2: string): Promise<Block[]> {
    return this.blockRepo.find({
      where: [
        { blockerId: userId1, blockedId: userId2 },
        { blockerId: userId2, blockedId: userId1 },
      ],
    });
  }

  async getBlockUsersByMe(userId: string): Promise<BlockResponseDto[]> {
    const blocks = await this.blockRepo.find({
      where: { blockerId: userId },
      relations: ['blocked'],
    });
    return blocks.map((block) => plainToInstance(BlockResponseDto, block));
  }

  async getBlock(
    blockerId: string,
    blockedId: string,
  ): Promise<BlockResponseDto> {
    const block = await this.blockRepo.findOne({
      where: { blockerId, blockedId },
      relations: ['blocked'],
    });
    if (!block) {
      ErrorResponse.notFound('Block not found');
    }
    return plainToInstance(BlockResponseDto, block);
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    return this.blockRepo.existsBy({ blockerId, blockedId });
  }

  // block.service.ts
  async getBlockStatus(
    me: string,
    user: string,
  ): Promise<{ isBlockedByMe: boolean; isBlockedMe: boolean }> {
    const blocks = await this.blockRepo.find({
      where: [
        { blockerId: me, blockedId: user },
        { blockerId: user, blockedId: me },
      ],
    });

    const isBlockedByMe = blocks.some((b) => b.blockerId === me);
    const isBlockedMe = blocks.some((b) => b.blockerId === user);

    return { isBlockedByMe, isBlockedMe };
  }
}
