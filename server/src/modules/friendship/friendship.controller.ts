import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FriendshipService } from './friendship.service';
import { SuccessResponse } from '../../common/api-response/success';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FriendshipResponseDto } from './dto/responses/friendship-response.dto';
import { FriendshipStatus } from './constants/friendship-status.constants';
import { RespondToRequestDto } from './dto/requests/response-to-request.dto';

@Controller('friendships')
@UseGuards(JwtAuthGuard)
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('requests/:receiverId')
  async sendRequest(
    @CurrentUser('id') senderId: string,
    @Param('receiverId') receiverId: string,
  ): Promise<SuccessResponse<FriendshipResponseDto>> {
    const friendship = await this.friendshipService.sendRequest(
      senderId,
      receiverId,
    );

    return new SuccessResponse(
      plainToInstance(FriendshipResponseDto, friendship),
      'Friend request sent successfully',
    );
  }

  @Patch('requests/:friendshipId')
  async respondToRequest(
    @CurrentUser('id') userId: string,
    @Param('friendshipId') friendshipId: string,
    @Body() body: RespondToRequestDto,
  ): Promise<SuccessResponse<FriendshipResponseDto>> {
    const friendship = await this.friendshipService.respondToRequest(
      userId,
      friendshipId,
      body.status,
    );

    return new SuccessResponse(
      plainToInstance(FriendshipResponseDto, friendship),
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
  ): Promise<SuccessResponse<FriendshipResponseDto[]>> {
    const requests = await this.friendshipService.getPendingRequests(userId);

    return new SuccessResponse(
      plainToInstance(FriendshipResponseDto, requests),
      'Pending friend requests retrieved successfully',
    );
  }

  @Get('status/:otherUserId')
  async getFriendshipStatus(
    @CurrentUser('id') currentUserId: string,
    @Param('otherUserId') otherUserId: string,
  ): Promise<SuccessResponse<{ status: FriendshipStatus | null }>> {
    const status = await this.friendshipService.getFriendshipStatus(
      currentUserId,
      otherUserId,
    );

    return new SuccessResponse(
      { status },
      'Friendship status retrieved successfully',
    );
  }
}
