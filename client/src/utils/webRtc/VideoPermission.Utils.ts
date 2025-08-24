import { CallMember } from "@/stores/callStore";

/**
 * Toggles camera permission without disconnecting from the call
 * @param currentStream - The current video stream
 * @param isCurrentlyEnabled - Current video state
 * @param onDisable - Callback when disabling video
 * @param onEnable - Callback when enabling video
 * @param onError - Error handler callback
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
    if (newVideoState) {
      // Disabling video: Stop the video tracks to release camera permission
      if (currentStream) {
        currentStream.getVideoTracks().forEach((track) => {
          track.stop(); // This releases the camera permission
        });
      }
      onDisable();
      return true;
    } else {
      // Enabling video: Request new camera permission
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user", // or "environment" for rear camera
        },
      });

      const newVideoStream = new MediaStream(newStream.getVideoTracks());
      onEnable(newVideoStream);
      return true;
    }
  } catch (error) {
    onError(error as Error);
    return false;
  }
};

/**
 * Replaces video tracks in peer connections when toggling video
 */
export const updateVideoInConnections = async (
  newStream: MediaStream | null, // null when disabling video
  callMembers: CallMember[],
  isGroupCall: boolean,
  chatId: string,
  sendOffer: (chatId: string, offer: RTCSessionDescriptionInit) => void
): Promise<void> => {
  if (isGroupCall) return; // Group calls are handled by SFU

  for (const member of callMembers) {
    if (!member.peerConnection) continue;

    const pc = member.peerConnection;
    const senders = pc.getSenders();

    if (newStream) {
      // Enabling video - replace or add video track
      const videoSender = senders.find(
        (s: RTCRtpSender) => s.track && s.track.kind === "video"
      );

      if (videoSender) {
        // Replace existing video track
        await videoSender.replaceTrack(newStream.getVideoTracks()[0]);
      } else {
        // Add new video track
        pc.addTrack(newStream.getVideoTracks()[0], newStream);

        // Renegotiate for new track
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendOffer(chatId, offer);
        } catch (err) {
          console.error("Error renegotiating video:", err);
        }
      }
    } else {
      // Disabling video - remove video track if it exists
      const videoSender = senders.find(
        (s: RTCRtpSender) => s.track && s.track.kind === "video"
      );

      if (videoSender) {
        pc.removeTrack(videoSender);

        // Renegotiate after removing video track
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendOffer(chatId, offer);
        } catch (err) {
          console.error("Error renegotiating after removing video:", err);
        }
      }
    }
  }
};
