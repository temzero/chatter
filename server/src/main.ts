// src/main.ts
import { NestFactory } from '@nestjs/core';
import { JwtIoAdapter } from './jwt.adapter';
import { EnvConfig } from './common/config/env.config';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded, raw } from 'express';
import { AppModule } from './app.module';
import { join } from 'path';
import cookieParser from 'cookie-parser';

const DEFAULT_PORT = 3000;
const BODY_PARSER_LIMIT = EnvConfig.parseLimit;

async function bootstrap() {
  try {
    console.log('1️⃣ Starting NestJS application...');

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true,
    });

    console.log('2️⃣ App created, setting up middleware...');

    // RAW BODY FOR LIVEKIT WEBHOOK
    app.use('/webhook/livekit', raw({ type: 'application/webhook+json' }));
    app.use(
      json({
        limit: BODY_PARSER_LIMIT,
        type: ['application/json', 'application/*+json'],
      }),
    );
    app.use(urlencoded({ limit: BODY_PARSER_LIMIT, extended: true }));
    app.use(cookieParser());

    console.log('3️⃣ Middleware configured, setting up CORS...');

    app.enableCors({
      origin: true,
      credentials: true,
    });

    console.log('4️⃣ CORS configured, setting up WebSocket adapter...');

    app.useWebSocketAdapter(new JwtIoAdapter(app));

    console.log('5️⃣ Setting up validation pipes...');

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        validateCustomDecorators: true,
      }),
    );

    console.log('6️⃣ Setting up static assets...');
    app.useStaticAssets(join(__dirname, '..', 'public'));

    console.log('7️⃣ Starting server...');
    const port = process.env.PORT ?? DEFAULT_PORT;
    // CRITICAL: Listen on 0.0.0.0 for Docker/Render
    await app.listen(port, '0.0.0.0');

    console.log('✅ Server started successfully on port', port);
  } catch (error) {
    console.error('❌ Bootstrap failed:', error);
    process.exit(1);
  }
}

void bootstrap();
