import { AuthenticatedSocket } from '../constants/authenticatedSocket.type';

export function emitWsError(
  client: AuthenticatedSocket,
  error: unknown,
  defaultMessage = 'An error occurred',
) {
  const message =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : defaultMessage;

  client.emit('error', { message });
  console.error('[WS] ❌ Error:', message);
}
