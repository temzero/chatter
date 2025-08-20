// utils/callStreamUtils.ts
export const hasVideoTrack = (stream: MediaStream): boolean => {
  return (
    stream.getVideoTracks().length > 0 &&
    stream
      .getVideoTracks()
      .some((track) => track.enabled && track.readyState === "live")
  );
};

export const hasAudioTrack = (stream: MediaStream): boolean => {
  return (
    stream.getAudioTracks().length > 0 &&
    stream
      .getAudioTracks()
      .some((track) => track.enabled && track.readyState === "live")
  );
};

export const getStreamType = (
  stream: MediaStream
): "video" | "audio" | "both" | "none" => {
  const hasVideo = hasVideoTrack(stream);
  const hasAudio = hasAudioTrack(stream);

  if (hasVideo && hasAudio) return "both";
  if (hasVideo) return "video";
  if (hasAudio) return "audio";
  return "none";
};
