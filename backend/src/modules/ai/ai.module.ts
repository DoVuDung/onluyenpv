import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { AiGatewayService } from './ai-gateway.service';
import { AiController } from './ai.controller';
import { AiWorkerService } from './ai.worker';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [AiController],
  providers: [AiGatewayService, AiWorkerService],
  exports: [AiGatewayService, AiWorkerService],
})
export class AiModule {}
