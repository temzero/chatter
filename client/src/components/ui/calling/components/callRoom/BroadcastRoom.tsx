import { ChatResponse } from "@/types/responses/chat.response";
import { useCallStore } from "@/stores/callStore/callStore";
import { useLocalTracks } from "@/hooks/mediaStreams/useLocalTracks";
import { RemoteParticipant, RoomEvent } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { CallControls } from "./CallControls";
import { BroadcastInfo } from "./BroadCastInfo";
import { Button } from "@/components/ui/Button";
import BroadcastStream from "./BroadcastStream";
import { LocalStreamPreview } from "./LocalStreamPreview";

export const BroadcastRoom = ({ chat }: { chat: ChatResponse }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isCaller = useCallStore((state) => state.isCaller);
  const room = useCallStore((state) => state.getLiveKitRoom());
  const initiatorUserId = useCallStore((state) => state.initiatorUserId);
  const leaveCall = useCallStore((state) => state.leaveCall);
  const startedAt = useCallStore((state) => state.startedAt);

  const { localVideoStream, localAudioStream, localScreenStream } =
    useLocalTracks();
  const [initiator, setInitiator] = useState<RemoteParticipant | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);

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

  const handleLeaveCall = async () => {
    if (localParticipant) {
      localParticipant.getTrackPublications().forEach((pub) => {
        pub.track?.mediaStreamTrack?.stop();
      });
    }
    leaveCall();
  };

  const localParticipant = room.localParticipant;
  const isMuted = !localParticipant?.isMicrophoneEnabled;
  const isVideoEnabled = !!localParticipant?.isCameraEnabled;
  const isScreenshare = !!localParticipant?.isScreenShareEnabled;
  const participantCount = participants.length;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center text-white"
    >
      {/* For Caller (Broadcaster): Show local stream preview */}
      {isCaller ? (
        <LocalStreamPreview
          containerRef={containerRef}
          localVideoStream={localVideoStream}
          localAudioStream={localAudioStream}
          localScreenStream={localScreenStream}
        />
      ) : (
        /* For Viewers: Show initiator's broadcast stream */
        initiator && (
          <BroadcastStream
            participant={initiator}
            containerRef={containerRef}
            className="w-full h-full flex-1"
          />
        )
      )}

      {/* Controls */}
      {isCaller ? (
        <CallControls
          isVideoEnabled={isVideoEnabled}
          isMuted={isMuted}
          isScreenshare={isScreenshare}
          isEnableScreenshare={true}
          audioStream={null}
          onLeaveCall={handleLeaveCall}
          containerRef={containerRef}
        />
      ) : (
        <Button
          variant="ghost"
          className="w-8 h-8 absolute top-2 right-2 opacity-70 hover:text-white/90 hover:bg-red-500"
          isIconFilled={true}
          isRoundedFull
          onClick={handleLeaveCall}
          icon="close"
        />
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
