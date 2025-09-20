// livekit.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AccessToken,
  Room,
  RoomServiceClient,
  VideoGrant,
} from 'livekit-server-sdk';

@Injectable()
export class LivekitService {
  private readonly roomService: RoomServiceClient;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('LIVEKIT_URL', '');
    this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY', '');
    this.apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET', '');

    if (!url || !this.apiKey || !this.apiSecret) {
      throw new Error('Missing LiveKit environment variables');
    }

    this.roomService = new RoomServiceClient(url, this.apiKey, this.apiSecret);
  }

  async generateLivekitToken(
    roomName: string,
    userId: string,
    participantName?: string,
    avatarUrl?: string,
  ): Promise<string> {
    try {
      const at = new AccessToken(this.apiKey, this.apiSecret, {
        identity: userId,
        name: participantName,
        metadata: avatarUrl ? JSON.stringify({ avatarUrl }) : undefined,
      });

      at.addGrant(<VideoGrant>{
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
      });

      return at.toJwt();
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error
          ? `Failed to generate LiveKit token: ${err.message}`
          : 'Unknown error while generating LiveKit token',
      );
    }
  }

  async getActiveRoomForChat(
    userId: string,
    chatId: string,
  ): Promise<Room | null> {
    try {
      const rooms = await this.roomService.listRooms();

      if (!rooms || rooms.length === 0) return null;

      // Find the room with the exact chatId
      const room = rooms.find((r) => r.name === chatId);

      if (!room) return null;

      // Check if user is already in this room
      try {
        const participants = await this.roomService.listParticipants(room.name);
        const isUserInRoom = participants.some((p) => p.identity === userId);

        // Return null if user is already in the room
        return isUserInRoom ? null : room;
      } catch (err) {
        console.error(`Failed to get participants for room ${room.name}:`, err);
        return null; // skip this room if participant check fails
      }
    } catch (error) {
      console.error('Failed to get active room for chat:', error);
      return null;
    }
  }

  async getActiveRoomsForUser(userId: string, chatIds: string[]) {
    const rooms = await this.roomService.listRooms();

    if (!rooms || rooms.length === 0) return [];

    const matchingRooms = rooms.filter((room) => chatIds.includes(room.name));

    const pendingRooms = await Promise.all(
      matchingRooms.map(async (room) => {
        try {
          const participants = await this.roomService.listParticipants(
            room.name,
          );
          return participants.some((p) => p.identity === userId) ? null : room;
        } catch (err) {
          console.error(
            `Failed to get participants for room ${room.name}:`,
            err,
          );
          return null; // skip this room if it fails
        }
      }),
    );

    const filteredRooms = pendingRooms.filter(
      (r): r is NonNullable<typeof r> => r !== null,
    );

    return filteredRooms.sort(
      (a, b) => Number(b.creationTime) - Number(a.creationTime),
    );
  }
}
