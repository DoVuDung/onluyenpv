import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ContestService } from './contest.service';
import { ContestGateway } from './contest.gateway';
import { ContestController } from './contest.controller';
import { ContestDocumentClass, ContestSchema } from './infrastructure/contest.schema';
import { SubmissionDocumentClass, SubmissionSchema } from './infrastructure/submission.schema';
import { RankingDocumentClass, RankingSchema } from './infrastructure/ranking.schema';
import { QuestionDocumentClass, QuestionSchema } from '../question/infrastructure/question.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: ContestDocumentClass.name, schema: ContestSchema },
      { name: SubmissionDocumentClass.name, schema: SubmissionSchema },
      { name: RankingDocumentClass.name, schema: RankingSchema },
      { name: QuestionDocumentClass.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [ContestController],
  providers: [ContestService, ContestGateway],
  exports: [ContestService, ContestGateway],
})
export class ContestModule {}
