// livekit.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient, VideoGrant } from 'livekit-server-sdk';

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

  // async createRoom(roomName: string, metadata?: Record<string, any>) {
  //   try {
  //     const room = await this.roomService.createRoom({
  //       name: roomName,
  //       metadata: metadata ? JSON.stringify(metadata) : undefined,
  //     });
  //     return room;
  //   } catch (err) {
  //     throw new InternalServerErrorException(
  //       err instanceof Error ? err.message : 'Failed to create LiveKit room',
  //     );
  //   }
  // }

  async generateLivekitToken(
    roomName: string,
    userId: string,
    participantName?: string,
  ): Promise<string> {
    try {
      const at = new AccessToken(this.apiKey, this.apiSecret, {
        identity: userId,
        name: participantName,
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

  async getActiveRoomsForUser(userId: string, chatIds: string[]) {
    const rooms = await this.roomService.listRooms();

    // Only consider rooms that match chatIds
    const matchingRooms = rooms.filter((room) => chatIds.includes(room.name));

    // Keep rooms where the user has NOT joined yet
    const pendingRooms = await Promise.all(
      matchingRooms.map(async (room) => {
        const participants = await this.roomService.listParticipants(room.name);
        return participants.some((p) => p.identity === userId) ? null : room;
      }),
    );

    // Filter out null values
    const filteredRooms = pendingRooms.filter(
      (r): r is NonNullable<typeof r> => r !== null,
    );

    // Sort newest first (descending)
    return filteredRooms.sort(
      (a, b) => Number(b.creationTime) - Number(a.creationTime),
    );
  }
}
