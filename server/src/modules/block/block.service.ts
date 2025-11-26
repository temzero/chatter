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
import {
  BadRequestError,
  NotFoundError,
} from 'src/shared/types/enums/error-message.enum';

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
      ErrorResponse.badRequest(BadRequestError.CANNOT_BLOCK_SELF);
    }

    const blockedUser = await this.userRepo.findOneBy({
      id: createBlockDto.blockedId,
    });
    if (!blockedUser) {
      ErrorResponse.notFound(NotFoundError.USER_NOT_FOUND);
    }

    // 2. Check existing block
    const exists = await this.blockRepo.existsBy({
      blockerId,
      blockedId: createBlockDto.blockedId,
    });
    if (exists) {
      ErrorResponse.badRequest(BadRequestError.USER_ALREADY_BLOCKED);
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
      ErrorResponse.notFound(NotFoundError.BLOCK_NOT_FOUND);
    }

    await this.blockRepo.delete({ blockerId, blockedId });
    return plainToInstance(BlockResponseDto, block);
  }

  async getBlockedUserIds(userId: string): Promise<string[]> {
    const blocks = await this.blockRepo.find({
      where: [
        { blockerId: userId }, // Users YOU blocked
        { blockedId: userId }, // Users who blocked YOU
      ],
    });
    return blocks
      .map((block) =>
        block.blockerId === userId ? block.blockedId : block.blockerId,
      )
      .filter((id) => id !== userId);
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
      ErrorResponse.notFound(NotFoundError.BLOCK_NOT_FOUND);
    }
    return plainToInstance(BlockResponseDto, block);
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    return this.blockRepo.existsBy({ blockerId, blockedId });
  }

  // block.service.ts
  async getBlockStatusBetween(
    currentUserId: string,
    otherUserId: string,
  ): Promise<{ isBlockedByMe: boolean; isBlockedMe: boolean }> {
    const blocks = await this.blockRepo.find({
      where: [
        { blockerId: currentUserId, blockedId: otherUserId },
        { blockerId: otherUserId, blockedId: currentUserId },
      ],
    });

    const isBlockedByMe = blocks.some((b) => b.blockerId === currentUserId);
    const isBlockedMe = blocks.some((b) => b.blockerId === otherUserId);

    return { isBlockedByMe, isBlockedMe };
  }
}
