import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './entities/friendship.entity';
import { UserService } from '../user/user.service';
import { FriendshipStatus } from './constants/friendship-status.constants';
import { ErrorResponse } from '../../common/api-response/errors';
import { FriendRequestResponseDto } from './dto/responses/friend-request-response.dto';

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
  ): Promise<FriendRequestResponseDto> {
    try {
      const [sender, receiver] = await Promise.all([
        this.userService.getUserById(senderId),
        this.userService.getUserById(receiverId),
      ]);

      const existingFriendships = await this.friendshipRepo.find({
        where: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      });

      if (existingFriendships.length > 0) {
        ErrorResponse.unauthorized('Friend request already exists');
      }

      const isBlockedByOtherUser = existingFriendships.some((friendship) => {
        if (
          friendship.senderId === senderId &&
          [FriendshipStatus.DECLINED].includes(friendship.receiverStatus)
        ) {
          return true;
        }
        if (
          friendship.receiverId === senderId &&
          [FriendshipStatus.DECLINED].includes(friendship.senderStatus)
        ) {
          return true;
        }
        return false;
      });

      if (isBlockedByOtherUser) {
        ErrorResponse.conflict(
          'Cannot send request - user has blocked or declined your previous request',
        );
      }

      const friendship = await this.friendshipRepo.save({
        senderId,
        receiverId,
        requestMessage: requestMessage || null,
        senderStatus: FriendshipStatus.ACCEPTED,
        receiverStatus: FriendshipStatus.PENDING,
      });

      const mutualFriends = await this.getMutualFriendsCount(
        senderId,
        receiverId,
      );

      return {
        id: friendship.id,
        sender: {
          id: sender.id,
          name: `${sender.firstName} ${sender.lastName}`,
          avatarUrl: sender.avatarUrl,
        },
        receiver: {
          id: receiver.id,
          name: `${receiver.firstName} ${receiver.lastName}`,
          avatarUrl: receiver.avatarUrl,
        },
        mutualFriends,
        requestMessage: friendship.requestMessage,
        updatedAt: friendship.updatedAt,
      };
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to send friend request');
    }
  }

  async respondToRequest(
    receiverId: string,
    friendshipId: string,
    status: FriendshipStatus.ACCEPTED | FriendshipStatus.DECLINED,
  ) {
    try {
      const request = await this.friendshipRepo.findOne({
        where: {
          id: friendshipId,
          receiverId,
          receiverStatus: FriendshipStatus.PENDING,
        },
        relations: ['receiver'], // Include receiver relation
      });

      if (!request) {
        ErrorResponse.notFound('Friend request not found');
      }

      request.receiverStatus = status;
      request.updatedAt = new Date();

      // Clear the request message if the request is accepted
      if (status === FriendshipStatus.ACCEPTED) {
        request.requestMessage = null;
      }

      const updatedFriendship = await this.friendshipRepo.save(request);

      if (status === FriendshipStatus.ACCEPTED) {
        return updatedFriendship; // Returns with receiver
      } else {
        // For DECLINED, remove receiver before returning
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { receiver, ...friendshipWithoutReceiver } = updatedFriendship;
        return friendshipWithoutReceiver;
      }
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to respond to friend request');
    }
  }

  async getFriends(userId: string): Promise<Friendship[]> {
    try {
      return await this.friendshipRepo.find({
        where: [
          {
            senderId: userId,
            senderStatus: FriendshipStatus.ACCEPTED,
            receiverStatus: FriendshipStatus.ACCEPTED,
          },
          {
            receiverId: userId,
            senderStatus: FriendshipStatus.ACCEPTED,
            receiverStatus: FriendshipStatus.ACCEPTED,
          },
        ],
        relations: ['sender', 'receiver'],
      });
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve friends');
    }
  }

  async getPendingRequests(
    userId: string,
  ): Promise<FriendRequestResponseDto[]> {
    try {
      // Get received requests (where user is the receiver and status is pending)
      const receivedRequests = await this.friendshipRepo.find({
        where: {
          receiverId: userId,
          receiverStatus: FriendshipStatus.PENDING,
        },
        relations: ['sender', 'receiver'],
      });

      // Get sent requests (where user is the sender and receiver hasn't responded yet)
      const sentRequests = await this.friendshipRepo.find({
        where: {
          senderId: userId,
          receiverStatus: FriendshipStatus.PENDING,
          senderStatus: FriendshipStatus.ACCEPTED,
        },
        relations: ['sender', 'receiver'],
      });

      // Combine both into one unified format
      const requests = await Promise.all(
        [...receivedRequests, ...sentRequests].map(async (request) => {
          const mutualFriends = await this.getMutualFriendsCount(
            request.senderId,
            request.receiverId,
          );

          return {
            id: request.id,
            sender: {
              id: request.sender.id,
              name: `${request.sender.firstName} ${request.sender.lastName}`,
              avatarUrl: request.sender.avatarUrl,
            },
            receiver: {
              id: request.receiver.id,
              name: `${request.receiver.firstName} ${request.receiver.lastName}`,
              avatarUrl: request.receiver.avatarUrl,
            },
            mutualFriends,
            requestMessage: request.requestMessage,
            updatedAt: request.updatedAt,
          };
        }),
      );

      return requests;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve pending friend requests');
    }
  }

  async getMutualFriendsCount(
    userAId: string,
    userBId: string,
  ): Promise<number> {
    // Get userA's accepted friends
    const userAFriendships = await this.friendshipRepo.find({
      where: [
        {
          senderId: userAId,
          senderStatus: FriendshipStatus.ACCEPTED,
          receiverStatus: FriendshipStatus.ACCEPTED,
        },
        {
          receiverId: userAId,
          senderStatus: FriendshipStatus.ACCEPTED,
          receiverStatus: FriendshipStatus.ACCEPTED,
        },
      ],
    });

    const userAFriendIds = userAFriendships.map((f) =>
      f.senderId === userAId ? f.receiverId : f.senderId,
    );

    // Get userB's accepted friends
    const userBFriendships = await this.friendshipRepo.find({
      where: [
        {
          senderId: userBId,
          senderStatus: FriendshipStatus.ACCEPTED,
          receiverStatus: FriendshipStatus.ACCEPTED,
        },
        {
          receiverId: userBId,
          senderStatus: FriendshipStatus.ACCEPTED,
          receiverStatus: FriendshipStatus.ACCEPTED,
        },
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

      if (!friendship) {
        return null;
      }

      // Determine overall status based on both statuses
      if (
        friendship.senderStatus === FriendshipStatus.ACCEPTED &&
        friendship.receiverStatus === FriendshipStatus.ACCEPTED
      ) {
        return FriendshipStatus.ACCEPTED;
      } else if (friendship.receiverStatus === FriendshipStatus.PENDING) {
        return FriendshipStatus.PENDING;
      } else if (friendship.receiverStatus === FriendshipStatus.DECLINED) {
        return FriendshipStatus.DECLINED;
      }

      return null;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve friendship status');
    }
  }

  async deleteFriendship(
    id: string,
    currentUserId: string,
  ): Promise<Friendship> {
    try {
      // First, find the friendship by ID only
      const friendship = await this.friendshipRepo.findOneBy({ id });

      if (!friendship) {
        ErrorResponse.notFound('Friendship not found');
      }

      // Then verify the current user is either sender or receiver
      if (
        friendship.senderId !== currentUserId &&
        friendship.receiverId !== currentUserId
      ) {
        ErrorResponse.unauthorized(
          'You are not authorized to delete this friendship',
        );
      }

      await this.friendshipRepo.remove(friendship);
      return friendship;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to delete friendship');
    }
  }

  async deleteFriendshipByUserId(
    userId: string,
    currentUserId: string,
  ): Promise<Friendship> {
    try {
      // Verify the user exists
      await this.userService.getUserById(userId);

      // Find all friendship records between these two users
      const friendships = await this.friendshipRepo.find({
        where: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      });

      if (!friendships || friendships.length === 0) {
        ErrorResponse.notFound('Friendship not found');
      }

      // We'll return the first deleted friendship (for consistency with deleteFriendship)
      const friendshipToReturn = friendships[0];

      // Delete all found friendships
      await this.friendshipRepo.remove(friendships);

      return friendshipToReturn;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to delete friendship');
    }
  }
}
