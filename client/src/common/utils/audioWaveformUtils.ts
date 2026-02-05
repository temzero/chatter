// utils/audioWaveformUtils.ts

/**
 * Common types shared between waveform components
 */
export interface WaveformConfig {
  barCount?: number;
  barSpacing?: number;
  barWidth?: number;
  maxBarHeight?: number;
  height?: number;
  color?: string;
  processColor?: string;
}

/**
 * Normalize waveform data to fit within maxBarHeight
 */
export const normalizeWaveform = (
  waveform: number[],
  maxBarHeight: number = 1,
): number[] => {
  const max = Math.max(...waveform);
  if (max === 0) return waveform.map(() => 0.1); // Default minimal height

  return waveform.map((v) => (v / max) * maxBarHeight);
};

/**
 * Process audio buffer to generate waveform data
 */
export const generateWaveformFromAudioBuffer = async (
  audioBuffer: AudioBuffer,
  barCount: number,
): Promise<number[]> => {
  const rawData = audioBuffer.getChannelData(0);
  const chunkSize = Math.max(1, Math.floor(rawData.length / barCount));
  const waveformData: number[] = [];

  for (let i = 0; i < barCount; i++) {
    let sum = 0;
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, rawData.length);

    if (start >= end) {
      waveformData.push(0);
      continue;
    }

    for (let j = start; j < end; j++) {
      sum += Math.abs(rawData[j]);
    }
    waveformData.push(sum / (end - start));
  }

  return waveformData;
};

/**
 * Create a fake waveform for fallback/loading state
 */
export const createFakeWaveform = (
  barCount: number,
  maxBarHeight: number = 0.7,
): number[] => {
  return Array(barCount)
    .fill(0)
    .map(
      (_, i) =>
        Math.abs(Math.sin(i * 0.1)) * 0.5 * maxBarHeight + 0.2 * maxBarHeight,
    );
};

/**
 * Calculate bar dimensions based on container width and configuration
 */
export const calculateBarDimensions = (
  containerWidth: number,
  barCount: number,
  barSpacing: number,
  barWidth?: number,
): {
  actualBarCount: number;
  actualBarWidth: number;
  totalBarsWidth: number;
} => {
  if (barWidth) {
    const actualBarCount = Math.min(
      barCount,
      Math.floor(containerWidth / (barWidth + barSpacing)),
    );
    return {
      actualBarCount,
      actualBarWidth: barWidth,
      totalBarsWidth: actualBarCount * (barWidth + barSpacing) - barSpacing,
    };
  }

  const actualBarWidth = Math.max(
    1,
    (containerWidth - (barCount - 1) * barSpacing) / barCount,
  );
  return {
    actualBarCount: barCount,
    actualBarWidth,
    totalBarsWidth: containerWidth,
  };
};

/**
 * Calculate progress index for the waveform
 */
export const calculateProgressIndex = (
  currentTime: number,
  duration: number,
  barCount: number,
): number => {
  if (duration <= 0) return 0;
  const progress = Math.min(1, currentTime / duration);
  return Math.floor(progress * barCount);
};

/**
 * Adjust color brightness (for gradients/shading)
 */
export const adjustColor = (color: string, amount: number): string => {
  if (color.startsWith("#")) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  // Handle rgb/rgba colors
  if (color.startsWith("rgb")) {
    const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      let r = parseInt(match[1]) + amount;
      let g = parseInt(match[2]) + amount;
      let b = parseInt(match[3]) + amount;

      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));

      return color.replace(/(\d+),\s*(\d+),\s*(\d+)/, `${r}, ${g}, ${b}`);
    }
  }

  return color;
};

/**
 * Draw a rounded rectangle bar on canvas
 */
export const drawRoundedBar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 4,
): void => {
  if (radius > 0 && height >= radius * 2) {
    const r = Math.min(radius, width / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.arcTo(x + width, y, x + width, y + r, r);
    ctx.lineTo(x + width, y + height - r);
    ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
    ctx.lineTo(x + r, y + height);
    ctx.arcTo(x, y + height, x, y + height - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(x, y, width, height);
  }
};

/**
 * Get audio context (handles browser compatibility)
 */
export const getAudioContext = (): AudioContext => {
  const AudioContextClass =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContextClass();
};

/**
 * Fetch and decode audio from URL
 */
export const fetchAndDecodeAudio = async (
  url: string,
): Promise<AudioBuffer> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioContext = getAudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  await audioContext.close();

  return audioBuffer;
};

/**
 * Decode audio blob
 */
// export const decodeAudioBlob = async (
//   blob: Blob
// ): Promise<AudioBuffer> => {
//   const arrayBuffer = await blob.arrayBuffer();
//   const audioContext = getAudioContext();
//   const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
//   await audioContext.close();

//   return audioBuffer;
// };
// common/utils/audioWaveformUtils.ts - UPDATED decodeAudioBlob function
export const decodeAudioBlob = async (blob: Blob): Promise<AudioBuffer> => {
  try {
    // Validate blob
    if (!blob || blob.size === 0) {
      throw new Error("Empty or invalid audio blob");
    }

    const audioContext = new (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.AudioContext || (window as any).webkitAudioContext
    )();

    // Convert blob to array buffer with timeout
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Audio decoding timeout"));
      }, 5000); // 5 second timeout

      const reader = new FileReader();
      reader.onload = () => {
        clearTimeout(timeout);
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read blob as ArrayBuffer"));
        }
      };
      reader.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`FileReader error: ${reader.error}`));
      };
      reader.readAsArrayBuffer(blob);
    });

    // Additional validation
    if (arrayBuffer.byteLength === 0) {
      throw new Error("Empty array buffer");
    }

    // Try to decode with error handling for WebM/Opus
    try {
      return await audioContext.decodeAudioData(arrayBuffer);
    } catch (decodeError) {
      console.warn(
        "Standard decode failed, trying alternative method:",
        decodeError,
      );

      // Try creating an Audio element as fallback
      const audio = new Audio();
      const url = URL.createObjectURL(blob);

      return new Promise((resolve, reject) => {
        audio.oncanplaythrough = async () => {
          try {
            // Use MediaElementSource to get audio data
            const mediaSource = audioContext.createMediaElementSource(audio);
            const analyser = audioContext.createAnalyser();
            mediaSource.connect(analyser);
            analyser.connect(audioContext.destination);

            // Create a dummy buffer
            const buffer = audioContext.createBuffer(
              1,
              audioContext.sampleRate * (audio.duration || 1),
              audioContext.sampleRate,
            );

            URL.revokeObjectURL(url);
            resolve(buffer);
          } catch (error) {
            URL.revokeObjectURL(url);
            reject(error);
          }
        };

        audio.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Audio element failed to load"));
        };

        audio.src = url;
      });
    }
  } catch (error) {
    console.error("Failed to decode audio blob:", error);
    throw error
  }
};
