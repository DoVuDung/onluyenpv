import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Contest, Ranking, Submission, ContestSubmissionInput } from '@onluyenphongvan/types';
import {
  IContestRepository,
  IRankingRepository,
  ISubmissionRepository,
} from '../domain/repositories.interface';
import { ContestDocument, ContestDocumentClass } from './contest.schema';
import { RankingDocument, RankingDocumentClass } from './ranking.schema';
import { SubmissionDocument, SubmissionDocumentClass } from './submission.schema';

@Injectable()
export class ContestRepositoryImpl implements IContestRepository {
  constructor(
    @InjectModel(ContestDocumentClass.name)
    private readonly contestModel: Model<ContestDocument>
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
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
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
}

@Injectable()
export class RankingRepositoryImpl implements IRankingRepository {
  constructor(
    @InjectModel(RankingDocumentClass.name)
    private readonly rankingModel: Model<RankingDocument>
  ) {}

  async findByContest(contestId: string, limit: number): Promise<Ranking[]> {
    const docs = await this.rankingModel
      .find({ contestId })
      .sort({ totalScore: -1, totalDurationMs: 1 })
      .limit(limit)
      .exec();

    return docs.map((d) => ({
      _id: d._id.toString(),
      contestId: d.contestId,
      userId: d.userId,
      totalScore: d.totalScore,
      totalDurationMs: d.totalDurationMs,
      updatedAt: d.updatedAt || new Date(),
    }));
  }
}

@Injectable()
export class SubmissionRepositoryImpl implements ISubmissionRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(SubmissionDocumentClass.name)
    private readonly submissionModel: Model<SubmissionDocument>,
    @InjectModel(RankingDocumentClass.name)
    private readonly rankingModel: Model<RankingDocument>
  ) {}

  async submitAndRank(
    userId: string,
    input: ContestSubmissionInput,
    isCorrect: boolean,
    scoreDelta: number
  ): Promise<{ submission: Submission; ranking: Ranking }> {
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
          createdAt: submissionDoc.createdAt || new Date(),
        },
        ranking: {
          _id: rankingDoc._id.toString(),
          contestId: rankingDoc.contestId,
          userId: rankingDoc.userId,
          totalScore: rankingDoc.totalScore,
          totalDurationMs: rankingDoc.totalDurationMs,
          updatedAt: rankingDoc.updatedAt || new Date(),
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
