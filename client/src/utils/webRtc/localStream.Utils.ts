import type { P2PCallMember } from "@/types/store/callMember.type";

export const getMicStream = async (): Promise<MediaStream> => {
  const stream = await navigator.mediaDevices
    .getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    })
    .catch(async (error) => {
      if (
        error.name === "OverconstrainedError" ||
        error.name === "ConstraintNotSatisfiedError"
      ) {
        return await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      throw error;
    });

  return new MediaStream(stream.getAudioTracks());
};

/**
 * Disable mic (stops local tracks)
 */
export const stopMicStream = (stream: MediaStream | null | undefined) => {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
  }
};

export const getVideoStream = async (): Promise<MediaStream> => {
  const stream = await navigator.mediaDevices
    .getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
    })
    .catch(async () => {
      return await navigator.mediaDevices.getUserMedia({ video: true });
    });

  return new MediaStream(stream.getVideoTracks());
};

export const stopVideoStream = (stream: MediaStream | null | undefined) => {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
  }
};

export const getScreenStream = async (): Promise<MediaStream> => {
  const stream = await navigator.mediaDevices
    .getDisplayMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 },
      },
      audio: false, // most browsers don't allow system audio by default
    })
    .catch(async () => {
      // fallback if constraints fail
      return await navigator.mediaDevices.getDisplayMedia({ video: true });
    });

  return new MediaStream(stream.getVideoTracks());
};

/**
 * Stop all tracks in a given screen stream
 */
export const stopScreenStream = (stream: MediaStream | null | undefined) => {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
  }
};

/**
 * Replaces audio tracks in peer connections when toggling voice
 */
export const updateP2PAudioInConnections = async (
  newStream: MediaStream,
  callMembers: P2PCallMember[],
  isGroupCall: boolean,
  chatId: string,
  sendOffer: (chatId: string, offer: RTCSessionDescriptionInit) => void
): Promise<void> => {
  if (isGroupCall) return; // Group calls are handled by SFU

  const audioTrack = newStream.getAudioTracks()[0];
  if (!audioTrack) {
    console.error("No audio track found in new stream");
    return;
  }

  for (const member of callMembers) {
    if (member.peerConnection) {
      const pc = member.peerConnection;
      const senders = pc.getSenders();

      // Find and replace the audio sender
      const audioSender = senders.find(
        (s: RTCRtpSender) => s.track && s.track.kind === "audio"
      );

      try {
        if (audioSender) {
          // Replace the track
          await audioSender.replaceTrack(audioTrack);
          console.log("Replaced audio track in existing sender");
        } else {
          // Add new audio track if none exists
          pc.addTrack(audioTrack, newStream);
          console.log("Added new audio track");

          // Renegotiate if this is a new track
          try {
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            });
            await pc.setLocalDescription(offer);
            sendOffer(chatId, offer);
          } catch (err) {
            console.error("Error renegotiating audio:", err);
          }
        }
      } catch (error) {
        console.error("Error updating audio connection:", error);
      }
    }
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
