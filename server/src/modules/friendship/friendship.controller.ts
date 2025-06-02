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
import {
  FriendRequestResDto,
  SentRequestResDto,
} from './dto/responses/friend-request-response.dto';
import { Friendship } from './entities/friendship.entity';

@Controller('friendships')
@UseGuards(JwtAuthGuard)
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('requests/:receiverId')
  async sendRequest(
    @CurrentUser('id') senderId: string,
    @Param('receiverId') receiverId: string,
    @Body() body: { requestMessage?: string },
  ): Promise<SuccessResponse<SentRequestResDto>> {
    const sentRequest = await this.friendshipService.sendRequest(
      senderId,
      receiverId,
      body.requestMessage,
    );

    return new SuccessResponse(sentRequest, 'Friend request sent successfully');
  }

  @Patch('requests/:friendshipId')
  async respondToRequest(
    @CurrentUser('id') receiverId: string,
    @Param('friendshipId') friendshipId: string,
    @Body() body: RespondToRequestDto,
  ): Promise<SuccessResponse<FriendshipResponseDto>> {
    const friendship = await this.friendshipService.respondToRequest(
      receiverId,
      friendshipId,
      body.status,
    );

    const response = plainToInstance(FriendshipResponseDto, friendship, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });

    console.log('friendship accepted: ', response);

    return new SuccessResponse(
      response,
      'Friend request responded successfully',
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
  ): Promise<SuccessResponse<FriendRequestResDto>> {
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

  @Delete(':id')
  async deleteFriendRequest(
    @CurrentUser('id') currentUserId: string,
    @Param('id') id: string,
  ): Promise<SuccessResponse<Friendship>> {
    const deletedFriendship = await this.friendshipService.deleteFriendship(
      id,
      currentUserId,
    );

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
