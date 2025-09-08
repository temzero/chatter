// hooks/useLocalStreams.ts
import { useEffect, useState } from "react";
import { useCallStore } from "@/stores/callStore/callStore";
import { useSFUCallStore } from "@/stores/callStore/sfuCallStore";
import { useP2PCallStore } from "@/stores/callStore/p2pCallStore";

export const useLocalStreams = () => {
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(
    null
  );
  const [localAudioStream, setLocalAudioStream] = useState<MediaStream | null>(
    null
  );

  const { isGroupCall } = useCallStore();
  const liveKitService = useSFUCallStore((state) => state.liveKitService);
  const { localVoiceStream, localVideoStream: p2pLocalVideoStream } =
    useP2PCallStore();

  // Handle SFU streams (extract from LiveKit)
  useEffect(() => {
    if (!isGroupCall || !liveKitService) return;

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
  }, [isGroupCall, liveKitService]);

  // Handle P2P streams (from P2P store)
  useEffect(() => {
    if (isGroupCall) return;

    setLocalAudioStream(localVoiceStream);
    setLocalVideoStream(p2pLocalVideoStream);
  }, [isGroupCall, localVoiceStream, p2pLocalVideoStream]);

  return { localVideoStream, localAudioStream };
};
