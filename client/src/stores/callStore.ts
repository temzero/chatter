// stores/callStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { LiveKitService } from "@/services/liveKitService";
import { CallStatus } from "@/types/enums/CallStatus";

// ==================== COMMON/CORE STATE ====================
interface CallCoreState {
  // Call metadata
  chatId: string | null;
  callerMemberId?: string;
  callStatus: CallStatus | null;
  startedAt?: Date;
  timeoutRef?: NodeJS.Timeout;
  isVideoCall: boolean;
  isGroupCall: boolean;
  endedAt?: Date;
  callArchitecture: "p2p" | "sfu" | null; // Explicit architecture

  // Local streams (for UI preview in both architectures)
  localVoiceStream: MediaStream | null;
  localVideoStream: MediaStream | null;
  localScreenStream: MediaStream | null;

  // Local device states
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;

  // Error handling
  error?:
    | "permission_denied"
    | "device_unavailable"
    | "connection_failed"
    | null;
}

// ==================== P2P SPECIFIC STATE ====================
interface P2PState {
  // P2P connections
  iceCandidates: RTCIceCandidateInit[];

  // P2P members with connections and streams
  p2pMembers: P2PCallMember[];
}

interface P2PCallMember {
  memberId: string;
  displayName?: string;
  avatarUrl?: string;
  peerConnection: RTCPeerConnection | null;
  voiceStream?: MediaStream | null;
  videoStream?: MediaStream | null;
  screenStream?: MediaStream | null;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  isScreenSharing?: boolean;
  isSpeaking?: boolean;
  joinedAt?: number;
  lastActivity?: number;
}

// ==================== SFU SPECIFIC STATE ====================
interface SFUState {
  // LiveKit service
  liveKitService: LiveKitService | null;

  // SFU members (streams managed by LiveKit)
  sfuMembers: SFUCallMember[];
}

interface SFUCallMember {
  memberId: string;
  displayName?: string;
  avatarUrl?: string;
  // No peerConnection or streams - LiveKit manages these
  hasVoice?: boolean; // Track availability flags
  hasVideo?: boolean;
  hasScreen?: boolean;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  isScreenSharing?: boolean;
  isSpeaking?: boolean;
  joinedAt?: number;
  lastActivity?: number;
}

// ==================== COMBINED STATE ====================
interface CallStoreState extends CallCoreState, P2PState, SFUState {}

// ==================== ACTIONS ====================
interface CallCoreActions {
  // Core lifecycle
  startCall: (
    chatId: string,
    isVideo: boolean,
    isGroup: boolean
  ) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: (isCancel?: boolean) => void;
  endCall: (option?: {
    isCancel?: boolean;
    isRejected?: boolean;
    isTimeout?: boolean;
  }) => void;

  // Status control
  setStatus: (status: CallStatus) => void;

  // Media toggles (architecture-aware)
  toggleLocalVoice: () => void;
  toggleLocalVideo: () => Promise<void>;
  toggleLocalScreenShare: () => Promise<void>;
  enableVideoCall: () => void;

  // Media setup/cleanup
  setupLocalStream: () => Promise<void>;
  cleanupStreams: () => void;

  // Utilities
  getCallDuration: () => number;
  closeCallModal: () => void;
  updateMemberActivity: (memberId: string) => void;
}

interface P2PActions {
  // P2P Connection Management
  createPeerConnection: (memberId: string) => RTCPeerConnection;
  updatePeerConnection: (
    memberId: string,
    offer: RTCSessionDescriptionInit
  ) => Promise<void>;
  removePeerConnection: (memberId: string) => void;
  getPeerConnection: (memberId: string) => RTCPeerConnection | null;

  // P2P Track Management
  addTrackToPeerConnection: (
    memberId: string,
    track: MediaStreamTrack,
    stream: MediaStream
  ) => Promise<void>;
  removeTrackFromPeerConnection: (
    memberId: string,
    trackKind: "audio" | "video"
  ) => Promise<void>;

  // P2P Signaling
  sendOffer: (toMemberId: string) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => void;

  // P2P Stream Handling
  handleMemberRemoteStream: (memberId: string, event: RTCTrackEvent) => void;

  // P2P Member Management
  addP2PMember: (member: Omit<P2PCallMember, "peerConnection">) => void;
  removeP2PMember: (memberId: string) => void;
  updateP2PMember: (memberId: string, updates: Partial<P2PCallMember>) => void;
  getP2PMember: (memberId: string) => P2PCallMember | undefined;
}

interface SFUActions {
  // SFU Lifecycle
  initializeSFUCall: (chatId: string, isVideo: boolean) => Promise<void>;
  connectToSFURoom: (token: string, url: string) => Promise<void>;
  disconnectFromSFU: () => void;

  // SFU Member Management
  addSFUMember: (member: SFUCallMember) => void;
  removeSFUMember: (memberId: string) => void;
  updateSFUMember: (memberId: string, updates: Partial<SFUCallMember>) => void;
  getSFUMember: (memberId: string) => SFUCallMember | undefined;

  // SFU Event Handlers
  handleSFUParticipantConnected: (participant: RemoteParticipant) => void;
  handleSFUParticipantDisconnected: (participant: RemoteParticipant) => void;
  handleSFUTrackSubscribed: (
    track: MediaStreamTrack,
    participant: RemoteParticipant
  ) => void;
}

// ==================== COMBINED ACTIONS ====================
interface CallStoreActions extends CallCoreActions, P2PActions, SFUActions {}

// ==================== STORE CREATION ====================
export const useCallStore = create<CallStoreState & CallStoreActions>()(
  devtools((set, get) => ({
    // ========== CORE STATE ==========
    chatId: null,
    callStatus: null,
    isVideoCall: false,
    isGroupCall: false,
    callArchitecture: null,
    localVoiceStream: null,
    localVideoStream: null,
    localScreenStream: null,
    isMuted: false,
    isVideoEnabled: false,
    isScreenSharing: false,
    error: null,

    // ========== P2P STATE ==========
    iceCandidates: [],
    p2pMembers: [],

    // ========== SFU STATE ==========
    liveKitService: null,
    sfuMembers: [],

    // ========== CORE ACTIONS ==========
    startCall: async (chatId: string, isVideo: boolean, isGroup: boolean) => {
      if (isGroup) {
        await get().initializeSFUCall(chatId, isVideo);
        set({ callArchitecture: "sfu", isGroupCall: true });
      } else {
        await get().setupLocalStream();
        // P2P initialization logic...
        set({ callArchitecture: "p2p", isGroupCall: false });
      }
      set({ chatId, isVideoCall: isVideo, callStatus: CallStatus.RINGING });
    },

    toggleLocalVoice: () => {
      const { callArchitecture, isMuted } = get();

      if (callArchitecture === "sfu") {
        get().liveKitService?.toggleAudio(!isMuted);
      } else {
        // P2P toggle logic
        toggleVoicePermission();
      }

      set({ isMuted: !isMuted });
    },

    // ========== P2P ACTIONS ==========
    addP2PMember: (member) => {
      const peerConnection = get().createPeerConnection(member.memberId);
      set((state) => ({
        p2pMembers: [...state.p2pMembers, { ...member, peerConnection }],
      }));
    },

    // ========== SFU ACTIONS ==========
    addSFUMember: (member) => {
      set((state) => ({ sfuMembers: [...state.sfuMembers, member] }));
    },

    initializeSFUCall: async (chatId: string, isVideo: boolean) => {
      const liveKitService = new LiveKitService();
      set({ liveKitService });
      // Additional SFU setup...
    },

    // ... other action implementations
  }))
);

// ==================== UTILITY HOOKS ====================
// Helper hooks for components
export const useCallMembers = () => {
  const { callArchitecture, p2pMembers, sfuMembers } = useCallStore();
  return callArchitecture === "p2p" ? p2pMembers : sfuMembers;
};

export const useCallMember = (memberId: string) => {
  const { callArchitecture, getP2PMember, getSFUMember } = useCallStore();
  return callArchitecture === "p2p"
    ? getP2PMember(memberId)
    : getSFUMember(memberId);
};
