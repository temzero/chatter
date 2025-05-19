import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Friendship } from './entities/friendship.entity';
import { UserService } from '../user/user.service';
import { SendFriendRequestDto } from './dto/requests/send-friend-request.dto';
import { FriendshipStatus } from './constants/friendship-status.constants';
import { RespondFriendRequestDto } from './dto/requests/respond-friend-request.dto';
import { AppError } from '../../common/errors';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepo: Repository<Friendship>,
    private readonly userService: UserService,
  ) {}

  async sendRequest(
    requesterId: string,
    dto: SendFriendRequestDto,
  ): Promise<Friendship> {
    try {
      // Check if user exists
      await this.userService.getUserById(dto.addresseeId);

      // Check if relationship already exists
      const exists = await this.friendshipRepo.findOne({
        where: [
          { requesterId, addresseeId: dto.addresseeId },
          { requesterId: dto.addresseeId, addresseeId: requesterId },
        ],
      });

      if (exists) {
        AppError.conflict('Friendship relationship already exists');
      }

      return await this.friendshipRepo.save({
        requesterId,
        addresseeId: dto.addresseeId,
        status: FriendshipStatus.PENDING,
      });
    } catch (error) {
      AppError.throw(error, 'Failed to send friend request');
    }
  }

  async respondToRequest(
    userId: string,
    dto: RespondFriendRequestDto,
  ): Promise<Friendship> {
    try {
      const request = await this.friendshipRepo.findOne({
        where: {
          id: dto.friendshipId,
          addresseeId: userId,
          status: FriendshipStatus.PENDING,
        },
      });

      if (!request) {
        AppError.notFound('Friend request not found');
      }

      request.status = dto.status;
      request.updatedAt = new Date();
      return await this.friendshipRepo.save(request);
    } catch (error) {
      AppError.throw(error, 'Failed to respond to friend request');
    }
  }

  async getFriends(userId: string): Promise<Friendship[]> {
    try {
      return await this.friendshipRepo.find({
        where: [
          { requesterId: userId, status: FriendshipStatus.ACCEPTED },
          { addresseeId: userId, status: FriendshipStatus.ACCEPTED },
        ],
        relations: ['requester', 'addressee'],
      });
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve friends');
    }
  }

  async getPendingRequests(userId: string): Promise<Friendship[]> {
    try {
      return await this.friendshipRepo.find({
        where: {
          addresseeId: userId,
          status: FriendshipStatus.PENDING,
        },
        relations: ['requester'],
      });
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve pending friend requests');
    }
  }

  async getFriendshipStatus(
    userId: string,
    otherUserId: string,
  ): Promise<FriendshipStatus | null> {
    try {
      const friendship = await this.friendshipRepo.findOne({
        where: [
          { requesterId: userId, addresseeId: otherUserId },
          { requesterId: otherUserId, addresseeId: userId },
        ],
      });

      return friendship?.status || null;
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve friendship status');
    }
  }
}
