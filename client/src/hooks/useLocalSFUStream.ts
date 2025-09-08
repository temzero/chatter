// hooks/useLocalSFUStreams.ts
import { useEffect, useState } from "react";
import { useSFUCallStore } from "@/stores/callStore/sfuCallStore";

export const useLocalSFUStreams = () => {
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(
    null
  );
  const [localAudioStream, setLocalAudioStream] = useState<MediaStream | null>(
    null
  );
  const liveKitService = useSFUCallStore((state) => state.liveKitService);

  useEffect(() => {
    if (!liveKitService) return;

    const localParticipant = liveKitService.getLocalParticipant();

    const updateStreams = () => {
      // Video streams (excluding screen share)
      const videoTracks = Array.from(
        localParticipant.trackPublications.values()
      )
        .filter(
          (pub) =>
            pub.kind === "video" && pub.track && pub.source !== "screen_share"
        )
        .map((pub) => pub.track!.mediaStreamTrack);

      setLocalVideoStream(
        videoTracks.length > 0 ? new MediaStream(videoTracks) : null
      );

      // Audio streams
      const audioTracks = Array.from(
        localParticipant.trackPublications.values()
      )
        .filter((pub) => pub.kind === "audio" && pub.track)
        .map((pub) => pub.track!.mediaStreamTrack);

      setLocalAudioStream(
        audioTracks.length > 0 ? new MediaStream(audioTracks) : null
      );
    };

    updateStreams();

    // Listen for changes
    const handleTrackChange = () => updateStreams();
    localParticipant.on("localTrackPublished", handleTrackChange);
    localParticipant.on("localTrackUnpublished", handleTrackChange);

    return () => {
      localParticipant.off("localTrackPublished", handleTrackChange);
      localParticipant.off("localTrackUnpublished", handleTrackChange);
    };
  }, [liveKitService]);

  return { localVideoStream, localAudioStream };
};
