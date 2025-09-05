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
  const { chatId, callStatus, isGroupCall, isVideoCall } = useCallStore();

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

        // ✅ Await async version so it can fetch if missing
        const myMember = await getMyChatMember(chatId);
        const myMemberId = myMember?.id;

        if (!myMemberId) {
          console.error("❌ myMemberId is missing");
          return;
        }

        const participantName =
          myMember?.nickname ??
          `${myMember?.firstName ?? ""} ${myMember?.lastName ?? ""}`.trim();

        console.log("livekit-Token", {
          roomName,
          myMemberId,
          participantName,
        });

        // Use your existing callService to get the token
        const token = await callService.getToken(
          roomName,
          myMemberId,
          participantName
        );

        if (!token) {
          console.log("❌ No token generated");
          return;
        }

        await liveKitService.connect(LIVEKIT_URL, token, {
          audio: true,
          video: isVideoCall,
          onParticipantConnected: (participant: RemoteParticipant) => {
            console.log("✅ Participant joined", participant.identity);
          },
          onTrackSubscribed: (track, participant, kind) => {
            console.log("🎥 Track subscribed:", kind, participant, track);
          },
          onParticipantDisconnected: (participant: RemoteParticipant) => {
            console.log("👋 Participant left", participant.identity);
          },
          onTrackUnsubscribed: (track, participant, kind) => {
            console.log("📴 Track unsubscribed:", track, kind, participant);
          },
          onError: (err) => console.error("🚨 LiveKit error:", err),
        });
      } catch (err) {
        console.error("❌ Failed to connect LiveKit:", err);
      }
    }

    init();

    return () => {
      liveKitService.disconnect();
    };
  }, [chatId, callStatus, liveKitService, isGroupCall, isVideoCall]);

  return liveKitService;
}
