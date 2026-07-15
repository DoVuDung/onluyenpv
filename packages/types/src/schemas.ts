import { z } from 'zod';

export const roleSchema = z.enum(['guest', 'user', 'premium', 'moderator', 'admin']);
export const difficultySchema = z.enum(['junior', 'middle', 'senior', 'staff', 'principal']);
export const questionTypeSchema = z.enum(['multiple-choice', 'fill-blank', 'code-output', 'coding-challenge']);

export const questionOptionSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1),
  correct: z.boolean(),
});

export const testCaseSchema = z.object({
  id: z.string().min(1),
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean(),
});

export const createQuestionInputSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('multiple-choice'),
    slug: z.string().min(1),
    difficulty: difficultySchema,
    title: z.string().min(3),
    markdown: z.string().min(10),
    explanation: z.string().min(5),
    tagIds: z.array(z.string()),
    categoryId: z.string().min(1),
    topicId: z.string().optional(),
    companyIds: z.array(z.string()),
    options: z.array(questionOptionSchema).min(2),
  }),
  z.object({
    type: z.literal('fill-blank'),
    slug: z.string().min(1),
    difficulty: difficultySchema,
    title: z.string().min(3),
    markdown: z.string().min(10),
    explanation: z.string().min(5),
    tagIds: z.array(z.string()),
    categoryId: z.string().min(1),
    topicId: z.string().optional(),
    companyIds: z.array(z.string()),
    blanks: z.array(z.string()).min(1),
  }),
  z.object({
    type: z.literal('code-output'),
    slug: z.string().min(1),
    difficulty: difficultySchema,
    title: z.string().min(3),
    markdown: z.string().min(10),
    explanation: z.string().min(5),
    tagIds: z.array(z.string()),
    categoryId: z.string().min(1),
    topicId: z.string().optional(),
    companyIds: z.array(z.string()),
    codeSnippet: z.string().min(1),
    expectedOutput: z.string().min(1),
  }),
  z.object({
    type: z.literal('coding-challenge'),
    slug: z.string().min(1),
    difficulty: difficultySchema,
    title: z.string().min(3),
    markdown: z.string().min(10),
    explanation: z.string().min(5),
    tagIds: z.array(z.string()),
    categoryId: z.string().min(1),
    topicId: z.string().optional(),
    companyIds: z.array(z.string()),
    starterCode: z.string().min(1),
    testCases: z.array(testCaseSchema).min(1),
  }),
]);

export type CreateQuestionInput = z.infer<typeof createQuestionInputSchema>;

export const submitAttemptInputSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().optional(),
  submittedAnswer: z.string().optional(),
  durationMs: z.number().int().nonnegative(),
});

export type SubmitAttemptInput = z.infer<typeof submitAttemptInputSchema>;

export const questionFilterSchema = z.object({
  difficulty: difficultySchema.optional(),
  categoryId: z.string().optional(),
  topicId: z.string().optional(),
  companyId: z.string().optional(),
  tagId: z.string().optional(),
  type: questionTypeSchema.optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type QuestionFilter = z.infer<typeof questionFilterSchema>;

export const aiGenerateQuizInputSchema = z.object({
  difficulty: difficultySchema,
  categoryId: z.string().min(1),
  topicId: z.string().optional(),
  companyId: z.string().optional(),
  count: z.number().int().min(1).max(10).default(5),
});

export type AiGenerateQuizInput = z.infer<typeof aiGenerateQuizInputSchema>;

export const aiExplainInputSchema = z.object({
  questionId: z.string().min(1),
  userAnswer: z.string().min(1),
});

export type AiExplainInput = z.infer<typeof aiExplainInputSchema>;

export const aiCoachChatInputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1),
    })
  ).min(1),
});

export type AiCoachChatInput = z.infer<typeof aiCoachChatInputSchema>;

export const contestSubmissionInputSchema = z.object({
  contestId: z.string().min(1),
  questionId: z.string().min(1),
  submittedAnswer: z.string().min(1),
  durationMs: z.number().int().nonnegative(),
});

export type ContestSubmissionInput = z.infer<typeof contestSubmissionInputSchema>;
