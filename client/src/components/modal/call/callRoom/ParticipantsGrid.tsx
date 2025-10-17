// components/call-room/ParticipantsGrid.tsx
import { RemoteParticipant } from "livekit-client";
import CallMember from "./CallMember";

interface ParticipantsGridProps {
  participants: RemoteParticipant[];
}

export const ParticipantsGrid = ({ participants }: ParticipantsGridProps) => {
  const memberCount = participants.length;

  if (memberCount === 0) return null;

  return (
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
          <CallMember key={participant.identity} participant={participant} />
        ))}
      </div>
    </div>
  );
};
