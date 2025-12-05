// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// // livekit-webhook.guard.ts
// import { EnvConfig } from '@/common/config/env.config';
// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   Logger,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { WebhookReceiver } from 'livekit-server-sdk';

// @Injectable()
// export class LiveKitWebhookGuard implements CanActivate {
//   private readonly logger = new Logger(LiveKitWebhookGuard.name);
//   private webhookReceiver: WebhookReceiver;

//   constructor() {
//     this.webhookReceiver = new WebhookReceiver(
//       EnvConfig.livekit.apiKey,
//       EnvConfig.livekit.apiSecret,
//     );

//     this.logger.log('🔐 LiveKit WebhookReceiver initialized');
//     this.logger.log(
//       `📝 API Key: ${EnvConfig.livekit.apiKey.substring(0, 10)}...`,
//     );
//   }

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();

//     try {
//       const authHeader = request.headers['authorization'];

//       if (!authHeader) {
//         this.logger.error('❌ No Authorization header found');
//         throw new UnauthorizedException('Missing Authorization header');
//       }

//       // 🔍 DECODE JWT TO SEE WHICH KEY SIGNED IT
//       try {
//         const parts = authHeader.split('.');
//         if (parts.length === 3) {
//           const payload = JSON.parse(
//             Buffer.from(parts[1], 'base64').toString(),
//           );
//           this.logger.warn('🔍 ========================================');
//           this.logger.warn('🔍 JWT PAYLOAD DECODED:');
//           this.logger.warn(`🔍 Issuer (iss): ${payload.iss}`);
//           this.logger.warn(`🔍 Your API Key: ${EnvConfig.livekit.apiKey}`);
//           this.logger.warn(
//             `🔍 KEYS MATCH: ${payload.iss === EnvConfig.livekit.apiKey}`,
//           );
//           this.logger.warn('🔍 ========================================');
//         }
//       } catch (e) {
//         this.logger.error('Could not decode JWT', e);
//       }

//       const rawBody = request.body;
//       let bodyString: string;

//       if (Buffer.isBuffer(rawBody)) {
//         bodyString = rawBody.toString('utf8');
//       } else if (typeof rawBody === 'string') {
//         bodyString = rawBody;
//       } else {
//         this.logger.error(
//           '❌ Body is neither Buffer nor string:',
//           typeof rawBody,
//         );
//         throw new UnauthorizedException('Invalid body format');
//       }

//       // Verify the webhook
//       const event = await this.webhookReceiver.receive(bodyString, authHeader);
//       request.webhookEvent = event;

//       this.logger.log(`✅ Webhook verified: ${event.event}`);
//       return true;
//     } catch (error) {
//       this.logger.error('❌ Webhook verification failed:', error.message);
//       return false;
//     }
//   }

//   // async canActivate(context: ExecutionContext): Promise<boolean> {
//   //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//   //   const request = context.switchToHttp().getRequest();

//   //   try {
//   //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//   //     const authHeader = request.headers['authorization'];

//   //     if (!authHeader) {
//   //       this.logger.error('❌ No Authorization header found');
//   //       throw new UnauthorizedException('Missing Authorization header');
//   //     }

//   //     // The raw body should be a Buffer from express.raw()
//   //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//   //     const rawBody = request.body;

//   //     this.logger.debug('🔍 Body type:', typeof rawBody);
//   //     this.logger.debug('🔍 Is Buffer:', Buffer.isBuffer(rawBody));

//   //     // Convert Buffer to string for the webhook receiver
//   //     let bodyString: string;

//   //     if (Buffer.isBuffer(rawBody)) {
//   //       bodyString = rawBody.toString('utf8');
//   //     } else if (typeof rawBody === 'string') {
//   //       bodyString = rawBody;
//   //     } else {
//   //       this.logger.error(
//   //         '❌ Body is neither Buffer nor string:',
//   //         typeof rawBody,
//   //       );
//   //       throw new UnauthorizedException('Invalid body format');
//   //     }

//   //     // Verify the webhook with the string body
//   //     const event = await this.webhookReceiver.receive(bodyString, authHeader);

//   //     // Attach the parsed event to the request
//   //     request.webhookEvent = event;

//   //     this.logger.log(`✅ Webhook verified: ${event.event}`);
//   //     return true;
//   //   } catch (error) {
//   //     this.logger.error('❌ Webhook verification failed:', error.message);
//   //     this.logger.error('Stack:', error.stack);
//   //     return false;
//   //   }
//   // }
// }
