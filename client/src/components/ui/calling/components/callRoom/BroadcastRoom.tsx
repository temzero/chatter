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
import { VideoStream } from "../VideoStream";
import CallMember from "./CallMember";

export const BroadcastRoom = ({ chat }: { chat: ChatResponse }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isCaller = useCallStore((state) => state.isCaller);
  const initiatorUserId = useCallStore((state) => state.initiatorUserId);
  const startedAt = useCallStore((state) => state.startedAt);
  const room = useCallStore((state) => state.getLiveKitRoom());
  const leaveCall = useCallStore((state) => state.leaveCall);

  const { localVideoStream, localAudioStream, localScreenStream } =
    useLocalTracks();
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

  const localParticipant = room.localParticipant;
  const isMuted = !localParticipant?.isMicrophoneEnabled;
  const isVideoEnabled = !!localParticipant?.isCameraEnabled;
  const isScreenshare = !!localParticipant?.isScreenShareEnabled;

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
      className="relative w-full h-full flex flex-col items-center text-white"
    >
      {/* Header info */}
      <CallHeaderInfo
        chat={chat}
        memberCount={participants.length}
        startedAt={startedAt}
      />

      {participants.length > 0 && (
        <div className="flex border-2 w-full">
          {participants.map((participant) => (
            <CallMember key={participant.identity} participant={participant} />
          ))}
        </div>
      )}

      {/* Local video preview */}
      {localScreenStream ? (
        <VideoStream
          stream={localScreenStream}
          className="w-full h-full"
          muted
        />
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
        isScreenshare={isCaller && isScreenshare}
        isEnableScreenshare={isCaller}
        audioStream={localAudioStream}
        onLeaveCall={handleLeaveCall}
        containerRef={containerRef}
      />
    </div>
  );
};
