import { ChatResponse } from "@/types/responses/chat.response";
import { useCallStore } from "@/stores/callStore/callStore";
import { useLocalTracks } from "@/hooks/mediaStreams/useLocalTracks";
import { RemoteParticipant, RoomEvent } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { ParticipantsGrid } from "./ParticipantsGrid";
import { CallControls } from "./CallControls";
import { CallHeader } from "../CallHeader";
import { DraggableContainer } from "./DraggableContainer";
import { UserCamera } from "./UserCamera";
import { Button } from "@/components/ui/Button";
import { Timer } from "@/components/ui/Timer";

export const CallRoom = ({
  chat,
  isExpanded,
  onToggleExpand,
}: {
  chat: ChatResponse;
  isExpanded: boolean;
  onToggleExpand?: () => void;
}) => {
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

  const handleLeaveCall = async () => {
    leaveCall();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center text-white"
    >
      {/* Header info */}
      {/* <CallInfo chat={chat} memberCount={memberCount} startedAt={startedAt} /> */}
      <div className="absolute left-2 top-1" style={{ zIndex: 2 }}>
        {chat.name}
        {memberCount > 1 && (
          <span>
            🔸
            <span className="opacity-60">{memberCount + 1}</span>
          </span>
        )}
      </div>
      <div className="absolute bottom-1 right-2" style={{ zIndex: 2 }}>
        {startedAt && <Timer startTime={startedAt} />}
      </div>

      {memberCount > 0 ? (
        <ParticipantsGrid participants={participants} />
      ) : (
        <CallHeader
          chat={chat}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-1"
        />
      )}

      {/* Local video preview */}
      <DraggableContainer containerRef={containerRef} position="bottom-right">
        <UserCamera
          videoStream={localVideoStream}
          audioStream={localAudioStream}
        />
      </DraggableContainer>

      <div className="flex gap-2 absolute top-1 right-1">
        <Button
          variant="ghost"
          className="w-8 h-8 opacity-70"
          isIconFilled={true}
          isRoundedFull
          onClick={onToggleExpand}
          icon={isExpanded ? "collapse_content" : "expand_content"}
        />
      </div>

      {/* Controls */}
      <DraggableContainer containerRef={containerRef} position="bottom-middle">
        <CallControls
          isVideoEnabled={!!localVideoStream}
          isMuted={!localAudioStream}
          audioStream={localAudioStream}
          onLeaveCall={handleLeaveCall}
        />
      </DraggableContainer>
    </div>
  );
};
