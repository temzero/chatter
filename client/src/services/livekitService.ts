import {
  Room,
  RoomEvent,
  RemoteParticipant,
  createLocalTracks,
  LocalTrack,
  RemoteTrack,
  RemoteTrackPublication,
  Track,
  TrackPublication,
  ParticipantEvent,
  ConnectionState,
} from "livekit-client";

export interface LiveKitServiceOptions {
  audio?: boolean;
  video?: boolean;
  onParticipantConnected?: (participant: RemoteParticipant) => void;
  onParticipantDisconnected?: (participant: RemoteParticipant) => void;
  onTrackSubscribed?: (
    track: MediaStreamTrack,
    participant: RemoteParticipant,
    kind: "audio" | "video"
  ) => void;
  onTrackUnsubscribed?: (
    track: MediaStreamTrack,
    participant: RemoteParticipant,
    kind: "audio" | "video"
  ) => void;
  onLocalTrackPublished?: (
    track: MediaStreamTrack,
    kind: "audio" | "video"
  ) => void;
  onLocalTrackUnpublished?: (
    track: MediaStreamTrack,
    kind: "audio" | "video"
  ) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
  onError?: (error: Error) => void;
}

export class LiveKitService {
  private room: Room;
  private options?: LiveKitServiceOptions;
  private localTracks: LocalTrack[] = [];

  constructor() {
    this.room = new Room({
      // Configure adaptive streaming and better performance
      adaptiveStream: true,
      dynacast: true,
    });
  }

  async connect(
    url: string,
    token: string,
    options: LiveKitServiceOptions
  ): Promise<void> {
    this.options = options;

    try {
      // Set up event listeners
      this.setupEventListeners();

      // Connect to the room
      await this.room.connect(url, token, {
        autoSubscribe: true, // Automatically subscribe to other participants' tracks
      });

      // Publish local tracks if requested
      if (options.audio || options.video) {
        await this.publishLocalTracks(options.audio, options.video);
      }

      // Process existing participants
      this.handleExistingParticipants();
    } catch (error) {
      this.options?.onError?.(error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      // Unpublish all local tracks first
      await this.unpublishAllLocalTracks();

      // Disconnect from room
      this.room.disconnect();

      // Remove all event listeners
      this.removeEventListeners();
    } catch (error) {
      this.options?.onError?.(error as Error);
    }
  }

  async toggleAudio(enabled: boolean): Promise<void> {
    try {
      await this.room.localParticipant.setMicrophoneEnabled(enabled);
    } catch (error) {
      this.options?.onError?.(error as Error);
      throw error;
    }
  }

  async toggleVideo(enabled: boolean): Promise<void> {
    try {
      await this.room.localParticipant.setCameraEnabled(enabled);
    } catch (error) {
      this.options?.onError?.(error as Error);
      throw error;
    }
  }

  async toggleScreenShare(enabled: boolean): Promise<void> {
    try {
      if (enabled) {
        await this.startScreenShare();
      } else {
        await this.stopScreenShare();
      }
    } catch (error) {
      this.options?.onError?.(error as Error);
      throw error;
    }
  }

  getParticipants(): RemoteParticipant[] {
    return Array.from(this.room.numParticipants.values());
  }

  getLocalParticipant() {
    return this.room.localParticipant;
  }

  getRoom(): Room {
    return this.room;
  }

  getConnectionState(): ConnectionState {
    return this.room.state;
  }

  // --- Private Methods ---

  private setupEventListeners(): void {
    // Room events
    this.room
      .on(
        RoomEvent.ParticipantConnected,
        this.handleParticipantConnected.bind(this)
      )
      .on(
        RoomEvent.ParticipantDisconnected,
        this.handleParticipantDisconnected.bind(this)
      )
      .on(RoomEvent.TrackSubscribed, this.handleTrackSubscribed.bind(this))
      .on(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed.bind(this))
      .on(
        RoomEvent.ConnectionStateChanged,
        this.handleConnectionStateChange.bind(this)
      )
      .on(
        RoomEvent.LocalTrackPublished,
        this.handleLocalTrackPublished.bind(this)
      )
      .on(
        RoomEvent.LocalTrackUnpublished,
        this.handleLocalTrackUnpublished.bind(this)
      );

    // Local participant events
    this.room.localParticipant
      .on(ParticipantEvent.TrackMuted, this.handleTrackMuted.bind(this))
      .on(ParticipantEvent.TrackUnmuted, this.handleTrackUnmuted.bind(this));
  }

  private removeEventListeners(): void {
    // Remove all room event listeners
    this.room
      .off(
        RoomEvent.ParticipantConnected,
        this.handleParticipantConnected.bind(this)
      )
      .off(
        RoomEvent.ParticipantDisconnected,
        this.handleParticipantDisconnected.bind(this)
      )
      .off(RoomEvent.TrackSubscribed, this.handleTrackSubscribed.bind(this))
      .off(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed.bind(this))
      .off(
        RoomEvent.ConnectionStateChanged,
        this.handleConnectionStateChange.bind(this)
      )
      .off(
        RoomEvent.LocalTrackPublished,
        this.handleLocalTrackPublished.bind(this)
      )
      .off(
        RoomEvent.LocalTrackUnpublished,
        this.handleLocalTrackUnpublished.bind(this)
      );
  }

  private async publishLocalTracks(
    audio: boolean = false,
    video: boolean = false
  ): Promise<void> {
    try {
      const tracks = await createLocalTracks({
        audio: audio
          ? { echoCancellation: true, noiseSuppression: true }
          : false,
        video: video
          ? {
              width: 1280,
              height: 720,
              frameRate: 30,
            }
          : false,
      });

      this.localTracks = tracks;

      for (const track of tracks) {
        await this.room.localParticipant.publishTrack(track);
      }
    } catch (error) {
      this.options?.onError?.(error as Error);
      throw error;
    }
  }

  private async unpublishAllLocalTracks(): Promise<void> {
    try {
      for (const track of this.localTracks) {
        await this.room.localParticipant.unpublishTrack(track);
      }
      this.localTracks = [];
    } catch (error) {
      this.options?.onError?.(error as Error);
    }
  }

  private async startScreenShare(): Promise<void> {
    try {
      const screenTracks = await createLocalTracks({
        video: {
          resolution: { width: 1920, height: 1080 },
          source: "screen",
        },
        audio: true, // Capture system audio if available
      });

      for (const track of screenTracks) {
        await this.room.localParticipant.publishTrack(track);
        this.localTracks.push(track);
      }
    } catch (error) {
      this.options?.onError?.(error as Error);
      throw error;
    }
  }

  private async stopScreenShare(): Promise<void> {
    try {
      const screenTracks = this.localTracks.filter(
        (track) => track.source === Track.Source.ScreenShare
      );

      for (const track of screenTracks) {
        await this.room.localParticipant.unpublishTrack(track);
        this.localTracks = this.localTracks.filter((t) => t !== track);
        track.stop();
      }
    } catch (error) {
      this.options?.onError?.(error as Error);
    }
  }

  private handleExistingParticipants(): void {
    // Handle participants already in the room when we connect
    for (const participant of this.getParticipants()) {
      this.options?.onParticipantConnected?.(participant);

      // Handle their existing tracks
      participant.tracks.forEach((publication) => {
        if (publication.isSubscribed && publication.track) {
          this.handleTrackSubscribed(
            publication.track,
            publication,
            participant
          );
        }
      });
    }
  }

  private handleParticipantConnected(participant: RemoteParticipant): void {
    this.options?.onParticipantConnected?.(participant);
  }

  private handleParticipantDisconnected(participant: RemoteParticipant): void {
    this.options?.onParticipantDisconnected?.(participant);
  }

  private handleTrackSubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ): void {
    if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
      const mediaStreamTrack = track.mediaStreamTrack;
      const kind = track.kind === Track.Kind.Video ? "video" : "audio";
      this.options?.onTrackSubscribed?.(mediaStreamTrack, participant, kind);
    }
  }

  private handleTrackUnsubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ): void {
    if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
      const mediaStreamTrack = track.mediaStreamTrack;
      const kind = track.kind === Track.Kind.Video ? "video" : "audio";
      this.options?.onTrackUnsubscribed?.(mediaStreamTrack, participant, kind);
    }
  }

  private handleLocalTrackPublished(track: LocalTrack): void {
    const kind = track.kind === Track.Kind.Video ? "video" : "audio";
    this.options?.onLocalTrackPublished?.(track.mediaStreamTrack, kind);
  }

  private handleLocalTrackUnpublished(track: LocalTrack): void {
    const kind = track.kind === Track.Kind.Video ? "video" : "audio";
    this.options?.onLocalTrackUnpublished?.(track.mediaStreamTrack, kind);
  }

  private handleConnectionStateChange(state: ConnectionState): void {
    this.options?.onConnectionStateChange?.(state);
  }

  private handleTrackMuted(publication: TrackPublication): void {
    // Handle local track muted events
    // You might want to notify the call store about mute state changes
  }

  private handleTrackUnmuted(publication: TrackPublication): void {
    // Handle local track unmuted events
  }
}
