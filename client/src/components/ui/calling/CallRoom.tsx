import { motion } from "framer-motion";
import { ChatResponse } from "@/types/responses/chat.response";
import { Button } from "../Button";
import { VideoStream } from "./components/VideoStream";
import { CallHeader } from "./components/CallHeader";
import { Timer } from "../Timer";
import { VoiceVisualizerButton } from "../VoiceVisualizerBtn";
import { useCallStore } from "@/stores/callStore/callStore";
import CallMember from "./components/CallMember";
import { useLocalTracks } from "@/hooks/mediaStreams/useLocalTracks";
import { RemoteParticipant, RoomEvent } from "livekit-client";
import { useEffect, useState } from "react";

export const CallRoom = ({ chat }: { chat: ChatResponse }) => {
  const startedAt = useCallStore((state) => state.startedAt);
  const room = useCallStore((state) => state.getLiveKitRoom());
  const toggleLocalVoice = useCallStore((state) => state.toggleLocalVoice);
  const toggleLocalVideo = useCallStore((state) => state.toggleLocalVideo);
  const leaveCall = useCallStore((state) => state.leaveCall);

  const { localVideoStream, localAudioStream } = useLocalTracks();
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);

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
    <div className="relative w-full h-full flex flex-col items-center justify-center text-white">
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

      {/* {localVideoStream && isVideoEnabled && (
        <div className="absolute bottom-4 right-4 z-20">
          <VideoStream
            stream={localVideoStream}
            className="w-52 h-52 rounded-md object-cover border-2 border-white"
            muted
          />
          <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-sm">
            You {isMuted && "🔇"}
          </div>
        </div>
      )} */}
      {localVideoStream && isVideoEnabled && (
        <motion.div
          className="absolute bottom-4 right-4 z-20 cursor-grab active:cursor-grabbing"
          drag
          dragElastic={0.2}
          dragMomentum={false}
        >
          <VideoStream
            stream={localVideoStream}
            className="w-52 h-52 rounded-md object-cover border-2 border-white"
            muted
          />
          <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-sm">
            You {isMuted && "🔇"}
          </div>
        </motion.div>
      )}

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <p className="text-sm truncate max-w-[200px]">{chat.name}</p>
        <div className="flex items-center gap-2">
          {memberCount > 1 && (
            <span className="text-xs text-gray-400">{memberCount} members</span>
          )}
          <Timer startTime={startedAt} />
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 z-10">
        <div className="flex justify-center gap-6">
          <Button
            variant="ghost"
            className={`w-14 h-14 ${
              isVideoEnabled
                ? "bg-gray-700/50 text-green-500 filled"
                : "bg-red-500/50 opacity-60"
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
            className="w-14 h-14 rounded-full"
          />
          <Button
            variant="ghost"
            className="hover:bg-red-500/50 w-14 h-14"
            isRoundedFull
            onClick={handleLeaveCall}
            icon="call_end"
          />
        </div>
      </div>
    </div>
  );
};
