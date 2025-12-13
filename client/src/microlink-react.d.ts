// src/microlink-react.d.ts
declare module "@microlink/react" {
  import { ComponentType, CSSProperties } from "react";

  export interface MicrolinkProps {
    url: string;
    size?: "small" | "normal" | "large";
    contrast?: boolean;
    style?: CSSProperties;
    onLoad?: () => void;
    onError?: () => void;
    media?: ("logo" | "image" | "audio" | "video")[];
  }

  const Microlink: ComponentType<MicrolinkProps>;
  export default Microlink;
}
