import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Friendship } from './entities/friendship.entity';
import { UserService } from '../user/user.service';
import { FriendshipStatus } from '@shared/types/enums/friendship-type.enum';
import { ErrorResponse } from '../../common/api-response/errors';
import { FriendRequestResponseDto } from './dto/responses/friend-request-response.dto';
import { PaginationResponse } from '@shared/types/responses/pagination.response';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import {
  ConflictError,
  NotFoundError,
} from '@shared/types/enums/error-message.enum';

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

      for (const friendship of existingFriendships) {
        const isSentByCurrentUser =
          friendship.senderId === senderId &&
          friendship.receiverId === receiverId;

        const isSentByOtherUser =
          friendship.senderId === receiverId &&
          friendship.receiverId === senderId;

        const bothAccepted =
          friendship.senderStatus === FriendshipStatus.ACCEPTED &&
          friendship.receiverStatus === FriendshipStatus.ACCEPTED;

        if (bothAccepted) {
          ErrorResponse.conflict(ConflictError.ALREADY_FRIENDS);
        }

        if (isSentByCurrentUser) {
          if (
            friendship.receiverStatus === FriendshipStatus.PENDING ||
            friendship.receiverStatus === FriendshipStatus.DECLINED
          ) {
            ErrorResponse.conflict(ConflictError.ALREADY_SENT_FRIEND_REQUEST);
          }
        }

        if (isSentByOtherUser) {
          if (friendship.senderStatus === FriendshipStatus.PENDING) {
            ErrorResponse.conflict(ConflictError.ALREADY_SENT_FRIEND_REQUEST);
          } else if (friendship.receiverStatus === FriendshipStatus.PENDING) {
            ErrorResponse.conflict(
              ConflictError.ALREADY_RECEIVED_FRIEND_REQUEST,
            );
          }
        }
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
        relations: ['sender', 'receiver'],
      });

      if (!request) {
        ErrorResponse.notFound(NotFoundError.FRIEND_REQUEST_NOT_FOUND);
      }

      if (status === FriendshipStatus.ACCEPTED) {
        request.receiverStatus = FriendshipStatus.ACCEPTED;
        request.senderStatus = FriendshipStatus.ACCEPTED;
        request.requestMessage = null;

        // 🔥 Delete all other friendships between these users (excluding the accepted one)
        await this.friendshipRepo.delete([
          {
            senderId: request.senderId,
            receiverId: request.receiverId,
            id: Not(friendshipId),
          },
          {
            senderId: request.receiverId,
            receiverId: request.senderId,
            id: Not(friendshipId),
          },
        ]);

        const updatedFriendship = await this.friendshipRepo.save(request);
        const freshFriendship = await this.friendshipRepo.findOne({
          where: { id: updatedFriendship.id },
          relations: ['sender', 'receiver'], // Include related users if needed
        });

        // console.log('freshFriendship', freshFriendship);
        return freshFriendship;
      } else {
        // DECLINED
        request.receiverStatus = FriendshipStatus.DECLINED;
        const updatedFriendship = await this.friendshipRepo.save(request);

        // Check for mutual decline (both users declined each other)
        const oppositeDeclinedRequest = await this.friendshipRepo.findOne({
          where: {
            senderId: request.receiverId, // Opposite direction
            receiverId: request.senderId,
            receiverStatus: FriendshipStatus.DECLINED,
          },
        });

        if (oppositeDeclinedRequest) {
          // Delete ALL records between these users
          await this.friendshipRepo.delete([
            { senderId: request.senderId, receiverId: request.receiverId },
            { senderId: request.receiverId, receiverId: request.senderId },
          ]);
          return {
            message: 'Friendship data reset - both users declined each other',
          };
        }
        console.log('Declined');

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
    query: PaginationQueryDto,
  ): Promise<PaginationResponse<FriendRequestResponseDto>> {
    const { limit = 20, offset = 0, lastId } = query;

    // Received requests
    const receivedQb = this.friendshipRepo
      .createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.sender', 'sender')
      .leftJoinAndSelect('friendship.receiver', 'receiver')
      .where('friendship.receiverId = :userId', { userId })
      .andWhere('friendship.receiverStatus = :status', {
        status: FriendshipStatus.PENDING,
      })
      .orderBy('friendship.updatedAt', 'DESC');

    // Sent requests
    const sentQb = this.friendshipRepo
      .createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.sender', 'sender')
      .leftJoinAndSelect('friendship.receiver', 'receiver')
      .where('friendship.senderId = :userId', { userId })
      .andWhere('friendship.senderStatus = :senderStatus', {
        senderStatus: FriendshipStatus.ACCEPTED,
      })
      .andWhere('friendship.receiverStatus = :receiverStatus', {
        receiverStatus: FriendshipStatus.PENDING,
      })
      .orderBy('friendship.updatedAt', 'DESC');

    // Fetch and combine
    const [receivedRequests, sentRequests] = await Promise.all([
      receivedQb
        .skip(offset)
        .take(limit + 1)
        .getMany(),
      sentQb
        .skip(offset)
        .take(limit + 1)
        .getMany(),
    ]);

    const combinedRequests = [...receivedRequests, ...sentRequests];

    // Handle lastId-based pagination
    let startIndex = 0;
    if (lastId) {
      const idx = combinedRequests.findIndex((r) => r.id === lastId);
      if (idx !== -1) startIndex = idx + 1;
    }

    const paginatedRequests = combinedRequests.slice(
      startIndex,
      startIndex + limit + 1,
    );
    const hasMore = paginatedRequests.length > limit;
    const slicedRequests = hasMore
      ? paginatedRequests.slice(0, limit)
      : paginatedRequests;

    // Map to DTOs
    const items = await Promise.all(
      slicedRequests.map(async (request) => {
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
        } as FriendRequestResponseDto;
      }),
    );

    return { items, hasMore };
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

  async cancelFriendRequest(
    id: string,
    currentUserId: string,
  ): Promise<Friendship | null> {
    try {
      const friendship = await this.friendshipRepo.findOne({
        where: { id },
        select: [
          'id',
          'senderId',
          'receiverId',
          'senderStatus',
          'receiverStatus',
        ],
      });

      if (!friendship) {
        ErrorResponse.notFound(NotFoundError.FRIEND_REQUEST_NOT_FOUND);
      }

      // Verify authorization
      if (
        friendship.senderId !== currentUserId &&
        friendship.receiverId !== currentUserId
      ) {
        ErrorResponse.forbidden();
      }

      // Allow cancellation if EITHER side is pending
      if (
        friendship.senderStatus === FriendshipStatus.PENDING ||
        friendship.receiverStatus === FriendshipStatus.PENDING
      ) {
        await this.friendshipRepo.remove(friendship);
      }

      return friendship;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to cancel friend request');
    }
  }

  async deleteFriendshipByUserId(
    userId: string,
    currentUserId: string,
  ): Promise<Friendship> {
    try {
      // Find all friendship records between these two users
      const friendships = await this.friendshipRepo.find({
        where: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      });

      if (!friendships || friendships.length === 0) {
        ErrorResponse.notFound(NotFoundError.FRIENDSHIP_NOT_FOUND);
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
