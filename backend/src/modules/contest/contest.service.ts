import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import {
  Contest,
  Submission,
  Ranking,
  ContestSubmissionInput,
} from '@onluyenphongvan/types';
import { ContestDocument, ContestDocumentClass } from './infrastructure/contest.schema';
import { SubmissionDocument, SubmissionDocumentClass } from './infrastructure/submission.schema';
import { RankingDocument, RankingDocumentClass } from './infrastructure/ranking.schema';
import { QuestionDocumentClass, QuestionDocument } from '../question/infrastructure/question.schema';
import { RedisService } from '../../shared/redis/redis.service';

@Injectable()
export class ContestService {
  constructor(
    @InjectModel(ContestDocumentClass.name)
    private readonly contestModel: Model<ContestDocument>,
    @InjectModel(SubmissionDocumentClass.name)
    private readonly submissionModel: Model<SubmissionDocument>,
    @InjectModel(RankingDocumentClass.name)
    private readonly rankingModel: Model<RankingDocument>,
    @InjectModel(QuestionDocumentClass.name)
    private readonly questionModel: Model<QuestionDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly redisService: RedisService
  ) {}

  private mapContest(doc: ContestDocument): Contest {
    return {
      _id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      startTime: doc.startTime,
      endTime: doc.endTime,
      questionIds: doc.questionIds,
      status: doc.status,
      createdAt: (doc as unknown as { createdAt: Date }).createdAt || new Date(),
      updatedAt: (doc as unknown as { updatedAt: Date }).updatedAt || new Date(),
    };
  }

  async findAll(): Promise<Contest[]> {
    const docs = await this.contestModel.find().sort({ startTime: -1 }).exec();
    return docs.map((d) => this.mapContest(d));
  }

  async findById(id: string): Promise<Contest | null> {
    const doc = await this.contestModel.findById(id).exec();
    return doc ? this.mapContest(doc) : null;
  }

  async getLeaderboard(contestId: string): Promise<Ranking[]> {
    const cacheKey = `leaderboard:${contestId}`;
    const cached = await this.redisService.get<Ranking[]>(cacheKey);
    if (cached) return cached;

    const docs = await this.rankingModel
      .find({ contestId })
      .sort({ totalScore: -1, totalDurationMs: 1 })
      .limit(100)
      .exec();

    const result = docs.map((d) => ({
      _id: d._id.toString(),
      contestId: d.contestId,
      userId: d.userId,
      totalScore: d.totalScore,
      totalDurationMs: d.totalDurationMs,
      updatedAt: (d as unknown as { updatedAt: Date }).updatedAt || new Date(),
    }));

    await this.redisService.set(cacheKey, result, 300); // 5 minutes TTL per docs/12-cache.md
    return result;
  }

  /**
   * Submits contest answer inside a multi-document MongoDB transaction.
   * Atomically creates submission and updates contest ranking.
   */
  async submitAnswer(
    userId: string,
    input: ContestSubmissionInput
  ): Promise<{ submission: Submission; ranking: Ranking }> {
    const contest = await this.contestModel.findById(input.contestId).exec();
    if (!contest) {
      throw new NotFoundException(`Contest ${input.contestId} not found`);
    }

    const question = await this.questionModel.findById(input.questionId).exec();
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
    }

    const scoreDelta = isCorrect ? 10 : 0;

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const [submissionDoc] = await this.submissionModel.create(
        [
          {
            contestId: input.contestId,
            userId,
            questionId: input.questionId,
            submittedAnswer: input.submittedAnswer,
            correct: isCorrect,
            score: scoreDelta,
          },
        ],
        { session }
      );

      const rankingDoc = await this.rankingModel.findOneAndUpdate(
        { contestId: input.contestId, userId },
        {
          $inc: {
            totalScore: scoreDelta,
            totalDurationMs: input.durationMs,
          },
        },
        { new: true, upsert: true, session }
      );

      await session.commitTransaction();

      // Invalidate live leaderboard cache
      await this.redisService.del(`leaderboard:${input.contestId}`);

      if (!submissionDoc || !rankingDoc) {
        throw new BadRequestException('Failed to process transaction');
      }

      return {
        submission: {
          _id: submissionDoc._id.toString(),
          contestId: submissionDoc.contestId,
          userId: submissionDoc.userId,
          questionId: submissionDoc.questionId,
          submittedAnswer: submissionDoc.submittedAnswer,
          correct: submissionDoc.correct,
          score: submissionDoc.score,
          createdAt: (submissionDoc as unknown as { createdAt: Date }).createdAt || new Date(),
        },
        ranking: {
          _id: rankingDoc._id.toString(),
          contestId: rankingDoc.contestId,
          userId: rankingDoc.userId,
          totalScore: rankingDoc.totalScore,
          totalDurationMs: rankingDoc.totalDurationMs,
          updatedAt: (rankingDoc as unknown as { updatedAt: Date }).updatedAt || new Date(),
        },
      };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}
