import { ChatResponse } from "@/types/responses/chat.response";
import { useCallStore } from "@/stores/callStore/callStore";
import { useLocalTracks } from "@/hooks/mediaStreams/useLocalTracks";
import { RemoteParticipant, RoomEvent } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { CallControls } from "../callRoom/CallControls";
import { BroadcastInfo } from "./BroadCastInfo";
import { Button } from "@/components/ui/Button";
import BroadcastStream from "./BroadcastStream";
import { LocalStreamPreview } from "./LocalStreamPreview";
import { DraggableContainer } from "../callRoom/DraggableContainer";

export const BroadcastRoom = ({
  chat,
  isExpanded,
  onToggleExpand,
}: {
  chat: ChatResponse;
  isExpanded: boolean;
  onToggleExpand?: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isCaller = useCallStore((state) => state.isCaller);
  const room = useCallStore((state) => state.getLiveKitRoom());
  const initiatorUserId = useCallStore((state) => state.initiatorUserId);
  const leaveCall = useCallStore((state) => state.leaveCall);
  const startedAt = useCallStore((state) => state.startedAt);

  const toggleLocalVideo = useCallStore((state) => state.toggleLocalVideo);
  const toggleLocalScreenShare = useCallStore(
    (state) => state.toggleLocalScreenShare
  );

  const { localVideoStream, localAudioStream, localScreenStream } =
    useLocalTracks();
  const [initiator, setInitiator] = useState<RemoteParticipant | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [isObjectCover, setObjectCover] = useState<boolean>(false);

  useEffect(() => {
    if (!room) return;

    // Get the initiator (should already be in the room)
    const initParticipant = Array.from(room.remoteParticipants.values()).find(
      (p) => p.identity === initiatorUserId
    );
    setInitiator(initParticipant || null);

    const handleConnected = (p: RemoteParticipant) => {
      setParticipants((prev) => [...prev, p]);
    };

    const handleDisconnected = (p: RemoteParticipant) => {
      setParticipants((prev) => prev.filter((x) => x.sid !== p.sid));
    };

    room
      .on(RoomEvent.ParticipantConnected, handleConnected)
      .on(RoomEvent.ParticipantDisconnected, handleDisconnected);

    return () => {
      room
        .off(RoomEvent.ParticipantConnected, handleConnected)
        .off(RoomEvent.ParticipantDisconnected, handleDisconnected);
    };
  }, [room, initiatorUserId, isCaller]);

  if (!room) return null;

  const handleLeaveCall = () => {
    [localVideoStream, localAudioStream, localScreenStream].forEach(
      (stream) => {
        console.log(stream?.getTracks());
        stream?.getTracks().forEach((track) => track.stop());
      }
    );

    // Leave the call (LiveKit disconnect + modal cleanup)
    leaveCall();
  };

  const participantCount = isCaller
    ? participants.length
    : participants.length + 1;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col items-center rounded-lg overflow-hidden text-white border-4 ${
        isCaller ? "border-[--primary-green]" : "border-[--border-color]"
      }`}
    >
      {isCaller ? (
        // CALLER
        <LocalStreamPreview
          containerRef={containerRef}
          localVideoStream={localVideoStream}
          localAudioStream={localAudioStream}
          localScreenStream={localScreenStream}
          isObjectCover={isObjectCover}
        />
      ) : (
        // VIEWER
        initiator && (
          <BroadcastStream
            participant={initiator}
            containerRef={containerRef}
            isObjectCover={isObjectCover}
            className="w-full h-full flex-1"
          />
        )
      )}

      {isCaller && !localVideoStream && !localScreenStream && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-6">
          <Button
            variant="transparent"
            className="w-64 text-white hover:text-black"
            size="lg"
            onClick={() => toggleLocalScreenShare()}
            icon="screen_share"
          >
            Sharing Screen
          </Button>
          <Button
            variant="transparent"
            className="w-64 text-white hover:text-black"
            size="lg"
            onClick={() => toggleLocalVideo()}
            icon="video_camera_front"
          >
            Camera
          </Button>
        </div>
      )}

      <div className="flex gap-2 absolute top-2 right-2">
        <Button
          variant="transparent"
          className="w-8 h-8 opacity-70 text-white"
          // isIconFilled={true}
          isRoundedFull
          onClick={() => setObjectCover((prev) => !prev)}
          icon={isObjectCover ? "picture_in_picture_center" : "aspect_ratio"}
        />
        <Button
          variant="transparent"
          className="w-8 h-8 opacity-70 text-white"
          isIconFilled={true}
          isRoundedFull
          onClick={onToggleExpand}
          icon={isExpanded ? "collapse_content" : "expand_content"}
        />
        {!isCaller && (
          <Button
            variant="transparent"
            className="w-8 h-8 opacity-70 text-white hover:bg-red-500"
            isIconFilled={true}
            isRoundedFull
            onClick={handleLeaveCall}
            icon="close"
          />
        )}
      </div>

      {isCaller && (
        <DraggableContainer
          containerRef={containerRef}
          position="bottom-middle"
        >
          <CallControls
            isVideoEnabled={!!localVideoStream}
            isMuted={!localAudioStream}
            isScreenshare={!!localScreenStream}
            isEnableScreenshare={true}
            audioStream={localAudioStream}
            onLeaveCall={handleLeaveCall}
          />
        </DraggableContainer>
      )}

      {/* Broadcast info */}
      <BroadcastInfo
        chat={chat}
        participantCount={participantCount}
        startedAt={startedAt}
      />
    </div>
  );
};
