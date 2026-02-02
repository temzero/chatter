export function formatTime(time?: Date | string | null): string | null {
  if (!time) return null;
  const date = new Date(time);
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  };
  return date.toLocaleTimeString(undefined, options);
}

// Format time as MM:SS
export const formatRecordingTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  const secWithMs = `${secs.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(2, "0")}`;

  // < 1 minute → SS.xx
  if (mins === 0) {
    return `${secs}.${ms.toString().padStart(2, "0")}`;
  }

  // ≥ 1 minute → MM:SS.xx
  return `${mins.toString().padStart(2, "0")}:${secWithMs}`;
};

export const formatRecordingTimeMs = (milliseconds: number) => {
  const totalMs = Math.floor(milliseconds);
  
  // Calculate minutes, seconds, and milliseconds
  const mins = Math.floor(totalMs / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = Math.floor((totalMs % 1000) / 10); // Get 2-digit milliseconds (0-99)
  
  // Format milliseconds as 2 digits
  const msStr = ms.toString().padStart(2, '0');
  
  // Under 1 minute: ss.ms (23.32)
  if (mins === 0) {
    // For seconds < 10, don't pad with zero
    if (secs < 10) {
      return `${secs}.${msStr}`;
    }
    return `${secs}.${msStr}`;
  }
  
  // 1 minute or more: mm:ss.ms (02:32.12)
  const minsStr = mins.toString().padStart(2, '0');
  const secsStr = secs.toString().padStart(2, '0');
  return `${minsStr}:${secsStr}.${msStr}`;
};