import { useEffect, useState } from "react";
import {
  Participant,
  RemoteVideoTrack,
  RemoteAudioTrack,
  Track,
} from "livekit-client";

export const useRemoteTracks = (participant: Participant) => {
  const [videoTrack, setVideoTrack] = useState<RemoteVideoTrack | null>(null);
  const [audioTrack, setAudioTrack] = useState<RemoteAudioTrack | null>(null);
  const [screenTrack, setScreenTrack] = useState<RemoteVideoTrack | null>(null);

  useEffect(() => {
    const updateTracks = () => {
      // Camera video
      const cameraTrack = Array.from(
        participant.trackPublications.values()
      ).find(
        (pub) =>
          pub.kind === "video" &&
          pub.track instanceof RemoteVideoTrack &&
          pub.source === Track.Source.Camera
      )?.track as RemoteVideoTrack | undefined;

      setVideoTrack(cameraTrack || null);

      // Microphone audio
      const micTrack = Array.from(participant.trackPublications.values()).find(
        (pub) =>
          pub.kind === "audio" &&
          pub.track instanceof RemoteAudioTrack &&
          pub.source === Track.Source.Microphone
      )?.track as RemoteAudioTrack | undefined;

      setAudioTrack(micTrack || null);

      // Screen share
      const screen = Array.from(participant.trackPublications.values()).find(
        (pub) =>
          pub.kind === "video" &&
          pub.track instanceof RemoteVideoTrack &&
          pub.source === Track.Source.ScreenShare
      )?.track as RemoteVideoTrack | undefined;

      setScreenTrack(screen || null);
    };

    updateTracks();

    const events = [
      "trackPublished",
      "trackUnpublished",
      "trackSubscribed",
      "trackUnsubscribed",
    ] as const;

    events.forEach((event) => participant.on(event, updateTracks));

    return () => {
      events.forEach((event) => participant.off(event, updateTracks));
    };
  }, [participant]);

  return { videoTrack, audioTrack, screenTrack };
};
