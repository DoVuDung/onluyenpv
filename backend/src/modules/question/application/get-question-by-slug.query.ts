import { Inject, NotFoundException, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Question } from '@onluyenphongvan/types';
import { IQuestionRepository } from '../domain/repositories.interface';
import { QUESTION_REPOSITORY } from './get-questions.query';
import { RedisService } from '../../../shared/redis/redis.service';

export class GetQuestionBySlugQuery {
  constructor(public readonly slug: string) {}
}

@QueryHandler(GetQuestionBySlugQuery)
@Injectable()
export class GetQuestionBySlugHandler
  implements IQueryHandler<GetQuestionBySlugQuery>
{
  constructor(
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
    private readonly redisService: RedisService
  ) {}

  async execute(query: GetQuestionBySlugQuery): Promise<Question> {
    const cacheKey = `question:slug:${query.slug}`;
    const cached = await this.redisService.get<Question>(cacheKey);

    if (cached) {
      return cached;
    }

    const question = await this.questionRepository.findBySlug(query.slug);
    if (!question) {
      throw new NotFoundException(`Question with slug "${query.slug}" not found`);
    }

    // Cache for 30 minutes per docs/12-cache.md
    await this.redisService.set(cacheKey, question, 30 * 60);
    await this.redisService.set(`question:${question._id}`, question, 30 * 60);
    return question;
  }
}
