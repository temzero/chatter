// types/store/callMember.type.ts
import { RemoteParticipant, RemoteTrack } from "livekit-client";

export interface BaseCallMember {
  memberId: string;

  isMuted?: boolean;
  isVideoEnabled?: boolean;
  isScreenSharing?: boolean;
}

export interface P2PCallMember extends BaseCallMember {
  voiceStream?: MediaStream | null;
  videoStream?: MediaStream | null;
  screenStream?: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
}

export interface SFUCallMember extends BaseCallMember {
  voiceStream?: RemoteTrack | null;
  videoStream?: RemoteTrack | null;
  screenStream?: RemoteTrack | null;
  participant: RemoteParticipant | null;
}

export type callMember = P2PCallMember | SFUCallMember;
