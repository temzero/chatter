import { useEffect, useMemo } from "react";
import { LiveKitService } from "@/services/liveKitService";
import { RemoteParticipant } from "livekit-client";

// Optionally, you can import URL/token from env or some store
const LIVEKIT_URL =
  process.env.REACT_APP_LIVEKIT_URL || "wss://your-livekit-server";
const LIVEKIT_TOKEN = process.env.REACT_APP_LIVEKIT_TOKEN || "YOUR_TOKEN_HERE";

let singletonService: LiveKitService | null = null;

export function useLiveKitListeners() {
  const liveKitService = useMemo(() => {
    if (!singletonService) {
      singletonService = new LiveKitService();
    }
    return singletonService;
  }, []);

  useEffect(() => {
    async function init() {
      try {
        await liveKitService.connect(LIVEKIT_URL, LIVEKIT_TOKEN, {
          audio: true,
          video: true,
          onParticipantConnected: (participant: RemoteParticipant) => {
            console.log("Participant joined", participant.identity);
          },
          onTrackSubscribed: (track: MediaStreamTrack, participant, kind) => {
            console.log("Track subscribed:", kind, participant.identity, track);
            // attach track to video/audio element here
          },
          onParticipantDisconnected: (participant: RemoteParticipant) => {
            console.log("Participant left", participant.identity);
          },
          onTrackUnsubscribed: (track: MediaStreamTrack, participant, kind) => {
            console.log("Track unsubscribed:", kind, participant.identity);
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
  }, [liveKitService]);

  return liveKitService; // optional: to allow toggleAudio/toggleVideo
}
