import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FriendshipService } from './friendship.service';
import { SendFriendRequestDto } from './dto/requests/send-friend-request.dto';
import { RespondFriendRequestDto } from './dto/requests/respond-friend-request.dto';
import { ResponseData } from '../../common/response-data';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FriendshipResponseDto } from './dto/responses/friendship-response.dto';
import { AppError } from '../../common/errors';
import { FriendshipStatus } from './constants/friendship-status.constants';

@Controller('friendships')
@UseGuards(JwtAuthGuard)
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('requests')
  async sendRequest(
    @CurrentUser('id') userId: string,
    @Body() dto: SendFriendRequestDto,
  ): Promise<ResponseData<FriendshipResponseDto>> {
    try {
      const friendship = await this.friendshipService.sendRequest(userId, dto);

      return new ResponseData<FriendshipResponseDto>(
        plainToInstance(FriendshipResponseDto, friendship),
        HttpStatus.CREATED,
        'Friend request sent successfully',
      );
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to send friend request');
    }
  }

  @Patch('requests/:id')
  async respondToRequest(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RespondFriendRequestDto,
  ): Promise<ResponseData<FriendshipResponseDto>> {
    try {
      const friendship = await this.friendshipService.respondToRequest(userId, {
        ...dto,
        friendshipId: id,
      });

      return new ResponseData<FriendshipResponseDto>(
        plainToInstance(FriendshipResponseDto, friendship),
        HttpStatus.OK,
        'Friend request responded successfully',
      );
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to respond to friend request');
    }
  }

  @Get()
  async getFriends(
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<FriendshipResponseDto[]>> {
    try {
      const friendships = await this.friendshipService.getFriends(userId);

      return new ResponseData<FriendshipResponseDto[]>(
        plainToInstance(FriendshipResponseDto, friendships),
        HttpStatus.OK,
        'Friends retrieved successfully',
      );
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to retrieve friends');
    }
  }

  @Get('requests/pending')
  async getPendingRequests(
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<FriendshipResponseDto[]>> {
    try {
      const requests = await this.friendshipService.getPendingRequests(userId);

      return new ResponseData<FriendshipResponseDto[]>(
        plainToInstance(FriendshipResponseDto, requests),
        HttpStatus.OK,
        'Pending friend requests retrieved successfully',
      );
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to retrieve pending friend requests');
    }
  }

  @Get('status/:userId')
  async getFriendshipStatus(
    @CurrentUser('id') currentUserId: string,
    @Param('userId') otherUserId: string,
  ): Promise<ResponseData<{ status: FriendshipStatus | null }>> {
    try {
      const status = await this.friendshipService.getFriendshipStatus(
        currentUserId,
        otherUserId,
      );

      return new ResponseData(
        { status },
        HttpStatus.OK,
        'Friendship status retrieved successfully',
      );
    } catch (error: unknown) {
      AppError.throw(error, 'Failed to retrieve friendship status');
    }
  }
}
