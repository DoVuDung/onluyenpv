import {
  Question,
  QuestionFilter,
  CreateQuestionInput,
  Attempt,
  Bookmark,
  Category,
  Topic,
  Company,
  Tag,
} from '@onluyenphongvan/types';

export interface IQuestionRepository {
  findById(id: string): Promise<Question | null>;
  findBySlug(slug: string): Promise<Question | null>;
  findMany(filter: QuestionFilter): Promise<{ questions: Question[]; nextCursor: string | null; total: number }>;
  create(input: CreateQuestionInput): Promise<Question>;
}

export interface IAttemptRepository {
  create(data: Omit<Attempt, '_id' | 'createdAt'>): Promise<Attempt>;
  findLatestByUserAndQuestion(userId: string, questionId: string): Promise<Attempt | null>;
  findByUser(userId: string, limit: number, cursor?: string): Promise<{ attempts: Attempt[]; nextCursor: string | null }>;
}

export interface IBookmarkRepository {
  create(userId: string, questionId: string): Promise<Bookmark>;
  delete(userId: string, questionId: string): Promise<boolean>;
  findByUser(userId: string): Promise<Bookmark[]>;
  exists(userId: string, questionId: string): Promise<boolean>;
}

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  create(data: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>): Promise<Category>;
}

export interface ITopicRepository {
  findByCategory(categoryId: string): Promise<Topic[]>;
}

export interface ICompanyRepository {
  findAll(): Promise<Company[]>;
  findBySlug(slug: string): Promise<Company | null>;
  create(data: Omit<Company, '_id' | 'createdAt' | 'updatedAt'>): Promise<Company>;
}

export interface ITagRepository {
  findAll(): Promise<Tag[]>;
}
