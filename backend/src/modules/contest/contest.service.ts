import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  Contest,
  Submission,
  Ranking,
  ContestSubmissionInput,
} from '@onluyenphongvan/types';
import {
  CONTEST_REPOSITORY,
  RANKING_REPOSITORY,
  SUBMISSION_REPOSITORY,
  IContestRepository,
  IRankingRepository,
  ISubmissionRepository,
} from './domain/repositories.interface';
import { QUESTION_REPOSITORY } from '../question/application/get-questions.query';
import { IQuestionRepository } from '../question/domain/repositories.interface';
import { RedisService } from '../../shared/redis/redis.service';

@Injectable()
export class ContestService {
  constructor(
    @Inject(CONTEST_REPOSITORY)
    private readonly contestRepo: IContestRepository,
    @Inject(SUBMISSION_REPOSITORY)
    private readonly submissionRepo: ISubmissionRepository,
    @Inject(RANKING_REPOSITORY)
    private readonly rankingRepo: IRankingRepository,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepo: IQuestionRepository,
    private readonly redisService: RedisService
  ) {}

  async findAll(): Promise<Contest[]> {
    return this.contestRepo.findAll();
  }

  async findById(id: string): Promise<Contest | null> {
    return this.contestRepo.findById(id);
  }

  async getLeaderboard(contestId: string): Promise<Ranking[]> {
    const cacheKey = `leaderboard:${contestId}`;
    const cached = await this.redisService.get<Ranking[]>(cacheKey);
    if (cached) return cached;

    const result = await this.rankingRepo.findByContest(contestId, 100);

    await this.redisService.set(cacheKey, result, 300); // 5 minutes TTL per docs/12-cache.md
    return result;
  }

  /**
   * Submits contest answer inside a multi-document MongoDB transaction via submissionRepo.
   * Atomically creates submission and updates contest ranking.
   */
  async submitAnswer(
    userId: string,
    input: ContestSubmissionInput
  ): Promise<{ submission: Submission; ranking: Ranking }> {
    const contest = await this.contestRepo.findById(input.contestId);
    if (!contest) {
      throw new NotFoundException(`Contest ${input.contestId} not found`);
    }

    const question = await this.questionRepo.findById(input.questionId);
    if (!question) {
      throw new NotFoundException(`Question ${input.questionId} not found`);
    }

    let isCorrect = false;
    if (question.type === 'multiple-choice') {
      const opt = question.options?.find((o) => o.id === input.submittedAnswer);
      isCorrect = opt?.correct ?? false;
    } else if (question.type === 'fill-blank') {
      const userAns = input.submittedAnswer.split(',').map((s: string) => s.trim().toLowerCase());
      const corrAns = (question.blanks ?? []).map((s: string) => s.trim().toLowerCase());
      isCorrect =
        userAns.length === corrAns.length &&
        userAns.every((ans: string, idx: number) => ans === corrAns[idx]);
    } else if (question.type === 'code-output') {
      isCorrect =
        input.submittedAnswer.trim().toLowerCase() === (question.expectedOutput ?? '').trim().toLowerCase();
    } else if (question.type === 'coding-challenge' && input.submittedAnswer) {
      if (question.testCases && question.testCases.length > 0) {
        isCorrect = question.testCases.every(
          (tc) =>
            input.submittedAnswer.includes(tc.expectedOutput.trim()) ||
            input.submittedAnswer.trim() === tc.expectedOutput.trim()
        );
      } else {
        isCorrect = Boolean(input.submittedAnswer.trim());
      }
    }

    const scoreDelta = isCorrect ? 10 : 0;

    const result = await this.submissionRepo.submitAndRank(
      userId,
      input,
      isCorrect,
      scoreDelta
    );

    // Invalidate live leaderboard cache
    await this.redisService.del(`leaderboard:${input.contestId}`);

    return result;
  }
}
