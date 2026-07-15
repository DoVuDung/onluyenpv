export * from './schemas';

export type Role = 'guest' | 'user' | 'premium' | 'moderator' | 'admin';

export type Difficulty = 'junior' | 'middle' | 'senior' | 'staff' | 'principal';

export type QuestionType = 'multiple-choice' | 'fill-blank' | 'code-output' | 'coding-challenge';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionOption {
  id: string; // nanoid
  content: string;
  correct: boolean;
}

export interface TestCase {
  id: string; // nanoid
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface QuestionBase {
  _id: string;
  slug: string;
  difficulty: Difficulty;
  title: string;
  markdown: string;
  explanation: string;
  tagIds: string[];
  categoryId: string;
  topicId?: string | undefined;
  companyIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple-choice';
  options: QuestionOption[];
}

export interface FillBlankQuestion extends QuestionBase {
  type: 'fill-blank';
  blanks: string[];
}

export interface CodeOutputQuestion extends QuestionBase {
  type: 'code-output';
  codeSnippet: string;
  expectedOutput: string;
}

export interface CodingChallengeQuestion extends QuestionBase {
  type: 'coding-challenge';
  starterCode: string;
  testCases: TestCase[];
}

export type Question =
  | MultipleChoiceQuestion
  | FillBlankQuestion
  | CodeOutputQuestion
  | CodingChallengeQuestion;

export interface Category {
  _id: string;
  slug: string;
  name: string;
  description: string;
  icon?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  _id: string;
  slug: string;
  name: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  _id: string;
  slug: string;
  name: string;
  logoUrl?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  _id: string;
  slug: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attempt {
  _id: string;
  userId: string;
  questionId: string;
  selectedOptionId?: string | undefined;
  submittedAnswer?: string | undefined;
  correct: boolean;
  durationMs: number;
  sm2Interval: number;
  sm2EFactor: number;
  sm2Repetitions: number;
  createdAt: Date;
}

export interface Bookmark {
  _id: string;
  userId: string;
  questionId: string;
  createdAt: Date;
}

export interface Discussion {
  _id: string;
  questionId: string;
  userId: string;
  content: string;
  parentId?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export type ContestStatus = 'upcoming' | 'live' | 'ended';

export interface Contest {
  _id: string;
  title: string;
  slug: string;
  description: string;
  startTime: Date;
  endTime: Date;
  questionIds: string[];
  status: ContestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  _id: string;
  contestId: string;
  userId: string;
  questionId: string;
  submittedAnswer: string;
  correct: boolean;
  score: number;
  createdAt: Date;
}

export interface Ranking {
  _id: string;
  contestId: string;
  userId: string;
  totalScore: number;
  totalDurationMs: number;
  updatedAt: Date;
}

export interface CursorPaginationMeta {
  cursor: string | null;
  hasNextPage: boolean;
  limit: number;
  total?: number | undefined;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown[] | undefined;
}

export interface EnvelopeResponse<T = unknown> {
  data: T | null;
  meta: CursorPaginationMeta | null;
  error: ApiError | null;
}
