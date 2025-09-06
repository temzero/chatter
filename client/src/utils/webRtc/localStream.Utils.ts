import type { P2PCallMember } from "@/types/store/callMember.type";
import { handleError } from "../handleError";
import { toast } from "react-toastify";

export const getMicStream = async (): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });

    const audioTracks = stream.getAudioTracks();
    console.log("audioTracks", audioTracks.length);
    if (audioTracks.length === 0) {
      console.error("getMicStream: No audio tracks available");
      toast.error("No microphone found. Check your device.");
      throw new Error("No audio tracks");
    }

    console.log("getMicStream: Acquired stream with tracks:", audioTracks);
    return new MediaStream(audioTracks);
  } catch (error) {
    console.error("getMicStream error:", error);
    throw error;
  }
};

export const getVideoStream = async (): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
    });

    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) {
      console.error("getVideoStream: No video tracks available");
      toast.error("No camera found. Check your device.");
      throw new Error("No video tracks");
    }

    console.log("getVideoStream: Acquired stream with tracks:", videoTracks);
    return new MediaStream(videoTracks);
  } catch (error) {
    console.error("getVideoStream error:", error);
    toast.error("Unable to access camera. Check your permissions or device.");
    throw error; // ❌ no fallback, just throw
  }
};

export const getScreenStream = async (): Promise<MediaStream> => {
  try {
    // Keep constraints simple for Safari/Firefox
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false, // most browsers block system audio anyway
    });

    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) {
      console.error("getScreenStream: No video tracks available");
      throw new Error("No screen video tracks");
    }

    console.log("getScreenStream: Acquired stream with tracks:", videoTracks);
    return new MediaStream(videoTracks);
  } catch (error) {
    handleError(error, "Fail to getScreenStream");
    throw error;
  }
};

/**
 * stops local tracks
 */
export const stopMicStream = (stream: MediaStream | null | undefined) => {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
  }
};

export const stopVideoStream = (stream: MediaStream | null | undefined) => {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
  }
};

export const stopScreenStream = (stream: MediaStream | null | undefined) => {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
  }
};

export const stopMediaStreams = (
  micStream?: MediaStream | null,
  videoStream?: MediaStream | null,
  screenStream?: MediaStream | null
) => {
  [micStream, videoStream, screenStream].forEach((stream) => {
    if (stream) {
      stream.getTracks().forEach((t) => {
        t.stop();
      });
    }
  });
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
  if (isGroupCall) return;

  const audioTrack = newStream.getAudioTracks()[0];
  if (!audioTrack) {
    console.error("No audio track found in new stream");
    return;
  }

  for (const member of callMembers) {
    if (!member.peerConnection) continue;
    const pc = member.peerConnection;
    const senders = pc.getSenders();

    // Find audio sender
    const audioSender = senders.find((s) => s.track?.kind === "audio");

    try {
      if (audioSender) {
        // ✅ Replace existing track
        await audioSender.replaceTrack(audioTrack);
        console.log("Replaced audio track in existing sender");
      } else {
        // 🚨 Before adding, remove any previous audio tracks that might still be hanging around
        pc.getSenders()
          .filter((s) => s.track?.kind === "audio")
          .forEach((s) => pc.removeTrack(s));

        // ✅ Add new track safely
        pc.addTrack(audioTrack, newStream);
        console.log("Added new audio track");

        // Renegotiate since we added a new sender
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        sendOffer(chatId, offer);
      }
    } catch (error) {
      console.error("Error updating audio connection:", error);
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
  if (isGroupCall) return;

  const videoTrack = newStream.getVideoTracks()[0];
  if (!videoTrack) {
    console.error("No video track found in new stream");
    return;
  }

  for (const member of callMembers) {
    if (!member.peerConnection) continue;

    const pc = member.peerConnection;
    const senders = pc.getSenders();
    const videoSender = senders.find((s) => s.track?.kind === "video");

    try {
      if (videoSender) {
        await videoSender.replaceTrack(videoTrack);
        console.log("Replaced video track");
      } else {
        // Add new track
        pc.addTrack(videoTrack, newStream);
        console.log("Added new video track");
      }

      // ALWAYS renegotiate after video changes
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      sendOffer(chatId, offer);
    } catch (error) {
      console.error("Error updating video connection:", error);
    }
  }
};
