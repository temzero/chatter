// types/store/callMember.type.ts
import { RemoteParticipant } from "livekit-client";

export interface BaseCallMember {
  memberId: string;
  avatarUrl?: string;
  displayName?: string;

  voiceStream?: MediaStream | null;
  videoStream?: MediaStream | null;
  screenStream?: MediaStream | null;

  isMuted?: boolean;
  isVideoEnabled?: boolean;
  isScreenSharing?: boolean;
}

export interface P2PCallMember extends BaseCallMember {
  peerConnection: RTCPeerConnection | null;
}

export interface SFUCallMember extends BaseCallMember {
  participant: RemoteParticipant | null;
}

export type callMember = P2PCallMember | SFUCallMember
