import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attempt } from '@onluyenphongvan/types';
import { IAttemptRepository } from '../domain/repositories.interface';
import { AttemptDocument, AttemptDocumentClass } from './attempt.schema';

@Injectable()
export class AttemptRepositoryImpl implements IAttemptRepository {
  constructor(
    @InjectModel(AttemptDocumentClass.name)
    private readonly attemptModel: Model<AttemptDocument>
  ) {}

  private mapToDomain(doc: AttemptDocument): Attempt {
    return {
      _id: doc._id.toString(),
      userId: doc.userId,
      questionId: doc.questionId,
      selectedOptionId: doc.selectedOptionId,
      submittedAnswer: doc.submittedAnswer,
      correct: doc.correct,
      durationMs: doc.durationMs,
      sm2Interval: doc.sm2Interval,
      sm2EFactor: doc.sm2EFactor,
      sm2Repetitions: doc.sm2Repetitions,
      createdAt: (doc as unknown as { createdAt: Date }).createdAt || new Date(),
    };
  }

  async create(data: Omit<Attempt, '_id' | 'createdAt'>): Promise<Attempt> {
    const doc = new this.attemptModel(data);
    const saved = await doc.save();
    return this.mapToDomain(saved);
  }

  async findLatestByUserAndQuestion(
    userId: string,
    questionId: string
  ): Promise<Attempt | null> {
    const doc = await this.attemptModel
      .findOne({ userId, questionId })
      .sort({ createdAt: -1 })
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByUser(
    userId: string,
    limit: number,
    cursor?: string
  ): Promise<{ attempts: Attempt[]; nextCursor: string | null }> {
    const query = cursor
      ? { userId, _id: { $lt: cursor } }
      : { userId };

    const docs = await this.attemptModel
      .find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .exec();

    let nextCursor: string | null = null;
    if (docs.length > limit) {
      const last = docs.pop();
      if (last && docs[docs.length - 1]) {
        nextCursor = docs[docs.length - 1]?._id.toString() ?? null;
      }
    }

    return {
      attempts: docs.map((doc) => this.mapToDomain(doc)),
      nextCursor,
    };
  }
}
