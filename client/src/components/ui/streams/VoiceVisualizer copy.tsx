// // components/VoiceVisualizer.tsx
// import { useEffect, useRef, useState } from "react";
// import { RemoteTrack } from "livekit-client";

// type VoiceVisualizerProps = {
//   stream: MediaStream | RemoteTrack | null;
//   isMuted: boolean;
//   size?: number; // circle size in px
//   circleColor?: string;
//   opacity?: number;
//   className?: string;
// };

// export const VoiceVisualizer = ({
//   stream,
//   isMuted = false,
//   size = 40,
//   circleColor = "gray",
//   opacity = 0.2,
//   className = "",
// }: VoiceVisualizerProps) => {
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const analyzerRef = useRef<AnalyserNode | null>(null);
//   const [scale, setScale] = useState(0);

//   // Convert RemoteTrack to MediaStream if needed
//   const getMediaStream = (
//     s: MediaStream | RemoteTrack | null | undefined
//   ): MediaStream | null => {
//     if (!s) return null;
//     if (s instanceof MediaStream) return s;
//     if (s instanceof RemoteTrack) return new MediaStream([s.mediaStreamTrack]);
//     return null;
//   };

//   useEffect(() => {
//     const mediaStream = getMediaStream(stream);

//     if (!mediaStream || isMuted || !mediaStream.getAudioTracks().length) {
//       if (audioContextRef.current?.state !== "closed") {
//         audioContextRef.current?.close();
//       }
//       setScale(0);
//       return;
//     }

//     const AudioContext =
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       window.AudioContext || (window as any).webkitAudioContext;
//     const audioContext = new AudioContext();
//     audioContextRef.current = audioContext;

//     const analyzer = audioContext.createAnalyser();
//     analyzer.fftSize = 256;
//     analyzerRef.current = analyzer;

//     const source = audioContext.createMediaStreamSource(mediaStream);
//     source.connect(analyzer);

//     const dataArray = new Uint8Array(analyzer.frequencyBinCount);

//     const update = () => {
//       analyzer.getByteTimeDomainData(dataArray);

//       let sum = 0;
//       for (let i = 0; i < dataArray.length; i++) {
//         const value = dataArray[i] - 128;
//         sum += value * value;
//       }

//       const rms = Math.sqrt(sum / dataArray.length);
//       const normalized = Math.min(rms / 50, 1);
//       const newScale = normalized * 5;

//       setScale(newScale);
//       requestAnimationFrame(update);
//     };

//     update();

//     return () => {
//       if (audioContextRef.current?.state !== "closed") {
//         audioContextRef.current?.close();
//       }
//     };
//   }, [stream, isMuted]);

//   if (isMuted) return null;

//   return (
//     <div
//       className={`absolute rounded-full transition-transform duration-75 ${className}`}
//       style={{
//         width: size,
//         height: size,
//         backgroundColor: circleColor,
//         transform: `scale(${scale})`,
//         opacity: opacity,
//         zIndex: 0,
//       }}
//     />
//   );
// };
