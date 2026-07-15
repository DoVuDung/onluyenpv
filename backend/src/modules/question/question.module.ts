import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';
import { QuestionController } from './question.controller';
import { BookmarkController, BOOKMARK_REPOSITORY } from './bookmark.controller';
import {
  MetadataController,
  CATEGORY_REPOSITORY,
  TOPIC_REPOSITORY,
  COMPANY_REPOSITORY,
  TAG_REPOSITORY,
} from './metadata.controller';
import { QuestionDocumentClass, QuestionSchema } from './infrastructure/question.schema';
import { AttemptDocumentClass, AttemptSchema } from './infrastructure/attempt.schema';
import { BookmarkDocumentClass, BookmarkSchema } from './infrastructure/bookmark.schema';
import { CategoryDocumentClass, CategorySchema } from './infrastructure/category.schema';
import { TopicDocumentClass, TopicSchema } from './infrastructure/topic.schema';
import { CompanyDocumentClass, CompanySchema } from './infrastructure/company.schema';
import { TagDocumentClass, TagSchema } from './infrastructure/tag.schema';
import { QuestionRepositoryImpl } from './infrastructure/question.repository';
import { AttemptRepositoryImpl } from './infrastructure/attempt.repository';
import { BookmarkRepositoryImpl } from './infrastructure/bookmark.repository';
import {
  CategoryRepositoryImpl,
  TopicRepositoryImpl,
  CompanyRepositoryImpl,
  TagRepositoryImpl,
} from './infrastructure/metadata.repositories';
import { QUESTION_REPOSITORY, GetQuestionsHandler } from './application/get-questions.query';
import { GetQuestionBySlugHandler } from './application/get-question-by-slug.query';
import { CreateQuestionHandler } from './application/create-question.command';
import { ATTEMPT_REPOSITORY, SubmitAttemptHandler } from './application/submit-attempt.command';
import { Sm2Service } from './domain/sm2.service';

const QueryHandlers = [GetQuestionsHandler, GetQuestionBySlugHandler];
const CommandHandlers = [CreateQuestionHandler, SubmitAttemptHandler];

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: QuestionDocumentClass.name, schema: QuestionSchema },
      { name: AttemptDocumentClass.name, schema: AttemptSchema },
      { name: BookmarkDocumentClass.name, schema: BookmarkSchema },
      { name: CategoryDocumentClass.name, schema: CategorySchema },
      { name: TopicDocumentClass.name, schema: TopicSchema },
      { name: CompanyDocumentClass.name, schema: CompanySchema },
      { name: TagDocumentClass.name, schema: TagSchema },
    ]),
  ],
  controllers: [QuestionController, BookmarkController, MetadataController],
  providers: [
    Sm2Service,
    ...QueryHandlers,
    ...CommandHandlers,
    { provide: QUESTION_REPOSITORY, useClass: QuestionRepositoryImpl },
    { provide: ATTEMPT_REPOSITORY, useClass: AttemptRepositoryImpl },
    { provide: BOOKMARK_REPOSITORY, useClass: BookmarkRepositoryImpl },
    { provide: CATEGORY_REPOSITORY, useClass: CategoryRepositoryImpl },
    { provide: TOPIC_REPOSITORY, useClass: TopicRepositoryImpl },
    { provide: COMPANY_REPOSITORY, useClass: CompanyRepositoryImpl },
    { provide: TAG_REPOSITORY, useClass: TagRepositoryImpl },
  ],
  exports: [QUESTION_REPOSITORY, ATTEMPT_REPOSITORY, Sm2Service],
})
export class QuestionModule {}
