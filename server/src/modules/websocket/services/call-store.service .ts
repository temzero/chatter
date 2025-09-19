import { Injectable } from '@nestjs/common';

@Injectable()
export class CallStoreService {
  // Maps
  private readonly userCallMap = new Map<string, string>(); // userId -> roomName
  private readonly callUserMap = new Map<string, Set<string>>(); // roomName -> userIds

  /** Add a user to a call */
  addUserToCall(userId: string, roomName: string) {
    this.userCallMap.set(userId, roomName);

    if (!this.callUserMap.has(roomName)) {
      this.callUserMap.set(roomName, new Set());
    }
    this.callUserMap.get(roomName)!.add(userId);
  }

  /** Remove a user from their call */
  removeUserFromCall(userId: string) {
    const roomName = this.userCallMap.get(userId);
    if (!roomName) return;

    this.userCallMap.delete(userId);

    const participants = this.callUserMap.get(roomName);
    if (!participants) return;

    participants.delete(userId);
    if (participants.size === 0) {
      this.callUserMap.delete(roomName); // remove empty call
    }
  }

  /** Remove all users from a call (end call) */
  removeAllUsersFromCall(roomName: string) {
    const participants = this.callUserMap.get(roomName);
    if (!participants) return;

    participants.forEach((userId) => {
      this.userCallMap.delete(userId);
    });

    this.callUserMap.delete(roomName);
  }

  /** Check if a user is in any call */
  isUserInCall(userId: string): boolean {
    return this.userCallMap.has(userId);
  }

  /** Get roomName for a user */
  getCallIdByUser(userId: string): string | undefined {
    return this.userCallMap.get(userId);
  }

  /** Get all participants of a call */
  getUsersInCall(roomName: string): Set<string> | undefined {
    return this.callUserMap.get(roomName);
  }
}
