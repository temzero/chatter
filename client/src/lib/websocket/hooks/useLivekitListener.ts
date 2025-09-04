import { useEffect, useMemo } from "react";
import { LiveKitService } from "@/services/liveKitService";
import { RemoteParticipant } from "livekit-client";
import { callService } from "@/services/callService";
import { useCallStore } from "@/stores/callStore/callStore";
import { getMyChatMember } from "@/stores/chatMemberStore";
import { CallStatus } from "@/types/enums/CallStatus";

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

let singletonService: LiveKitService | null = null;

export function useLiveKitListeners() {
  const { chatId, callStatus, isGroupCall } = useCallStore();

  const liveKitService = useMemo(() => {
    if (!singletonService) {
      singletonService = new LiveKitService();
    }
    return singletonService;
  }, []);

  useEffect(() => {
    async function init() {
      if (!chatId || callStatus !== CallStatus.CONNECTED || !isGroupCall)
        return;

      try {
        const roomName = chatId; // Using chatId as room name
        const myMember = getMyChatMember(chatId);
        const participantName =
          myMember?.nickname ?? `${myMember?.firstName} ${myMember?.lastName}`; // Generate participant name

        // Use your existing callService to get the token
        const token = await callService.getToken(
          roomName,
          myMember?.id ?? "unknown",
          participantName
        );

        if (!token) {
          console.log("No token generated");
          return;
        }

        await liveKitService.connect(LIVEKIT_URL, token, {
          audio: true,
          video: true,
          onParticipantConnected: (participant: RemoteParticipant) => {
            console.log("Participant joined", participant.identity);
          },
          onTrackSubscribed: (track, participant, kind) => {
            console.log("Track subscribed:", kind, participant, track);
            // attach track to video/audio element here
          },
          onParticipantDisconnected: (participant: RemoteParticipant) => {
            console.log("Participant left", participant.identity);
          },
          onTrackUnsubscribed: (track, participant, kind) => {
            console.log("Track unsubscribed:", track, kind, participant);
          },
          onError: (err) => console.error("LiveKit error:", err),
        });
      } catch (err) {
        console.error("Failed to connect LiveKit:", err);
      }
    }

    init();

    return () => {
      liveKitService.disconnect();
    };
  }, [chatId, callStatus, liveKitService, isGroupCall]);

  return liveKitService;
}
