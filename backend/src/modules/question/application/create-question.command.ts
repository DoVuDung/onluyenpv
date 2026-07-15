import { Inject, Injectable } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { CreateQuestionInput, Question } from '@onluyenphongvan/types';
import { IQuestionRepository } from '../domain/repositories.interface';
import { QUESTION_REPOSITORY } from './get-questions.query';
import { RedisService } from '../../../shared/redis/redis.service';

export class CreateQuestionCommand {
  constructor(public readonly input: CreateQuestionInput) {}
}

@CommandHandler(CreateQuestionCommand)
@Injectable()
export class CreateQuestionHandler
  implements ICommandHandler<CreateQuestionCommand>
{
  constructor(
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
    private readonly redisService: RedisService
  ) {}

  async execute(command: CreateQuestionCommand): Promise<Question> {
    const question = await this.questionRepository.create(command.input);

    // Invalidate cached lists when new question added per docs/12-cache.md
    await this.redisService.delByPrefix('questions:list:');
    await this.redisService.del(`category:${question.categoryId}`);
    for (const cid of question.companyIds) {
      await this.redisService.del(`company:${cid}`);
    }

    return question;
  }
}
