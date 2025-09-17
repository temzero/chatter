// hooks/useLocalTracks.ts
import { useEffect, useState } from "react";
import { Track } from "livekit-client";
import { useCallStore } from "@/stores/callStore/callStore";

export const useLocalTracks = () => {
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(
    null
  );
  const [localAudioStream, setLocalAudioStream] = useState<MediaStream | null>(
    null
  );
  const [localScreenStream, setLocalScreenStream] =
    useState<MediaStream | null>(null);

  const liveKitService = useCallStore((state) => state.liveKitService);

  useEffect(() => {
    if (!liveKitService) return;

    const localParticipant = liveKitService.getLocalParticipant();

    const updateStreams = () => {
      // Camera video tracks (exclude screen share)
      const videoTracks = Array.from(
        localParticipant.trackPublications.values()
      )
        .filter(
          (pub) =>
            pub.kind === "video" &&
            pub.track &&
            pub.source === Track.Source.Camera
        )
        .map((pub) => pub.track!.mediaStreamTrack);

      setLocalVideoStream(
        videoTracks.length > 0 ? new MediaStream(videoTracks) : null
      );

      // Audio tracks (microphone)
      const audioTracks = Array.from(
        localParticipant.trackPublications.values()
      )
        .filter(
          (pub) =>
            pub.kind === "audio" &&
            pub.track &&
            pub.source === Track.Source.Microphone
        )
        .map((pub) => pub.track!.mediaStreamTrack);

      setLocalAudioStream(
        audioTracks.length > 0 ? new MediaStream(audioTracks) : null
      );

      // Screen share tracks
      const screenTracks = Array.from(
        localParticipant.trackPublications.values()
      )
        .filter(
          (pub) =>
            pub.kind === "video" &&
            pub.track &&
            pub.source === Track.Source.ScreenShare
        )
        .map((pub) => pub.track!.mediaStreamTrack);

      setLocalScreenStream(
        screenTracks.length > 0 ? new MediaStream(screenTracks) : null
      );
    };

    updateStreams();

    // Listen for changes
    const localEvents = [
      "localTrackPublished",
      "localTrackUnpublished",
    ] as const;
    localEvents.forEach((event) => localParticipant.on(event, updateStreams));

    return () => {
      localEvents.forEach((event) =>
        localParticipant.off(event, updateStreams)
      );
    };
  }, [liveKitService]);

  return { localVideoStream, localAudioStream, localScreenStream };
};
