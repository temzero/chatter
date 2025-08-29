// utils/webRtc/videoPermission.Utils.ts
import type { P2PCallMember } from "@/types/store/callMember.type";

/**
 * Toggles video permission with proper stream management
 */
// 🎥 Enable camera
export const enableVideo = async (
  onEnable: (newStream: MediaStream) => void,
  onError: (error: Error) => void
): Promise<boolean> => {
  try {
    const newStream = await navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      })
      .catch(async () => {
        // Fallback: simple video request
        return await navigator.mediaDevices.getUserMedia({ video: true });
      });

    const newVideoStream = new MediaStream(newStream.getVideoTracks());
    onEnable(newVideoStream);
    return true;
  } catch (error) {
    console.error("enableVideo error:", error);
    onError(error as Error);
    return false;
  }
};

// 🎥 Disable camera
export const disableVideo = async (
  currentStream: MediaStream | null,
  onDisable: () => void,
  onError: (error: Error) => void
): Promise<boolean> => {
  try {
    if (currentStream) {
      currentStream.getVideoTracks().forEach((track) => {
        track.stop(); // Release camera
      });
    }
    onDisable();
    return true;
  } catch (error) {
    console.error("disableVideo error:", error);
    onError(error as Error);
    return false;
  }
};

/**
 * Replaces video tracks in peer connections when toggling video
 */
export const updateVideoInConnections = async (
  newStream: MediaStream,
  callMembers: P2PCallMember[],
  isGroupCall: boolean,
  chatId: string,
  sendOffer: (chatId: string, offer: RTCSessionDescriptionInit) => void
): Promise<void> => {
  if (isGroupCall) return; // Group calls are handled by SFU

  const videoTrack = newStream.getVideoTracks()[0];
  if (!videoTrack) {
    console.error("No video track found in new stream");
    return;
  }

  for (const member of callMembers) {
    if (member.peerConnection) {
      const pc = member.peerConnection;
      const senders = pc.getSenders();

      // Find and replace the video sender
      const videoSender = senders.find(
        (s: RTCRtpSender) => s.track && s.track.kind === "video"
      );

      try {
        if (videoSender) {
          // Replace the track
          await videoSender.replaceTrack(videoTrack);
          console.log("Replaced video track in existing sender");
        } else {
          // Add new video track if none exists
          pc.addTrack(videoTrack, newStream);
          console.log("Added new video track");

          // Renegotiate if this is a new track
          try {
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            });
            await pc.setLocalDescription(offer);
            sendOffer(chatId, offer);
          } catch (err) {
            console.error("Error renegotiating video:", err);
          }
        }
      } catch (error) {
        console.error("Error updating video connection:", error);
      }
    }
  }
};
