import { motion } from "framer-motion";
import { ChatResponse } from "@/types/responses/chat.response";
import { Button } from "../../../Button";
import { VideoStream } from "../VideoStream";
import { CallHeader } from "../CallHeader";
import { Timer } from "../../../Timer";
import { VoiceVisualizerButton } from "../../../VoiceVisualizerBtn";
import { useCallStore } from "@/stores/callStore/callStore";
import { useLocalTracks } from "@/hooks/mediaStreams/useLocalTracks";
import { RemoteParticipant, RoomEvent } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import CallMember from "./CallMember";
import { VoiceVisualizerBorder } from "../../../VoiceVisualizerBorder";

export const CallRoom = ({ chat }: { chat: ChatResponse }) => {
  const startedAt = useCallStore((state) => state.startedAt);
  const room = useCallStore((state) => state.getLiveKitRoom());
  const toggleLocalVoice = useCallStore((state) => state.toggleLocalVoice);
  const toggleLocalVideo = useCallStore((state) => state.toggleLocalVideo);
  const leaveCall = useCallStore((state) => state.leaveCall);

  const { localVideoStream, localAudioStream } = useLocalTracks();
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [isLarge, setIsLarge] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!room) return;

    // initialize with current participants
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
      {memberCount > 0 ? (
        <div className="relative w-full h-full bg-black">
          <div
            className={`w-full h-full grid auto-rows-fr ${
              memberCount === 1
                ? "grid-cols-1"
                : memberCount === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            }`}
          >
            {participants.map((participant) => (
              <CallMember
                key={participant.identity}
                participant={participant}
              />
            ))}
          </div>
        </div>
      ) : (
        <CallHeader
          chat={chat}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        />
      )}

      {localVideoStream && isVideoEnabled && (
        <motion.div
          className="absolute bottom-4 right-4 z-20 cursor-grab active:cursor-grabbing overflow-hidden rounded-full"
          drag
          dragConstraints={containerRef}
          dragElastic={0.8}
          dragMomentum={false}
        >
          <VideoStream
            stream={localVideoStream}
            className={`${
              isLarge ? "w-80 h-80" : "w-52 h-52"
            } rounded-full object-cover border-4 border-[--input-border-color] shadow-xl transition-all duration-300`}
            muted
          />

          <VoiceVisualizerBorder
            stream={localAudioStream}
            isMuted={isMuted}
            color="lightgreen"
            isCircle={true}
            className="rounded-full"
          />

          {/* expand/collapse button (only visible on hover) */}
          <button
            onClick={() => setIsLarge((prev) => !prev)}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full p-4 bg-black/50 w-10 h-10 flex items-center justify-center text-2xl font-bold"
          >
            <span className="material-symbols-outlined">
              {isLarge ? "hide" : "open_in_full"}
            </span>
          </button>

          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-2">
            You {isMuted && "🔇"}
          </div>
        </motion.div>
      )}

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <p className="text-sm truncate max-w-[200px]">
          {chat.name}

          {memberCount > 1 && (
            <span>
              🔸
              <span className="opacity-60">{memberCount + 1}</span>
            </span>
          )}
        </p>
        <Timer startTime={startedAt} />
      </div>

      <motion.div
        id="button-container"
        className="flex justify-center gap-4 p-3 absolute bottom-3 left-1/2 -translate-x-1/2 z-30 bg-black/10 shadow-2xl border-4 border-white/5 backdrop-blur-lg rounded-full cursor-grab active:cursor-grabbing"
        drag
        dragConstraints={containerRef}
        dragElastic={0.8}
        dragMomentum={false}
      >
        <Button
          variant="ghost"
          className={`w-12 h-12  bg-black/20 ${
            isVideoEnabled ? "!bg-[--primary-green]" : ""
          }`}
          icon={isVideoEnabled ? "videocam" : "videocam_off"}
          isIconFilled={isVideoEnabled}
          isRoundedFull
          onClick={() => toggleLocalVideo()}
        />

        <VoiceVisualizerButton
          variant="ghost"
          isMuted={isMuted}
          stream={localAudioStream}
          onClick={() => toggleLocalVoice()}
          circleColor="var(--primary-green)"
          className="w-12 h-12 rounded-full bg-black/20"
        />
        <Button
          variant="ghost"
          className="w-12 h-12 text-red-400 hover:text-white/90 hover:bg-red-500"
          isIconFilled={true}
          isRoundedFull
          onClick={handleLeaveCall}
          icon="call_end"
        />
      </motion.div>
    </div>
  );
};
