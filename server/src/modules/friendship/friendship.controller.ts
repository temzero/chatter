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
import { ResponseData } from '../../common/response-data';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FriendshipResponseDto } from './dto/responses/friendship-response.dto';
import { FriendshipStatus } from './constants/friendship-status.constants';
import { RespondToRequestDto } from './dto/requests/response-to-request.dto';

@Controller('friendships')
@UseGuards(JwtAuthGuard)
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('requests/:addresseeId')
  async sendRequest(
    @CurrentUser('id') userId: string,
    @Param('addresseeId') addresseeId: string,
  ): Promise<ResponseData<FriendshipResponseDto>> {
    const friendship = await this.friendshipService.sendRequest(
      userId,
      addresseeId,
    );

    return new ResponseData<FriendshipResponseDto>(
      plainToInstance(FriendshipResponseDto, friendship),
      HttpStatus.CREATED,
      'Friend request sent successfully',
    );
  }

  @Patch('requests/:friendshipId')
  async respondToRequest(
    @CurrentUser('id') userId: string,
    @Param('friendshipId') friendshipId: string,
    @Body() body: RespondToRequestDto,
  ): Promise<ResponseData<FriendshipResponseDto>> {
    const friendship = await this.friendshipService.respondToRequest(
      userId,
      friendshipId,
      body.status,
    );

    return new ResponseData<FriendshipResponseDto>(
      plainToInstance(FriendshipResponseDto, friendship),
      HttpStatus.OK,
      'Friend request responded successfully',
    );
  }

  @Get()
  async getFriends(
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<FriendshipResponseDto[]>> {
    const friendships = await this.friendshipService.getFriends(userId);

    return new ResponseData<FriendshipResponseDto[]>(
      plainToInstance(FriendshipResponseDto, friendships),
      HttpStatus.OK,
      'Friends retrieved successfully',
    );
  }

  @Get('requests/pending')
  async getPendingRequests(
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<FriendshipResponseDto[]>> {
    const requests = await this.friendshipService.getPendingRequests(userId);

    return new ResponseData<FriendshipResponseDto[]>(
      plainToInstance(FriendshipResponseDto, requests),
      HttpStatus.OK,
      'Pending friend requests retrieved successfully',
    );
  }

  @Get('status/:otherUserId')
  async getFriendshipStatus(
    @CurrentUser('id') currentUserId: string,
    @Param('otherUserId') otherUserId: string,
  ): Promise<ResponseData<{ status: FriendshipStatus | null }>> {
    const status = await this.friendshipService.getFriendshipStatus(
      currentUserId,
      otherUserId,
    );

    return new ResponseData(
      { status },
      HttpStatus.OK,
      'Friendship status retrieved successfully',
    );
  }
}
