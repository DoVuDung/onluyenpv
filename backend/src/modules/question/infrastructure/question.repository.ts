import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
  Question,
  QuestionFilter,
  CreateQuestionInput,
} from '@onluyenphongvan/types';
import { IQuestionRepository } from '../domain/repositories.interface';
import { QuestionDocument, QuestionDocumentClass } from './question.schema';

@Injectable()
export class QuestionRepositoryImpl implements IQuestionRepository {
  constructor(
    @InjectModel(QuestionDocumentClass.name)
    private readonly questionModel: Model<QuestionDocument>
  ) {}

  private mapToDomain(doc: QuestionDocument): Question {
    const base = {
      _id: doc._id.toString(),
      slug: doc.slug,
      difficulty: doc.difficulty,
      title: doc.title,
      markdown: doc.markdown,
      explanation: doc.explanation,
      tagIds: doc.tagIds,
      categoryId: doc.categoryId,
      topicId: doc.topicId,
      companyIds: doc.companyIds,
      createdAt: (doc as unknown as { createdAt: Date }).createdAt || new Date(),
      updatedAt: (doc as unknown as { updatedAt: Date }).updatedAt || new Date(),
    };

    switch (doc.type) {
      case 'multiple-choice':
        return {
          ...base,
          type: 'multiple-choice',
          options: doc.options ?? [],
        };
      case 'fill-blank':
        return {
          ...base,
          type: 'fill-blank',
          blanks: doc.blanks ?? [],
        };
      case 'code-output':
        return {
          ...base,
          type: 'code-output',
          codeSnippet: doc.codeSnippet ?? '',
          expectedOutput: doc.expectedOutput ?? '',
        };
      case 'coding-challenge':
        return {
          ...base,
          type: 'coding-challenge',
          starterCode: doc.starterCode ?? '',
          testCases: doc.testCases ?? [],
        };
    }
  }

  async findById(id: string): Promise<Question | null> {
    const doc = await this.questionModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findBySlug(slug: string): Promise<Question | null> {
    const doc = await this.questionModel.findOne({ slug }).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findMany(
    filter: QuestionFilter
  ): Promise<{ questions: Question[]; nextCursor: string | null; total: number }> {
    const query: FilterQuery<QuestionDocument> = {};

    if (filter.difficulty) {
      query.difficulty = filter.difficulty;
    }
    if (filter.categoryId) {
      query.categoryId = filter.categoryId;
    }
    if (filter.topicId) {
      query.topicId = filter.topicId;
    }
    if (filter.companyId) {
      query.companyIds = filter.companyId;
    }
    if (filter.tagId) {
      query.tagIds = filter.tagId;
    }
    if (filter.type) {
      query.type = filter.type;
    }
    if (filter.cursor) {
      query._id = { $lt: filter.cursor };
    }

    const limit = filter.limit ?? 20;

    const [docs, total] = await Promise.all([
      this.questionModel
        .find(query)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .exec(),
      this.questionModel.countDocuments(
        filter.cursor ? { ...query, _id: { $exists: true } } : query
      ).exec(),
    ]);

    let nextCursor: string | null = null;
    if (docs.length > limit) {
      const lastItem = docs.pop();
      if (lastItem) {
        nextCursor = docs[docs.length - 1]?._id.toString() ?? null;
      }
    }

    return {
      questions: docs.map((doc) => this.mapToDomain(doc)),
      nextCursor,
      total,
    };
  }

  async create(input: CreateQuestionInput): Promise<Question> {
    const doc = new this.questionModel({
      slug: input.slug,
      difficulty: input.difficulty,
      title: input.title,
      markdown: input.markdown,
      explanation: input.explanation,
      type: input.type,
      tagIds: input.tagIds,
      categoryId: input.categoryId,
      topicId: input.topicId,
      companyIds: input.companyIds,
      ...(input.type === 'multiple-choice' ? { options: input.options } : {}),
      ...(input.type === 'fill-blank' ? { blanks: input.blanks } : {}),
      ...(input.type === 'code-output'
        ? { codeSnippet: input.codeSnippet, expectedOutput: input.expectedOutput }
        : {}),
      ...(input.type === 'coding-challenge'
        ? { starterCode: input.starterCode, testCases: input.testCases }
        : {}),
    });

    const saved = await doc.save();
    return this.mapToDomain(saved);
  }
}
