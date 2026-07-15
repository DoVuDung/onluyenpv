import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuestionFilter, Question } from '@onluyenphongvan/types';
import { IQuestionRepository } from '../domain/repositories.interface';
import { RedisService } from '../../../shared/redis/redis.service';

export const QUESTION_REPOSITORY = 'QUESTION_REPOSITORY';

export class GetQuestionsQuery {
  constructor(public readonly filter: QuestionFilter) {}
}

@QueryHandler(GetQuestionsQuery)
@Injectable()
export class GetQuestionsHandler implements IQueryHandler<GetQuestionsQuery> {
  constructor(
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
    private readonly redisService: RedisService
  ) {}

  async execute(
    query: GetQuestionsQuery
  ): Promise<{ questions: Question[]; nextCursor: string | null; total: number }> {
    const cacheKey = `questions:list:${JSON.stringify(query.filter)}`;
    const cached = await this.redisService.get<{
      questions: Question[];
      nextCursor: string | null;
      total: number;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.questionRepository.findMany(query.filter);
    // Cache for 30 minutes per docs/12-cache.md
    await this.redisService.set(cacheKey, result, 30 * 60);
    return result;
  }
}
