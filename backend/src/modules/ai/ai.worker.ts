import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job } from 'bullmq';
import { AiGatewayService } from './ai-gateway.service';

@Injectable()
export class AiWorkerService implements OnModuleInit, OnModuleDestroy {
  private queue!: Queue;
  private worker!: Worker;
  private readonly logger = new Logger(AiWorkerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly aiGateway: AiGatewayService
  ) {}

  onModuleInit(): void {
    const redisUrl =
      this.configService.get<string>('REDIS_URL') ||
      this.configService.get<string>('REDIS_URI');
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password =
      this.configService.get<string>('REDIS_PASSWORD') ||
      this.configService.get<string>('REDIS_PASS');
    const tls =
      this.configService.get<string>('REDIS_TLS') === 'true' ||
      (redisUrl && redisUrl.startsWith('rediss://')) ||
      (host && host.includes('upstash.io'))
        ? {}
        : undefined;

    const connection: any = redisUrl
      ? {
          url: redisUrl,
          maxRetriesPerRequest: null,
          retryStrategy: (times: number) => (times > 10 ? null : Math.min(times * 500, 5000)),
        }
      : {
          host,
          port,
          ...(password ? { password } : {}),
          ...(tls ? { tls } : {}),
          maxRetriesPerRequest: null,
          retryStrategy: (times: number) => (times > 10 ? null : Math.min(times * 500, 5000)),
        };

    this.queue = new Queue('ai-jobs', { connection });

    this.worker = new Worker(
      'ai-jobs',
      async (job: Job) => {
        this.logger.log(`Processing AI job ${job.id} of type ${job.name}`);
        if (job.name === 'generate-batch-quiz') {
          return this.aiGateway.generateQuiz(job.data as never);
        }
        return null;
      },
      { connection }
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`AI job ${job?.id} failed: ${err.message}`);
    });
  }

  async addJob(name: string, data: unknown): Promise<string | undefined> {
    const job = await this.queue.add(name, data);
    return job.id;
  }

  onModuleDestroy(): void {
    void this.worker.close();
    void this.queue.close();
  }
}
