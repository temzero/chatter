// hooks/useLocalStreams.ts
import { useState, useEffect, useRef } from "react";
import { useCallStore } from "@/stores/callStore/callStore";
import { useSFUCallStore } from "@/stores/callStore/sfuCallStore";
import { useP2PCallStore } from "@/stores/callStore/p2pCallStore";
import { Track, LocalTrackPublication, RoomEvent } from "livekit-client";

export const useLocalStreams = () => {
  const { isGroupCall, isVideoEnabled } = useCallStore();
  const { liveKitService } = useSFUCallStore();
  const { localVoiceStream, localVideoStream: p2pLocalVideoStream } =
    useP2PCallStore();

  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(
    null
  );
  const [localAudioStream, setLocalAudioStream] = useState<MediaStream | null>(
    null
  );

  // persistent refs to reuse the same MediaStream objects
  const videoStreamRef = useRef<MediaStream>(new MediaStream());
  const audioStreamRef = useRef<MediaStream>(new MediaStream());

  useEffect(() => {
    if (!isGroupCall || !liveKitService) {
      setLocalVideoStream(null);
      setLocalAudioStream(null);
      return;
    }

    const localParticipant = liveKitService.getLocalParticipant();
    if (!localParticipant) return;

    const attachTrack = (pub: LocalTrackPublication | undefined) => {
      if (!pub?.track?.mediaStreamTrack) return;

      const track = pub.track.mediaStreamTrack;

      if (pub.source === Track.Source.Camera) {
        videoStreamRef.current
          .getVideoTracks()
          .forEach((t) => videoStreamRef.current.removeTrack(t));
        videoStreamRef.current.addTrack(track);
        setLocalVideoStream(videoStreamRef.current); // same object
      }

      if (pub.source === Track.Source.Microphone) {
        audioStreamRef.current
          .getAudioTracks()
          .forEach((t) => audioStreamRef.current.removeTrack(t));
        audioStreamRef.current.addTrack(track);
        setLocalAudioStream(audioStreamRef.current); // same object
      }
    };

    // attach initial tracks
    attachTrack(localParticipant.getTrackPublication(Track.Source.Camera));
    attachTrack(localParticipant.getTrackPublication(Track.Source.Microphone));

    // subscribe to track events (LiveKit fires when toggling / publishing)
    const handleTrackPublished = (pub: LocalTrackPublication) =>
      attachTrack(pub);
    const handleTrackUnpublished = (pub: LocalTrackPublication) => {
      if (pub.source === Track.Source.Camera) {
        videoStreamRef.current
          .getVideoTracks()
          .forEach((t) => videoStreamRef.current.removeTrack(t));
      }
      if (pub.source === Track.Source.Microphone) {
        audioStreamRef.current
          .getAudioTracks()
          .forEach((t) => audioStreamRef.current.removeTrack(t));
      }
    };

    localParticipant.on(RoomEvent.LocalTrackPublished, handleTrackPublished);
    localParticipant.on(
      RoomEvent.LocalTrackUnpublished,
      handleTrackUnpublished
    );

    return () => {
      localParticipant.off(RoomEvent.LocalTrackPublished, handleTrackPublished);
      localParticipant.off(
        RoomEvent.LocalTrackUnpublished,
        handleTrackUnpublished
      );
    };
  }, [isGroupCall, liveKitService, isVideoEnabled]);

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
