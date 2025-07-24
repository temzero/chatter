import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FriendshipService } from './friendship.service';
import { SuccessResponse } from '../../common/api-response/success';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FriendshipResponseDto } from './dto/responses/friendship-response.dto';
import { FriendshipStatus } from './constants/friendship-status.constants';
import { RespondToRequestDto } from './dto/requests/response-to-request.dto';
import { FriendRequestResponseDto } from './dto/responses/friend-request-response.dto';
import { Friendship } from './entities/friendship.entity';
import { UserService } from '../user/user.service';
import { ErrorResponse } from 'src/common/api-response/errors';
import { FriendshipUpdateNotificationDto } from './dto/responses/friendship-update-notification.dto';
import { NotificationWsService } from '../websocket/notification.service';

@Controller('friendships')
@UseGuards(JwtAuthGuard)
export class FriendshipController {
  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly userService: UserService,
    private readonly notificationWsService: NotificationWsService,
  ) {}

  @Post('requests/:receiverId')
  async sendRequest(
    @CurrentUser('id') senderId: string,
    @Param('receiverId') receiverId: string,
    @Body() body: { requestMessage?: string },
  ): Promise<SuccessResponse<FriendRequestResponseDto>> {
    const sentRequest = await this.friendshipService.sendRequest(
      senderId,
      receiverId,
      body.requestMessage,
    );

    // Notify receiver
    this.notificationWsService.notifyFriendRequest(receiverId, sentRequest);
    return new SuccessResponse(sentRequest, 'Friend request sent successfully');
  }

  @Patch('requests/:friendshipId')
  async respondToRequest(
    @CurrentUser('id') receiverId: string,
    @Param('friendshipId') friendshipId: string,
    @Body() body: RespondToRequestDto,
  ): Promise<SuccessResponse<FriendshipUpdateNotificationDto>> {
    // Changed return type
    // 1. Update friendship status
    const friendship = await this.friendshipService.respondToRequest(
      receiverId,
      friendshipId,
      body.status,
    );

    // 2. Prepare notification data
    const receiver = await this.userService.getUserById(receiverId);
    if (!receiver) {
      ErrorResponse.notFound('Receiver not found!');
    }

    // 3. Create the response DTO
    const response = plainToInstance(
      FriendshipUpdateNotificationDto,
      {
        friendshipId,
        status: body.status,
        firstName: receiver.firstName,
        userId: receiverId,
        timestamp: new Date().toISOString(),
      },
      {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      },
    );

    // 4. Notify if accepted
    if (body.status === FriendshipStatus.ACCEPTED) {
      this.notificationWsService.notifyFriendshipUpdate(
        (friendship as { senderId: string }).senderId,
        response, // Reuse the same DTO instance
      );
    }

    // 5. Return the notification DTO as response
    return new SuccessResponse(
      response,
      body.status === FriendshipStatus.ACCEPTED
        ? 'Friend request accepted successfully'
        : 'Friend request declined successfully',
    );
  }

  @Get()
  async getFriends(
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<FriendshipResponseDto[]>> {
    const friendships = await this.friendshipService.getFriends(userId);

    return new SuccessResponse(
      plainToInstance(FriendshipResponseDto, friendships),
      'Friends retrieved successfully',
    );
  }

  @Get('requests/pending')
  async getPendingRequests(
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<FriendRequestResponseDto[]>> {
    const requests = await this.friendshipService.getPendingRequests(userId);

    return new SuccessResponse(
      requests,
      'Pending friend requests retrieved successfully',
    );
  }

  @Get('status/:otherUserId')
  async getFriendshipStatus(
    @CurrentUser('id') currentUserId: string,
    @Param('otherUserId') otherUserId: string,
  ): Promise<SuccessResponse<FriendshipStatus | null>> {
    const status = await this.friendshipService.getFriendshipStatus(
      currentUserId,
      otherUserId,
    );

    return new SuccessResponse(
      status,
      'Friendship status retrieved successfully',
    );
  }

  @Delete(':friendshipId/:receiverId')
  async deleteFriendRequest(
    @CurrentUser('id') currentUserId: string,
    @Param('friendshipId') friendshipId: string,
    @Param('receiverId') receiverId: string,
  ): Promise<SuccessResponse<Friendship>> {
    const deletedFriendship = await this.friendshipService.deleteFriendship(
      friendshipId,
      currentUserId,
    );

    if (receiverId) {
      this.notificationWsService.notifyCancelFriendRequest(
        friendshipId,
        receiverId,
        currentUserId,
      );
    }

    return new SuccessResponse(
      deletedFriendship,
      'Friendship deleted successfully',
    );
  }

  @Delete('by-userid/:userId')
  async deleteByUserId(
    @CurrentUser('id') currentUserId: string,
    @Param('userId') userId: string,
  ): Promise<SuccessResponse<Friendship>> {
    const deletedFriendship =
      await this.friendshipService.deleteFriendshipByUserId(
        userId,
        currentUserId,
      );

    return new SuccessResponse(
      deletedFriendship,
      'Friendship deleted successfully',
    );
  }
}
