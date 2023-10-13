import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const result = errors.map((error) => {
          if (error.children.length > 0) {
            return error.children.map((error) => {
              return {
                property: error.children[0].property,
                message:
                  error.children[0].constraints[
                    Object.keys(error.children[0].constraints)[0]
                  ],
              };
            });
          }

          return {
            property: error.property,
            message: error.constraints[Object.keys(error.constraints)[0]],
          };
        });
        return new BadRequestException(result);
      },
      stopAtFirstError: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('troca/api/');
  app.useStaticAssets(path.join(__dirname, './tmp/uploads'));
  app.useWebSocketAdapter(redisIoAdapter);
  await app.listen(3333);
}
bootstrap();
