export interface LiveKitWebhookPayload {
  event: string;
  room: {
    name: string;
    numParticipants?: number;
    creationTime?: number;
    [key: string]: unknown;
  };
  participant?: {
    identity: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
