import { useCallStore } from "@/stores/callStore/callStore";
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

  constructor() {
    this.room = new Room({ adaptiveStream: true, dynacast: true });
  }

  async connect(url: string, token: string, options: LiveKitServiceOptions) {
    this.options = options;

    try {
      this.setupEventListeners();

      // Let LiveKit handle all media acquisition
      await this.room.connect(url, token, {
        autoSubscribe: true,
      });

      this.handleExistingParticipants();
    } catch (error) {
      this.options?.onError?.(error as Error);
      throw error;
    }
  }

  async disconnect() {
    try {
      this.room.disconnect();
    } catch (error) {
      this.options?.onError?.(error as Error);
    } finally {
      this.removeEventListeners(); // Ensure this always runs
    }
  }

  async toggleAudio(enabled: boolean) {
    try {
      await this.room.localParticipant.setMicrophoneEnabled(enabled);
      useCallStore.setState({
        isMuted: !enabled,
      });
      return true;
    } catch (error) {
      console.error("Failed to toggle audio:", error);
      return false;
    }
  }

  async toggleVideo(enabled: boolean) {
    try {
      await this.room.localParticipant.setCameraEnabled(enabled);
      useCallStore.setState({
        isVideoEnabled: enabled,
      });
      return true;
    } catch (error) {
      console.error("Failed to toggle video:", error);
      return false;
    }
  }

  async toggleScreenShare(enabled: boolean) {
    try {
      await this.room.localParticipant.setScreenShareEnabled(enabled);

      useCallStore.setState({
        isScreenSharing: enabled,
      });
      return true;
    } catch (error) {
      console.error("Failed to screen share:", error);
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
        console.log("SFU ROOM CONNECTED");

        // Handle existing participants and their already-subscribed tracks
        this.handleExistingParticipants();

        if (this.options?.audio) {
          console.log("🔊 Enabling mic after connected");
          await this.toggleAudio(true);
        }
        if (this.options?.video) {
          console.log("🎥 Enabling camera after connected");
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
        console.log("Connection state changed:", state);
        this.options?.onConnectionStateChange?.(state);
      })
      .on(RoomEvent.LocalTrackPublished, (publication) => {
        console.log(`Local track published: ${publication.trackSid}`);
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

      // Only handle tracks that are already subscribed
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
