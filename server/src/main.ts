// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { JwtIoAdapter } from './jwt.adapter';
import { EnvHelper } from './common/helpers/env.helper';
import { testEnvHelper } from './common/helpers/test-env.helper';

const DEFAULT_PORT = 3000;
const CLIENT_URL = EnvHelper.clientUrl;
const BODY_PARSER_LIMIT = EnvHelper.parseLimit;

async function bootstrap() {
  try {
    testEnvHelper();
    console.log('1️⃣ Starting NestJS application...');

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true,
    });

    console.log('2️⃣ App created, setting up middleware...');

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
      origin: CLIENT_URL,
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
    await app.listen(port);

    console.log('✅ Server started successfully on port', port);
  } catch (error) {
    console.error('❌ Bootstrap failed:', error);
    process.exit(1);
  }
}

void bootstrap();
