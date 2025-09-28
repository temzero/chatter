import { ChatResponse } from "@/types/responses/chat.response";
import { useCallStore } from "@/stores/callStore/callStore";
import { useLocalTracks } from "@/hooks/mediaStreams/useLocalTracks";
import { RemoteParticipant, RoomEvent } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { ParticipantsGrid } from "./ParticipantsGrid";
import { LocalVideoPreview } from "./LocalVideoPreview";
import { CallHeaderInfo } from "./CallHeaderInfo";
import { CallControls } from "./CallControls";
import { CallHeader } from "../CallHeader";

export const CallRoom = ({ chat }: { chat: ChatResponse }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startedAt = useCallStore((state) => state.startedAt);
  const room = useCallStore((state) => state.getLiveKitRoom());
  const leaveCall = useCallStore((state) => state.leaveCall);

  const { localVideoStream, localAudioStream } = useLocalTracks();
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);

  useEffect(() => {
    if (!room) return;

    setParticipants(Array.from(room.remoteParticipants.values()));

    const handleConnected = (p: RemoteParticipant) =>
      setParticipants((prev) => [...prev, p]);

    const handleDisconnected = (p: RemoteParticipant) =>
      setParticipants((prev) => prev.filter((x) => x.sid !== p.sid));

    room
      .on(RoomEvent.ParticipantConnected, handleConnected)
      .on(RoomEvent.ParticipantDisconnected, handleDisconnected);

    return () => {
      room
        .off(RoomEvent.ParticipantConnected, handleConnected)
        .off(RoomEvent.ParticipantDisconnected, handleDisconnected);
    };
  }, [room]);

  if (!room) {
    console.warn("LiveKit room is not available");
    return null;
  }

  const memberCount = participants.length;
  const localParticipant = room.localParticipant;
  const isMuted = !localParticipant?.isMicrophoneEnabled;
  const isVideoEnabled = !!localParticipant?.isCameraEnabled;

  const handleLeaveCall = async () => {
    if (localParticipant) {
      localParticipant.getTrackPublications().forEach((pub) => {
        pub.track?.mediaStreamTrack?.stop();
      });
    }
    leaveCall();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center text-white"
    >
      {/* Header info */}
      <CallHeaderInfo
        chat={chat}
        memberCount={memberCount}
        startedAt={startedAt}
      />

      {memberCount > 0 ? (
        <ParticipantsGrid participants={participants} />
      ) : (
        <CallHeader
          chat={chat}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        />
      )}

      {/* Local video preview */}
      <LocalVideoPreview
        videoStream={localVideoStream}
        audioStream={localAudioStream}
        isVideoEnabled={isVideoEnabled}
        isMuted={isMuted}
        containerRef={containerRef}
      />

      {/* Controls */}
      <CallControls
        isVideoEnabled={isVideoEnabled}
        isMuted={isMuted}
        audioStream={localAudioStream}
        onLeaveCall={handleLeaveCall}
        containerRef={containerRef}
      />
    </div>
  );
};
