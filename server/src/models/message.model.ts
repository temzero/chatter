/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { v4 as uuidv4 } from 'uuid';

export class Message {
  id: string; // Unique message ID
  chatId: string; // ID of the chat
  senderId: string; // ID of the user who sent the message
  content?: string; // Text content of the message
  media?: {
    // Optional media attachment
    type: 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'gif';
    url: string;
    thumbnailUrl?: string;
    size?: number; // in bytes
    duration?: number; // for audio/video in seconds
    width?: number; // for images/videos
    height?: number; // for images/videos
  };
  timestamp: Date; // When the message was sent
  editedTimestamp?: Date; // When the message was last edited
  status: 'sent' | 'delivered' | 'read' | 'failed'; // Delivery status
  isDeleted: boolean; // Whether the message was deleted
  deletedTimestamp?: Date; // When the message was deleted
  replyToMessageId?: string; // ID of the message this is replying to
  reactions?: {
    // User reactions to the message
    [userId: string]:
      | 'like'
      | 'love'
      | 'laugh'
      | 'wow'
      | 'sad'
      | 'angry'
      | string;
  };
  forwardInfo?: {
    // If the message was forwarded
    fromChatId?: string;
    fromMessageId?: string;
    originalSenderId?: string;
    timestamp?: Date;
  };
  metadata?: {
    // Additional metadata
    linkPreview?: {
      url: string;
      title?: string;
      description?: string;
      image?: string;
      siteName?: string;
    };
    mentions?: string[]; // User IDs mentioned in the message
    hashtags?: string[];
    isPinned?: boolean;
    pinnedBy?: string;
    pinnedTimestamp?: Date;
  };

  constructor(partial?: Partial<Message>) {
    if (partial) {
      Object.assign(this, partial);
      if (partial.timestamp && typeof partial.timestamp === 'string') {
        this.timestamp = new Date(partial.timestamp);
      }
      if (
        partial.editedTimestamp &&
        typeof partial.editedTimestamp === 'string'
      ) {
        this.editedTimestamp = new Date(partial.editedTimestamp);
      }
      if (
        partial.deletedTimestamp &&
        typeof partial.deletedTimestamp === 'string'
      ) {
        this.deletedTimestamp = new Date(partial.deletedTimestamp);
      }
    }

    // Default values
    this.id = this.id || this.generateId();
    this.timestamp = this.timestamp || new Date();
    this.status = this.status || 'sent';
    this.isDeleted = this.isDeleted || false;
  }

  private generateId(): string {
    return uuidv4();
  }

  // Helper methods
  edit(newContent: string): void {
    this.content = newContent;
    this.editedTimestamp = new Date();
  }

  delete(): void {
    this.isDeleted = true;
    this.deletedTimestamp = new Date();
  }

  addReaction(userId: string, reaction: string): void {
    if (!this.reactions) {
      this.reactions = {};
    }
    this.reactions[userId] = reaction;
  }

  removeReaction(userId: string): void {
    if (this.reactions && this.reactions[userId]) {
      delete this.reactions[userId];
    }
  }

  pin(byUserId: string): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata.isPinned = true;
    this.metadata.pinnedBy = byUserId;
    this.metadata.pinnedTimestamp = new Date();
  }

  unpin(): void {
    if (this.metadata) {
      this.metadata.isPinned = false;
      this.metadata.pinnedBy = undefined;
      this.metadata.pinnedTimestamp = undefined;
    }
  }
}
