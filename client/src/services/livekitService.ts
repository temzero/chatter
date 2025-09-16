import { useCallStore } from "@/stores/callStore/callStore";
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  ConnectionState,
  LocalTrackPublication,
  createLocalAudioTrack,
  createLocalVideoTrack,
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

  constructor() {
    this.room = new Room({ adaptiveStream: true, dynacast: true });
  }

  async connect(url: string, token: string, options: LiveKitServiceOptions) {
    this.options = options;

    try {
      this.setupEventListeners();

      await this.room.connect(url, token, { autoSubscribe: true });

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

  async toggleAudio(enabled: boolean) {
    try {
      if (enabled) {
        const hasMic = this.room.localParticipant
          .getTrackPublications()
          .find((p) => p.track?.kind === "audio");

        if (!hasMic) {
          const audioTrack = await createLocalAudioTrack();
          await this.room.localParticipant.publishTrack(audioTrack);
        }
      }

      await this.room.localParticipant.setMicrophoneEnabled(enabled);
      useCallStore.setState({ isMuted: !enabled });
      return true;
    } catch (error) {
      console.error("Failed to toggle audio:", error);
      return false;
    }
  }

  async toggleVideo(enabled: boolean) {
    try {
      if (enabled) {
        const hasCam = this.room.localParticipant
          .getTrackPublications()
          .find((p) => p.track?.kind === "video");

        if (!hasCam) {
          const videoTrack = await createLocalVideoTrack();
          await this.room.localParticipant.publishTrack(videoTrack);
        }
      }

      await this.room.localParticipant.setCameraEnabled(enabled);
      useCallStore.setState({ isVideoEnabled: enabled });
      return true;
    } catch (error) {
      console.error("Failed to toggle video:", error);
      return false;
    }
  }

  async toggleScreenShare(enabled: boolean) {
    try {
      await this.room.localParticipant.setScreenShareEnabled(enabled);
      useCallStore.setState({ isScreenSharing: enabled });
      return true;
    } catch (error) {
      console.error("Failed to toggle screen share:", error);
      return false;
    }
  }

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
          await this.toggleAudio(true);
        }
        if (this.options?.video) {
          await this.toggleVideo(true);
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
