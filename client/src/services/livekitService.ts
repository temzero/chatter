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
import { audioService, SoundType } from "./audio.service";

export interface LiveKitServiceOptions {
  audio?: boolean;
  video?: boolean;
  screen?: boolean;
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
  static getLocalParticipant() {
    throw new Error("Method not implemented.");
  }
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

  async toggleCamera(enabled: boolean, stream?: MediaStream): Promise<boolean> {
    try {
      const local = this.room.localParticipant;

      if (enabled) {
        if (stream) {
          const videoTrack = stream.getVideoTracks()[0];
          console.log("[LIVEKIT]", "cameraTrack", videoTrack);

          await local.publishTrack(videoTrack, {
            name: "camera",
            source: Track.Source.Camera,
            videoEncoding: {
              maxBitrate: 2500_000,
              maxFramerate: 30,
            },
          });
        } else {
          await local.setCameraEnabled(
            true,
            {
              resolution: { width: 1920, height: 1080 },
              frameRate: 30,
            },
            {
              videoEncoding: {
                maxBitrate: 2500_000,
                maxFramerate: 30,
              },
            }
          );
        }
      } else {
        const pub = local.getTrackPublication(Track.Source.Camera);
        if (pub?.track) {
          local.unpublishTrack(pub.track);
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to toggle camera:", error);
      return false;
    }
  }

  async toggleScreenShare(
    enabled: boolean,
    stream?: MediaStream
  ): Promise<boolean> {
    try {
      const local = this.room.localParticipant;

      if (enabled) {
        // If no stream was provided, request from browser with audio
        if (!stream) {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true, // request system audio too
          });
        }

        // ✅ publish video track
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          await local.publishTrack(videoTrack, {
            name: "screen-share",
            source: Track.Source.ScreenShare,
          });
        }

        // ✅ publish audio track if available
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          console.log("[LIVEKIT]", "Screen share includes audio 🎤");
          await local.publishTrack(audioTrack, {
            name: "screen-audio",
            source: Track.Source.ScreenShareAudio,
          });
        } else {
          console.log("No screen audio available ❌");
        }
      } else {
        // Unpublish both video & audio tracks when stopping
        const videoPub = local.getTrackPublication(Track.Source.ScreenShare);
        if (videoPub?.track) local.unpublishTrack(videoPub.track);

        const audioPub = local.getTrackPublication(
          Track.Source.ScreenShareAudio
        );
        if (audioPub?.track) local.unpublishTrack(audioPub.track);
      }

      return true;
    } catch (err) {
      console.error("Failed to toggle screen share:", err);
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
        console.log("[LIVEKIT]", "✅ Connected to LiveKit room");
        console.log(
          "[LIVEKIT]",
          "Local participant:",
          this.room.localParticipant.identity
        );

        // log remote participants
        console.log(
          "[LIVEKIT]",
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

        // if (this.options?.audio) {
        await this.toggleMicrophone(true);
        // }
        if (this.options?.video) {
          await this.toggleCamera(true);
        }
        if (this.options?.screen) {
          await this.toggleScreenShare(true);
        }
      })
      .on(RoomEvent.ParticipantConnected, (participant) => {
        audioService.playSound(SoundType.USER_CONNECTED); // join sound
        this.options?.onParticipantConnected?.(participant);
        console.log("LIVEKIT", "ParticipantConnected", participant.name);
      })
      .on(RoomEvent.ParticipantDisconnected, (participant) => {
        audioService.playSound(SoundType.USER_DISCONNECTED); // leave sound
        this.options?.onParticipantDisconnected?.(participant);
        console.log("LIVEKIT", "ParticipantDisconnected", participant.name);
      })
      .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        this.options?.onTrackSubscribed?.(track, publication, participant);
        console.log("LIVEKIT", "TrackSubscribed", {
          participant: participant.name,
          source: publication.source,
          kind: track.kind,
        });
      })
      .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        this.options?.onTrackUnsubscribed?.(track, publication, participant);
        console.log("LIVEKIT", "TrackUnsubscribed", {
          participant: participant.name,
          source: publication.source,
        });
      })
      .on(RoomEvent.ConnectionStateChanged, (state) => {
        console.log("LIVEKIT", "🔄 Connection state:", state);
        this.options?.onConnectionStateChange?.(state);
      })
      .on(RoomEvent.LocalTrackPublished, (publication) => {
        this.options?.onLocalTrackPublished?.(publication);
        console.log(
          "LIVEKIT",
          "LocalTrackPublished",
          publication.source,
          publication.kind
        );
      })
      .on(RoomEvent.LocalTrackUnpublished, (publication) => {
        this.options?.onLocalTrackUnpublished?.(publication);
        console.log("LIVEKIT", "LocalTrackUnpublished", publication.source);
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
