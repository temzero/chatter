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
  LocalVideoTrack,
  LocalAudioTrack,
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

  async publishExistingAudioTrack(voiceStream: MediaStream): Promise<void> {
    try {
      const audioTracks = voiceStream.getAudioTracks();
      if (audioTracks.length === 0) {
        console.warn("No audio tracks found in voice stream");
        return;
      }

      for (const track of audioTracks) {
        // Create LocalAudioTrack from existing MediaStreamTrack
        const localAudioTrack = new LocalAudioTrack(track, {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        });

        await this.room.localParticipant.publishTrack(localAudioTrack);
        this.localTracks.push(localAudioTrack);
        console.log("Audio track published successfully");
      }
    } catch (error) {
      console.error("Error publishing audio track:", error);
      throw error;
    }
  }

  async publishExistingVideoTrack(videoStream: MediaStream): Promise<void> {
    try {
      const videoTracks = videoStream.getVideoTracks();
      if (videoTracks.length === 0) {
        console.warn("No video tracks found in video stream");
        return;
      }

      for (const track of videoTracks) {
        // Create LocalVideoTrack from existing MediaStreamTrack
        const localVideoTrack = new LocalVideoTrack(track, {
          resolution: { width: 1280, height: 720 },
          frameRate: 30,
        });

        await this.room.localParticipant.publishTrack(localVideoTrack);
        this.localTracks.push(localVideoTrack);
        console.log("Video track published successfully");
      }
    } catch (error) {
      console.error("Error publishing video track:", error);
      throw error;
    }
  }

  // Also update your toggle methods to handle existing streams
  async toggleAudio(enabled: boolean, existingStream?: MediaStream | null) {
    if (enabled && existingStream) {
      // Use existing stream if provided
      await this.publishExistingAudioTrack(existingStream);
    } else if (enabled) {
      // Create new stream if no existing stream
      await this.room.localParticipant.setMicrophoneEnabled(true);
    } else {
      // Disable audio
      await this.room.localParticipant.setMicrophoneEnabled(false);
    }
  }

  async toggleVideo(enabled: boolean, existingStream?: MediaStream | null) {
    if (enabled && existingStream) {
      // Use existing stream if provided
      await this.publishExistingVideoTrack(existingStream);
    } else if (enabled) {
      // Create new stream if no existing stream
      await this.room.localParticipant.setCameraEnabled(true);
    } else {
      // Disable video
      await this.room.localParticipant.setCameraEnabled(false);
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
