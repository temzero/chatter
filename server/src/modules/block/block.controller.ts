// src/modules/block/block.controller.ts
import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  HttpStatus,
  UseGuards,
  HttpCode,
  Get,
} from '@nestjs/common';
import { BlockService } from './block.service';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { SuccessResponse } from 'src/common/api-response/success';
import { ErrorResponse } from 'src/common/api-response/errors';
import { CreateBlockDto } from './dto/create-block.dto';
import { BlockResponseDto } from './dto/block-response.dto';

@Controller('block')
@UseGuards(JwtAuthGuard)
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') blockerId: string,
    @Body() createBlockDto: CreateBlockDto,
  ): Promise<SuccessResponse<BlockResponseDto>> {
    try {
      const block = await this.blockService.createBlock(
        blockerId,
        createBlockDto,
      );
      return new SuccessResponse(block, 'User blocked successfully');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to block user');
    }
  }

  @Delete(':blockedId')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser('id') blockerId: string,
    @Param('blockedId') blockedId: string,
  ): Promise<SuccessResponse<BlockResponseDto>> {
    try {
      const unblock = await this.blockService.removeBlock(blockerId, blockedId);
      return new SuccessResponse(unblock, 'User unblocked successfully');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to unblock user');
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<BlockResponseDto[]>> {
    try {
      const blocks = await this.blockService.getBlockUsersByMe(userId);
      return new SuccessResponse(
        blocks,
        'Blocked users retrieved successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve blocked users');
    }
  }

  @Get(':blockedId')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @CurrentUser('id') blockerId: string,
    @Param('blockedId') blockedId: string,
  ): Promise<SuccessResponse<BlockResponseDto>> {
    try {
      const block = await this.blockService.getBlock(blockerId, blockedId);
      return new SuccessResponse(block, 'Block status retrieved successfully');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve block status');
    }
  }
}
