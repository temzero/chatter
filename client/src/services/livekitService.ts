import {
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  ConnectionState,
  LocalTrackPublication,
  Track,
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

  async toggleMicrophone(enabled: boolean): Promise<boolean> {
    try {
      if (enabled) {
        await this.room.localParticipant.setMicrophoneEnabled(enabled);
      } else {
        const pub = this.room.localParticipant.getTrackPublication(
          Track.Source.Microphone
        );
        if (pub?.track) {
          this.room.localParticipant.unpublishTrack(pub.track);
        }
      }
      return true;
    } catch (error) {
      console.error("Failed to toggle microphone:", error);
      return false;
    }
  }

  async toggleCamera(enabled: boolean): Promise<boolean> {
    try {
      if (enabled) {
        await this.room.localParticipant.setCameraEnabled(true);
      } else {
        const pub = this.room.localParticipant.getTrackPublication(
          Track.Source.Camera
        );
        if (pub?.track) {
          this.room.localParticipant.unpublishTrack(pub.track);
        }
      }
      return true;
    } catch (error) {
      console.error("Failed to toggle camera:", error);
      return false;
    }
  }

  async toggleScreenShare(enabled: boolean): Promise<boolean> {
    try {
      if (enabled) {
        await this.room.localParticipant.setScreenShareEnabled(true);
      } else {
        const pub = this.room.localParticipant.getTrackPublication(
          Track.Source.ScreenShare
        );
        if (pub?.track) {
          this.room.localParticipant.unpublishTrack(pub.track);
        }
      }
      return true;
    } catch (error) {
      console.error("Failed to toggle screen share:", error);
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
        console.log("Local participant:", this.room.localParticipant.identity);

        // log remote participants
        console.log(
          "Remote participants:",
          Array.from(this.room.remoteParticipants.values()).map((p) => ({
            id: p.identity,
            name: p.name,
            tracks: Array.from(p.trackPublications.values()).map((pub) => ({
              source: pub.source,
              kind: pub.kind,
              isSubscribed: pub.isSubscribed,
            })),
          }))
        );

        this.handleExistingParticipants();

        if (this.options?.audio) {
          await this.toggleMicrophone(true);
        }
        if (this.options?.video) {
          await this.toggleCamera(true);
        }
      })
      .on(RoomEvent.ParticipantConnected, (participant) => {
        this.options?.onParticipantConnected?.(participant);
        // console.log("[ParticipantConnected]", participant.name);
        console.log("[ParticipantConnected]", {
          id: participant.identity,
          name: participant.name,
          tracks: Array.from(participant.trackPublications.values()).map(
            (pub) => ({
              source: pub.source,
              kind: pub.kind,
              isSubscribed: pub.isSubscribed,
            })
          ),
        });

        // const { callStatus, localCallStatus } = useCallStore.getState();
        // if (
        //   callStatus !== CallStatus.IN_PROGRESS &&
        //   localCallStatus !== LocalCallStatus.CONNECTED
        // ) {
        //   useCallStore.setState({
        //     callStatus: CallStatus.IN_PROGRESS,
        //     localCallStatus: LocalCallStatus.CONNECTED,
        //   });
        // }
      })
      .on(RoomEvent.ParticipantDisconnected, (participant) => {
        this.options?.onParticipantDisconnected?.(participant);
        console.log("[ParticipantDisconnected]", participant.name);
      })
      .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        this.options?.onTrackSubscribed?.(track, publication, participant);
        console.log("[TrackSubscribed]", {
          participant: participant.name,
          source: publication.source,
          kind: track.kind,
        });
      })
      .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        this.options?.onTrackUnsubscribed?.(track, publication, participant);
        console.log("[TrackUnsubscribed]", {
          participant: participant.name,
          source: publication.source,
        });
      })
      .on(RoomEvent.ConnectionStateChanged, (state) => {
        console.log("🔄 Connection state:", state);
        this.options?.onConnectionStateChange?.(state);
      })
      .on(RoomEvent.LocalTrackPublished, (publication) => {
        this.options?.onLocalTrackPublished?.(publication);
        console.log(
          "[LocalTrackPublished]",
          publication.source,
          publication.kind
        );
      })
      .on(RoomEvent.LocalTrackUnpublished, (publication) => {
        this.options?.onLocalTrackUnpublished?.(publication);
        console.log("[LocalTrackUnpublished]", publication.source);
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
