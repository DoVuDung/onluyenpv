import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ResponseEnvelopeInterceptor } from './shared/interceptors/response-envelope.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  );

  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());

  const allowedOrigins = [
    'http://localhost:3000',
    ...(process.env['CORS_ORIGINS']?.split(',') ?? []),
    ...(process.env['FRONTEND_URL'] ? [process.env['FRONTEND_URL']] : []),
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Frontend Interview Platform API')
    .setDescription('Production-ready API for Frontend Interview Platform (onluyenphongvan)')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3001;
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
