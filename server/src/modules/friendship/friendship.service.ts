import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Friendship } from './entities/friendship.entity';
import { UserService } from '../user/user.service';
import { FriendshipStatus } from './constants/friendship-status.constants';
import { ErrorResponse } from '../../common/api-response/errors';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepo: Repository<Friendship>,
    private readonly userService: UserService,
  ) {}

  async sendRequest(
    requesterId: string,
    addresseeId: string,
  ): Promise<Friendship> {
    try {
      // Check if user exists
      await this.userService.getUserById(addresseeId);

      // Check if relationship already exists
      const exists = await this.friendshipRepo.findOne({
        where: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      });

      if (exists) {
        ErrorResponse.conflict('Friendship relationship already exists');
      }

      return await this.friendshipRepo.save({
        requesterId,
        addresseeId: addresseeId,
        status: FriendshipStatus.PENDING,
      });
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to send friend request');
    }
  }

  async respondToRequest(
    userId: string,
    friendshipId: string,
    status: FriendshipStatus.ACCEPTED | FriendshipStatus.DECLINED,
  ): Promise<Friendship> {
    try {
      const request = await this.friendshipRepo.findOne({
        where: {
          id: friendshipId,
          addresseeId: userId,
          status: FriendshipStatus.PENDING,
        },
      });

      if (!request) {
        ErrorResponse.notFound('Friend request not found');
      }

      request.status = status;
      request.updatedAt = new Date();
      return await this.friendshipRepo.save(request);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to respond to friend request');
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
      ErrorResponse.throw(error, 'Failed to retrieve friends');
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
      ErrorResponse.throw(error, 'Failed to retrieve pending friend requests');
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
      ErrorResponse.throw(error, 'Failed to retrieve friendship status');
    }
  }
}
