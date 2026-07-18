import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { QuestionModule } from '../question/question.module';
import { ContestService } from './contest.service';
import { ContestGateway } from './contest.gateway';
import { ContestController } from './contest.controller';
import { ContestDocumentClass, ContestSchema } from './infrastructure/contest.schema';
import { SubmissionDocumentClass, SubmissionSchema } from './infrastructure/submission.schema';
import { RankingDocumentClass, RankingSchema } from './infrastructure/ranking.schema';
import {
  CONTEST_REPOSITORY,
  RANKING_REPOSITORY,
  SUBMISSION_REPOSITORY,
} from './domain/repositories.interface';
import {
  ContestRepositoryImpl,
  RankingRepositoryImpl,
  SubmissionRepositoryImpl,
} from './infrastructure/contest.repositories';

@Module({
  imports: [
    AuthModule,
    QuestionModule,
    MongooseModule.forFeature([
      { name: ContestDocumentClass.name, schema: ContestSchema },
      { name: SubmissionDocumentClass.name, schema: SubmissionSchema },
      { name: RankingDocumentClass.name, schema: RankingSchema },
    ]),
  ],
  controllers: [ContestController],
  providers: [
    ContestService,
    ContestGateway,
    { provide: CONTEST_REPOSITORY, useClass: ContestRepositoryImpl },
    { provide: RANKING_REPOSITORY, useClass: RankingRepositoryImpl },
    { provide: SUBMISSION_REPOSITORY, useClass: SubmissionRepositoryImpl },
  ],
  exports: [ContestService, ContestGateway, CONTEST_REPOSITORY, RANKING_REPOSITORY, SUBMISSION_REPOSITORY],
})
export class ContestModule {}
