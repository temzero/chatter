import { useEffect, useState } from "react";
import { useCallStore } from "@/stores/callStore";
import { Track } from "livekit-client";

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
      // Camera video tracks
      const videoTracks = Array.from(
        localParticipant.trackPublications.values()
      )
        .filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (pub: any) =>
            pub.kind === "video" &&
            pub.track &&
            pub.source === Track.Source.Camera
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((pub: any) => pub.track!.mediaStreamTrack);
      setLocalVideoStream(
        videoTracks.length > 0 ? new MediaStream(videoTracks) : null
      );

      // Microphone audio tracks
      const audioTracks = Array.from(
        localParticipant.trackPublications.values()
      )
        .filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (pub: any) =>
            pub.kind === "audio" &&
            pub.track &&
            pub.source === Track.Source.Microphone
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((pub: any) => pub.track!.mediaStreamTrack);
      setLocalAudioStream(
        audioTracks.length > 0 ? new MediaStream(audioTracks) : null
      );

      // Screen share tracks
      const screenTracks = Array.from(
        localParticipant.trackPublications.values()
      )
        .filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (pub: any) =>
            pub.kind === "video" &&
            pub.track &&
            pub.source === Track.Source.ScreenShare
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((pub: any) => pub.track!.mediaStreamTrack);
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

  return {
    localVideoStream,
    localAudioStream,
    localScreenStream,
  };
};
