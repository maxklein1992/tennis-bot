import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AccountService } from './account/account.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api', { exclude: ['/'] });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  await app.get(AccountService).seedFromEnvIfEmpty();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
