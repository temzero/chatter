import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './entities/friendship.entity';
import { UserService } from '../user/user.service';
import { FriendshipStatus } from './constants/friendship-status.constants';
import { ErrorResponse } from '../../common/api-response/errors';
import {
  FriendRequestResDto,
  ReceivedRequestsResDto,
  SentRequestResDto,
} from './dto/responses/friend-request-response.dto';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepo: Repository<Friendship>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async sendRequest(
    senderId: string,
    receiverId: string,
    requestMessage?: string,
  ): Promise<Friendship> {
    try {
      // Check if user exists
      await this.userService.getUserById(receiverId);

      // Check if relationship already exists
      const exists = await this.friendshipRepo.findOne({
        where: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      });

      if (exists) {
        ErrorResponse.conflict('Friendship relationship already exists');
      }

      return await this.friendshipRepo.save({
        senderId,
        receiverId,
        status: FriendshipStatus.PENDING,
        requestMessage: requestMessage || null,
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
          receiverId: userId,
          status: FriendshipStatus.PENDING,
        },
      });

      if (!request) {
        ErrorResponse.notFound('Friend request not found');
      }

      request.status = status;
      request.updatedAt = new Date();

      // Clear the request message if the request is accepted
      if (status === FriendshipStatus.ACCEPTED) {
        request.requestMessage = null;
      }

      return await this.friendshipRepo.save(request);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to respond to friend request');
    }
  }

  async getFriends(userId: string): Promise<Friendship[]> {
    try {
      return await this.friendshipRepo.find({
        where: [
          { senderId: userId, status: FriendshipStatus.ACCEPTED },
          { receiverId: userId, status: FriendshipStatus.ACCEPTED },
        ],
        relations: ['sender', 'receiver'],
      });
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve friends');
    }
  }

  async getPendingRequests(userId: string): Promise<FriendRequestResDto> {
    try {
      // Get received requests (where user is the receiver)
      const receivedRequests = await this.friendshipRepo.find({
        where: {
          receiverId: userId,
          status: FriendshipStatus.PENDING,
        },
        relations: ['sender'],
      });

      // Get sent requests (where user is the sender)
      const sentRequests = await this.friendshipRepo.find({
        where: {
          senderId: userId,
          status: FriendshipStatus.PENDING,
        },
        relations: ['receiver'],
      });

      // Process received requests
      const receivedResults: ReceivedRequestsResDto[] = await Promise.all(
        receivedRequests.map(async (request) => {
          const mutualFriends = await this.getMutualFriendsCount(
            userId,
            request.senderId,
          );

          return {
            id: request.id,
            senderId: request.senderId,
            senderName:
              request.sender.firstName + ' ' + request.sender.lastName,
            senderAvatarUrl: request.sender.avatarUrl,
            requestMessage: request.requestMessage,
            mutualFriends,
            updatedAt: request.updatedAt,
          };
        }),
      );

      // Process sent requests
      const sentResults: SentRequestResDto[] = await Promise.all(
        sentRequests.map(async (request) => {
          const mutualFriends = await this.getMutualFriendsCount(
            userId,
            request.receiverId,
          );

          return {
            id: request.id,
            receiverId: request.receiverId,
            receiverName:
              request.receiver.firstName + ' ' + request.receiver.lastName,
            receiverAvatarUrl: request.receiver.avatarUrl,
            requestMessage: request.requestMessage,
            mutualFriends,
            updatedAt: request.updatedAt,
          };
        }),
      );

      return {
        sent: sentResults,
        received: receivedResults,
      };
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve pending friend requests');
    }
  }

  async getMutualFriendsCount(
    userAId: string,
    userBId: string,
  ): Promise<number> {
    const acceptedStatus = FriendshipStatus.ACCEPTED;

    // Get userA's friends
    const userAFriendships = await this.friendshipRepo.find({
      where: [
        { senderId: userAId, status: acceptedStatus },
        { receiverId: userAId, status: acceptedStatus },
      ],
    });

    const userAFriendIds = userAFriendships.map((f) =>
      f.senderId === userAId ? f.receiverId : f.senderId,
    );

    // Get userB's friends
    const userBFriendships = await this.friendshipRepo.find({
      where: [
        { senderId: userBId, status: acceptedStatus },
        { receiverId: userBId, status: acceptedStatus },
      ],
    });

    const userBFriendIds = userBFriendships.map((f) =>
      f.senderId === userBId ? f.receiverId : f.senderId,
    );

    // Count mutual friends
    const mutualFriends = userAFriendIds.filter((id) =>
      userBFriendIds.includes(id),
    );
    return mutualFriends.length;
  }

  async getFriendshipStatus(
    userId: string,
    otherUserId: string,
  ): Promise<FriendshipStatus | null> {
    try {
      const friendship = await this.friendshipRepo.findOne({
        where: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      });

      return friendship?.status || null;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve friendship status');
    }
  }
}
