// utils/webRtc/videoPermission.Utils.ts
import { CallMember } from "@/stores/callStore";

/**
 * Toggles video permission with proper stream management
 */
export const toggleVideoPermission = async (
  currentStream: MediaStream | null,
  isCurrentlyEnabled: boolean,
  onDisable: () => void,
  onEnable: (newStream: MediaStream) => void,
  onError: (error: Error) => void
): Promise<boolean> => {
  const newVideoState = !isCurrentlyEnabled;

  try {
    if (!newVideoState) {
      // DISABLING VIDEO
      if (currentStream) {
        currentStream.getVideoTracks().forEach((track) => {
          track.stop(); // Release camera
        });
      }
      onDisable();
      return true;
    } else {
      // ENABLING VIDEO
      const newStream = await navigator.mediaDevices
        .getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        })
        .catch(async () => {
          // Fallback
          return await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        });

      const newVideoStream = new MediaStream(newStream.getVideoTracks());
      onEnable(newVideoStream);
      return true;
    }
  } catch (error) {
    console.error("toggleVideoPermission error:", error);
    onError(error as Error);
    return false;
  }
};

/**
 * Replaces video tracks in peer connections when toggling video
 */
export const updateVideoInConnections = async (
  newStream: MediaStream,
  callMembers: CallMember[],
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
