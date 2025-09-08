// hooks/useLocalStreams.ts
import { useState, useEffect } from "react";
import { useCallStore } from "@/stores/callStore/callStore";
import { useSFUCallStore } from "@/stores/callStore/sfuCallStore";
import { useP2PCallStore } from "@/stores/callStore/p2pCallStore";
import { Track } from "livekit-client";

export const useLocalStreams = () => {
  const { isGroupCall } = useCallStore();
  const { liveKitService } = useSFUCallStore();
  const { localVoiceStream, localVideoStream: p2pLocalVideoStream } =
    useP2PCallStore();

  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(
    null
  );
  const [localAudioStream, setLocalAudioStream] = useState<MediaStream | null>(
    null
  );

  useEffect(() => {
    if (!isGroupCall || !liveKitService) {
      setLocalVideoStream(null);
      setLocalAudioStream(null);
      return;
    }

    const checkTracks = () => {
      const localParticipant = liveKitService.getLocalParticipant();
      if (!localParticipant) return;

      // Check for video track
      const videoPublication = localParticipant.getTrackPublication(
        Track.Source.Camera
      );
      if (videoPublication?.track?.mediaStreamTrack) {
        const videoStream = new MediaStream();
        videoStream.addTrack(videoPublication.track.mediaStreamTrack);
        setLocalVideoStream(videoStream);
      } else {
        setLocalVideoStream(null);
      }

      // Check for audio track
      const audioPublication = localParticipant.getTrackPublication(
        Track.Source.Microphone
      );
      if (audioPublication?.track?.mediaStreamTrack) {
        const audioStream = new MediaStream();
        audioStream.addTrack(audioPublication.track.mediaStreamTrack);
        setLocalAudioStream(audioStream);
      } else {
        setLocalAudioStream(null);
      }
    };

    // Check initially
    checkTracks();

    // Set up interval to check for tracks (they might be published later)
    const interval = setInterval(checkTracks, 1000);

    return () => clearInterval(interval);
  }, [isGroupCall, liveKitService]);

  // Return appropriate streams based on call type
  if (isGroupCall) {
    return {
      localVideoStream,
      localAudioStream,
    };
  } else {
    return {
      localVideoStream: p2pLocalVideoStream,
      localAudioStream: localVoiceStream,
    };
  }
};
