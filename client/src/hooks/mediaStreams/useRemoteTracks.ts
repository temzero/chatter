// hooks/useRemoteTracks.ts
import { useEffect, useState } from "react";
import { Participant, Track } from "livekit-client";

export const useRemoteTracks = (participant: Participant) => {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const updateStreams = () => {
      // Video tracks (camera)
      const videoTracks = Array.from(participant.trackPublications.values())
        .filter(
          (pub) =>
            pub.kind === "video" &&
            pub.track &&
            pub.source === Track.Source.Camera
        )
        .map((pub) => pub.track!.mediaStreamTrack);

      setVideoStream(
        videoTracks.length > 0 ? new MediaStream(videoTracks) : null
      );

      // Audio tracks
      const audioTracks = Array.from(participant.trackPublications.values())
        .filter(
          (pub) =>
            pub.kind === "audio" &&
            pub.track &&
            pub.source === Track.Source.Microphone
        )
        .map((pub) => pub.track!.mediaStreamTrack);

      setAudioStream(
        audioTracks.length > 0 ? new MediaStream(audioTracks) : null
      );

      // Screen share tracks
      const screenTracks = Array.from(participant.trackPublications.values())
        .filter(
          (pub) =>
            pub.kind === "video" &&
            pub.track &&
            pub.source === Track.Source.ScreenShare
        )
        .map((pub) => pub.track!.mediaStreamTrack);

      setScreenStream(
        screenTracks.length > 0 ? new MediaStream(screenTracks) : null
      );
    };

    updateStreams();

    // Listen for track changes from this remote participant
    const events = [
      "trackPublished",
      "trackUnpublished",
      "trackSubscribed",
      "trackUnsubscribed",
    ] as const;

    events.forEach((event) => {
      participant.on(event, updateStreams);
    });

    return () => {
      events.forEach((event) => {
        participant.off(event, updateStreams);
      });
    };
  }, [participant]);

  return { videoStream, audioStream, screenStream };
};
