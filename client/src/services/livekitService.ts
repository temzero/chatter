import {
  Room,
  RoomEvent,
  RemoteParticipant,
  createLocalTracks,
  LocalTrack,
  RemoteTrack,
  RemoteTrackPublication,
  Track,
  ConnectionState,
  LocalTrackPublication,
  createLocalScreenTracks,
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
  private localTracks: LocalTrack[] = [];

  constructor() {
    this.room = new Room({ adaptiveStream: true, dynacast: true });
  }

  async connect(url: string, token: string, options: LiveKitServiceOptions) {
    this.options = options;

    try {
      this.setupEventListeners();

      await this.room.connect(url, token, { autoSubscribe: true });

      if (options.audio || options.video) {
        await this.publishLocalTracks(options.audio, options.video);
      }

      this.handleExistingParticipants();
    } catch (error) {
      this.options?.onError?.(error as Error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.unpublishAllLocalTracks();
      this.room.disconnect();
      this.removeEventListeners();
    } catch (error) {
      this.options?.onError?.(error as Error);
    }
  }

  async toggleAudio(enabled: boolean) {
    await this.room.localParticipant.setMicrophoneEnabled(enabled);
  }

  async toggleVideo(enabled: boolean) {
    await this.room.localParticipant.setCameraEnabled(enabled);
  }

  async toggleScreenShare(enabled: boolean) {
    if (enabled) {
      await this.startScreenShare();
    } else {
      await this.stopScreenShare();
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
      .on(RoomEvent.ParticipantConnected, (p) =>
        this.options?.onParticipantConnected?.(p)
      )
      .on(RoomEvent.ParticipantDisconnected, (p) =>
        this.options?.onParticipantDisconnected?.(p)
      )
      .on(RoomEvent.TrackSubscribed, (track, publication, participant) =>
        this.options?.onTrackSubscribed?.(track, publication, participant)
      )
      .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) =>
        this.options?.onTrackUnsubscribed?.(track, publication, participant)
      )
      .on(RoomEvent.ConnectionStateChanged, (state) =>
        this.options?.onConnectionStateChange?.(state)
      )
      .on(RoomEvent.LocalTrackPublished, (pub) =>
        this.options?.onLocalTrackPublished?.(pub)
      )
      .on(RoomEvent.LocalTrackUnpublished, (pub) =>
        this.options?.onLocalTrackUnpublished?.(pub)
      );
  }

  private removeEventListeners() {
    this.room.removeAllListeners();
  }

  private async publishLocalTracks(audio = false, video = false) {
    const tracks = await createLocalTracks({
      audio: audio ? { echoCancellation: true, noiseSuppression: true } : false,
      video: video
        ? { resolution: { width: 1280, height: 720 }, frameRate: 30 }
        : false,
    });

    this.localTracks = tracks;

    for (const track of tracks) {
      await this.room.localParticipant.publishTrack(track);
    }
  }

  private async unpublishAllLocalTracks() {
    for (const track of this.localTracks) {
      await this.room.localParticipant.unpublishTrack(track);
    }
    this.localTracks = [];
  }

  private async startScreenShare() {
    const screenTracks = await createLocalScreenTracks({
      audio: true,
      video: true,
    });
    for (const track of screenTracks) {
      await this.room.localParticipant.publishTrack(track);
      this.localTracks.push(track);
    }
  }

  private async stopScreenShare() {
    const screenTracks = this.localTracks.filter(
      (t) => t.source === Track.Source.ScreenShare
    );
    for (const track of screenTracks) {
      await this.room.localParticipant.unpublishTrack(track);
      this.localTracks = this.localTracks.filter((t) => t !== track);
      track.stop();
    }
  }

  private handleExistingParticipants() {
    for (const participant of this.getParticipants()) {
      this.options?.onParticipantConnected?.(participant);

      participant.trackPublications.forEach((pub: RemoteTrackPublication) => {
        if (pub.isSubscribed && pub.track) {
          this.options?.onTrackSubscribed?.(pub.track, pub, participant);
        }
      });
    }
  }
}

export { RoomEvent };
