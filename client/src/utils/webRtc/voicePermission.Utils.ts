import { CallMember } from "@/stores/callStore";

/**
 * Toggles microphone permission without disconnecting from the call
 * @param currentStream - The current audio stream
 * @param isCurrentlyMuted - Current mute state
 * @param onMute - Callback when muting
 * @param onUnmute - Callback when unmuting
 * @param onError - Error handler callback
 */
export const toggleVoicePermission = async (
  currentStream: MediaStream | null,
  isCurrentlyMuted: boolean,
  onMute: () => void,
  onUnmute: (newStream: MediaStream) => void,
  onError: (error: Error) => void
): Promise<boolean> => {
  const newMutedState = !isCurrentlyMuted;

  try {
    if (newMutedState) {
      // Muting: Stop the audio tracks to release microphone permission
      if (currentStream) {
        currentStream.getAudioTracks().forEach((track) => {
          track.stop(); // This releases the microphone permission
        });
      }
      onMute();
      return true;
    } else {
      // Unmuting: Request new microphone permission
      const newStream = await navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            // Add these constraints to avoid Chrome issues:
            autoGainControl: true,
            channelCount: 1,
          },
        })
        .catch(async (error) => {
          // Fallback to simpler audio constraints if the first request fails
          if (
            error.name === "OverconstrainedError" ||
            error.name === "ConstraintNotSatisfiedError"
          ) {
            return await navigator.mediaDevices.getUserMedia({
              audio: true, // Simple audio constraints
            });
          }
          throw error;
        });

      const newVoiceStream = new MediaStream(newStream.getAudioTracks());
      onUnmute(newVoiceStream);
      return true;
    }
  } catch (error) {
    console.error("toggleVoicePermission error:", error);
    onError(error as Error);
    return false;
  }
};

/**
 * Replaces audio tracks in peer connections when toggling voice
 */
export const updateAudioInConnections = async (
  newStream: MediaStream,
  callMembers: CallMember[],
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
