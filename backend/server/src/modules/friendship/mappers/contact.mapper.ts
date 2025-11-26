// src/modules/friendship/mappers/friend-contact.mapper.ts

import { Friendship } from '../entities/friendship.entity';
import { ContactResponseDto } from '../dto/responses/friend-contact-response.dto';
import { plainToInstance } from 'class-transformer';

export function mapFriendshipToContactResDto(
  friendships: Friendship[],
  currentUserId: string,
): ContactResponseDto[] {
  return friendships.map((friendship) => {
    const friend =
      friendship.senderId === currentUserId
        ? friendship.receiver
        : friendship.sender;

    return plainToInstance(
      ContactResponseDto,
      {
        id: friendship.id,
        userId: friend.id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        avatarUrl: friend.avatarUrl,
        username: friend.username,
        phoneNumber: friend.phoneNumber,
      },
      { excludeExtraneousValues: true },
    );
  });
}
