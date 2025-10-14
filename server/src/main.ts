import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { JwtIoAdapter } from './jwt.adapter';

const logger = new Logger('Bootstrap');
const DEFAULT_PORT = 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const BODY_PARSER_LIMIT = '100mb';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.use(
    json({
      limit: BODY_PARSER_LIMIT,
      type: ['application/json', 'application/*+json'], // include LiveKit type
    }),
  );
  app.use(urlencoded({ limit: BODY_PARSER_LIMIT, extended: true }));
  app.use(cookieParser());

  // Global configurations
  app.enableCors({
    origin: CLIENT_URL,
    credentials: true,
  });
  app.useWebSocketAdapter(new JwtIoAdapter(app));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validateCustomDecorators: true,
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Start application
  const port = process.env.PORT ?? DEFAULT_PORT;
  await app.listen(port);

  // // Log startup information
  // const server = app.getHttpServer();
  // const address = server.address();
  // const actualPort = typeof address === 'string' ? address : address?.port;

  // logger.log(`Server running on port ${actualPort}`);
  // logger.log(`CORS configured for ${CLIENT_URL}`);
  // logger.log('Static assets served from /public');

  // console.log(`Server running on port ${actualPort}`);
  // console.log(`CORS configured for ${CLIENT_URL}`);
  // console.log(`Static assets served from /public`);
}

bootstrap().catch((err) => {
  logger.error('Failed to start application', err);
  process.exit(1);
});
