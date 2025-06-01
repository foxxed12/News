import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Глобальные валидации DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // Включаем CORS для взаимодействия с фронтендом
  app.enableCors({
  origin: 'http://localhost:3000', // точный адрес фронта
  credentials: true,               // разрешаем cookie, токены и т.п.
});


  await app.listen(3001);
  console.log(`🚀 Backend is running on: http://localhost:3001`);
}
bootstrap();
