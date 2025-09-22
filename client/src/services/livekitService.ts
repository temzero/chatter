import {
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  ConnectionState,
  LocalTrackPublication,
} from "livekit-client";

export interface LiveKitServiceOptions {
  audio?: boolean;
  video?: boolean;
  onParticipantConnected?: (participant: RemoteParticipant) => void;
  onParticipantDisconnected?: (participant: RemoteParticipant) => void;
  onTrackSubscribed?: (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => void;
  onTrackUnsubscribed?: (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => void;
  onLocalTrackPublished?: (publication: LocalTrackPublication) => void;
  onLocalTrackUnpublished?: (publication: LocalTrackPublication) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
  onError?: (error: Error) => void;
}

export class LiveKitService {
  private room: Room;
  private options?: LiveKitServiceOptions;
  private url: string = import.meta.env.VITE_LIVEKIT_WS_URL;

  constructor() {
    this.room = new Room({ adaptiveStream: true, dynacast: true });
  }

  async connect(token: string, options: LiveKitServiceOptions) {
    this.options = options;

    try {
      this.setupEventListeners();

      await this.room.connect(this.url, token, { autoSubscribe: true });

      this.handleExistingParticipants();
    } catch (error) {
      this.options?.onError?.(error as Error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.room.disconnect();
    } catch (error) {
      this.options?.onError?.(error as Error);
    } finally {
      this.removeEventListeners();
    }
  }

  async setMicrophoneEnabled(enabled: boolean): Promise<boolean> {
    try {
      await this.room.localParticipant.setMicrophoneEnabled(enabled);
      return true;
    } catch (error) {
      console.error("Failed to set microphone:", error);
      return false;
    }
  }

  async setCameraEnabled(enabled: boolean): Promise<boolean> {
    try {
      await this.room.localParticipant.setCameraEnabled(enabled);
      return true;
    } catch (error) {
      console.error("Failed to set camera:", error);
      return false;
    }
  }

  async setScreenShareEnabled(enabled: boolean): Promise<boolean> {
    try {
      await this.room.localParticipant.setScreenShareEnabled(enabled);
      return true;
    } catch (error) {
      console.error("Failed to set screen share:", error);
      return false;
    }
  }

  // --- Getters ---
  getParticipants() {
    return Array.from(this.room.remoteParticipants.values());
  }

  getLocalParticipant() {
    return this.room.localParticipant;
  }

  getRoom() {
    return this.room;
  }

  getConnectionState() {
    return this.room.state;
  }

  // --- Private methods ---

  private setupEventListeners() {
    this.room
      .on(RoomEvent.Connected, async () => {
        console.log("✅ Connected to LiveKit room");
        this.handleExistingParticipants();

        if (this.options?.audio) {
          await this.setMicrophoneEnabled(true);
        }
        if (this.options?.video) {
          await this.setCameraEnabled(true);
        }
      })
      .on(RoomEvent.ParticipantConnected, (participant) => {
        this.options?.onParticipantConnected?.(participant);
      })
      .on(RoomEvent.ParticipantDisconnected, (participant) => {
        this.options?.onParticipantDisconnected?.(participant);
      })
      .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        this.options?.onTrackSubscribed?.(track, publication, participant);
      })
      .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        this.options?.onTrackUnsubscribed?.(track, publication, participant);
      })
      .on(RoomEvent.ConnectionStateChanged, (state) => {
        console.log("🔄 Connection state:", state);
        this.options?.onConnectionStateChange?.(state);
      })
      .on(RoomEvent.LocalTrackPublished, (publication) => {
        this.options?.onLocalTrackPublished?.(publication);
      })
      .on(RoomEvent.LocalTrackUnpublished, (publication) => {
        this.options?.onLocalTrackUnpublished?.(publication);
      });
  }

  private removeEventListeners() {
    this.room.removeAllListeners();
  }

  private handleExistingParticipants() {
    for (const participant of this.getParticipants()) {
      this.options?.onParticipantConnected?.(participant);

      participant.trackPublications.forEach(
        (publication: RemoteTrackPublication) => {
          if (publication.isSubscribed && publication.track) {
            this.options?.onTrackSubscribed?.(
              publication.track,
              publication,
              participant
            );
          }
        }
      );
    }
  }
}

export { RoomEvent };
