// hooks/useVoiceRecording.ts - FIXED VERSION
import { useRef, useEffect } from "react";
import { audioManager, SoundType } from "@/services/media/audioManager";
import { getCurrentUser } from "@/stores/authStore";
interface RecordingData {
  blob: Blob;
  url: string;
}

interface UseVoiceRecordingReturn {
  stopRecording: () => void;
  getCurrentRecording: () => Blob | null;
  getRecordingFile: () => File | null;
  clearRecording: () => void;
  getCurrentRecordingDuration: () => number;
}

interface UseVoiceRecordingProps {
  isRecording: boolean;
  onRecordingComplete?: (data: RecordingData | null) => void;
}

export const useVoiceRecording = ({
  isRecording,
  onRecordingComplete,
}: UseVoiceRecordingProps): UseVoiceRecordingReturn => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isInitializedRef = useRef(false);
  const wasRecordingRef = useRef(false);

  // Duration tracking
  const recordingDurationRef = useRef<number>(0);
  const recordingStartRef = useRef<number>(0);

  // Handle pause/resume based on isRecording
  useEffect(() => {
    if (!mediaRecorderRef.current || !isInitializedRef.current) {
      // If not initialized yet, store that we want to record
      // This will be handled in the initialization effect
      return;
    }

    if (isRecording) {
      // Start or resume recording
      if (mediaRecorderRef.current.state === "inactive") {
        mediaRecorderRef.current.start(100);
        // Start timing
        recordingStartRef.current = Date.now();
        // Play start sound
        audioManager.playSound(SoundType.RECORD_START);
        wasRecordingRef.current = true;
      } else if (mediaRecorderRef.current.state === "paused") {
        mediaRecorderRef.current.resume();
        // Resume timing
        recordingStartRef.current = Date.now();
        // Play start sound
        audioManager.playSound(SoundType.RECORD_START);
        wasRecordingRef.current = true;
      }
    } else {
      // Pause recording (don't stop!) - GET THE AUDIO DATA
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.pause();
        // THIS LINE GETS THE AUDIO CHUNKS
        mediaRecorderRef.current.requestData();

        // Calculate segment duration
        if (recordingStartRef.current > 0) {
          const segmentDuration = Date.now() - recordingStartRef.current;
          recordingDurationRef.current += segmentDuration;
          recordingStartRef.current = 0;
        }

        // Play pause sound
        audioManager.playSound(SoundType.USER_DISCONNECTED);
        wasRecordingRef.current = false;
      }
    }
  }, [isRecording]);

  // Initialize recording once
  useEffect(() => {
    let shouldAutoStart = false;

    const initializeRecording = async () => {
      if (!isInitializedRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              sampleRate: 44100,
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });

          streamRef.current = stream;
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          // Check if we should auto-start recording
          if (isRecording) {
            shouldAutoStart = true;
          }

          // Collect chunks when data is available
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          // Handle final stop
          mediaRecorder.onstop = () => {
            // Add final segment duration
            if (recordingStartRef.current > 0) {
              const segmentDuration = Date.now() - recordingStartRef.current;
              recordingDurationRef.current += segmentDuration;
              recordingStartRef.current = 0;
            }

            if (audioChunksRef.current.length > 0) {
              const audioBlob = new Blob(audioChunksRef.current, {
                type: "audio/webm;codecs=opus",
              });

              onRecordingComplete?.({
                blob: audioBlob,
                url: URL.createObjectURL(audioBlob),
              });
            } else {
              onRecordingComplete?.(null);
            }

            // Play end sound
            audioManager.playSound(SoundType.RECORD_END);

            // Clean up
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
              streamRef.current = null;
            }

            // Reset duration on final stop
            audioChunksRef.current = [];
            isInitializedRef.current = false;
            wasRecordingRef.current = false;
            recordingDurationRef.current = 0;
            recordingStartRef.current = 0;
          };

          isInitializedRef.current = true;

          // Auto-start recording if needed
          if (shouldAutoStart && mediaRecorder.state === "inactive") {
            mediaRecorder.start(100);
            recordingStartRef.current = Date.now();
            audioManager.playSound(SoundType.RECORD_START);
            wasRecordingRef.current = true;
          }
        } catch (error) {
          console.error("Error initializing recording:", error);
          onRecordingComplete?.(null);
        }
      }
    };

    initializeRecording();

    // Cleanup on unmount
    return () => {
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      isInitializedRef.current = false;
      wasRecordingRef.current = false;
    };
  }, []); // Empty dependency array - runs once

  // Function to stop and finalize recording with audio feedback
  const stopRecording = () => {
    if (mediaRecorderRef.current && isInitializedRef.current) {
      mediaRecorderRef.current.stop();
      isInitializedRef.current = false;
      wasRecordingRef.current = false;
    }
  };

  // Function to get current recording chunks (for preview)
  const getCurrentRecording = () => {
    if (audioChunksRef.current.length > 0) {
      return new Blob(audioChunksRef.current, {
        type: "audio/webm;codecs=opus",
      });
    }
    return null;
  };

  // const getRecordingFile = (): File | null => {
  //   const currentUser = getCurrentUser()
  //   const recorderInfo = currentUser?.firstName ?? currentUser?.username ?? currentUser?.id ?? "voice"
  //   const recording = getCurrentRecording();
  //   if (recording) {
  //     const filename = `${recorderInfo}.webm`; // Potential issue here
  //     return new File([recording], filename, {
  //       type: "audio/webm;codecs=opus",
  //     });
  //   }
  //   return null;
  // };
  const getRecordingFile = (): File | null => {
    const currentUser = getCurrentUser();
    const recorderInfo =
      currentUser?.firstName ??
      currentUser?.username ??
      currentUser?.id ??
      "voice";
    const recording = getCurrentRecording();

    if (recording) {
      // Get the duration in milliseconds
      const durationMs = getCurrentRecordingDuration();
      const durationSeconds = Math.round(durationMs / 1000);

      // Create filename with duration
      const filename = `${recorderInfo}-${durationSeconds}.webm`;

      return new File([recording], filename, {
        type: "audio/webm;codecs=opus",
      });
    }
    return null;
  };

  // Function to get current recording duration
  const getCurrentRecordingDuration = (): number => {
    let total = recordingDurationRef.current;

    // Add current segment if recording
    if (isRecording && recordingStartRef.current > 0) {
      total += Date.now() - recordingStartRef.current;
    }

    return total;
  };

  // Function to clear recording (start fresh)
  const clearRecording = () => {
    audioChunksRef.current = [];
    // Clear duration too
    recordingDurationRef.current = 0;
    recordingStartRef.current = 0;
  };

  return {
    stopRecording,
    getCurrentRecording,
    getRecordingFile,
    clearRecording,
    getCurrentRecordingDuration,
  };
};
