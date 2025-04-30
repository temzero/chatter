import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      whitelist: true, // Automatically remove properties that are not in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are found
      validateCustomDecorators: true, // Validate custom decorators like @IsString, etc.
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
