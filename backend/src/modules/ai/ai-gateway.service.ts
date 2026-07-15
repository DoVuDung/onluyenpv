import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import {
  AiGenerateQuizInput,
  AiExplainInput,
  AiCoachChatInput,
  QuestionOption,
} from '@onluyenphongvan/types';
import { RedisService } from '../../shared/redis/redis.service';

const aiQuizOutputSchema = z.object({
  questions: z.array(
    z.object({
      title: z.string(),
      markdown: z.string(),
      explanation: z.string(),
      options: z.array(
        z.object({
          id: z.string(),
          content: z.string(),
          correct: z.boolean(),
        })
      ),
    })
  ),
});

const aiExplainOutputSchema = z.object({
  whyWrong: z.string(),
  conceptToReview: z.string(),
  suggestedAction: z.string(),
});

const aiCoachOutputSchema = z.object({
  reply: z.string(),
  suggestedFollowUpQuestions: z.array(z.string()).optional(),
});

@Injectable()
export class AiGatewayService {
  private readonly logger = new Logger(AiGatewayService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService
  ) {}

  /**
   * Generates mock questions using AI, strictly validating format via Zod before returning.
   */
  async generateQuiz(
    input: AiGenerateQuizInput
  ): Promise<
    {
      title: string;
      markdown: string;
      explanation: string;
      options: QuestionOption[];
    }[]
  > {
    const cacheKey = `ai:quiz:${JSON.stringify(input)}`;
    const cached = await this.redisService.get<
      {
        title: string;
        markdown: string;
        explanation: string;
        options: QuestionOption[];
      }[]
    >(cacheKey);
    if (cached) return cached;

    const apiKey = this.configService.get<string>('AI_API_KEY', 'mock-key');
    this.logger.log(`Calling AI Gateway (provider mode: ${apiKey ? 'configured' : 'mock'}) for quiz generation: ${JSON.stringify(input)}`);

    // In production, call OpenAI/Gemini SDK via this central gateway.
    // For reliable demo/testing, we return structured questions adhering strictly to Zod schema.
    const rawAiOutput = {
      questions: Array.from({ length: input.count }).map((_, i) => ({
        title: `AI Generated Question ${i + 1} (${input.difficulty.toUpperCase()})`,
        markdown: `What is the primary optimization technique for React components when rendering large lists in **${input.difficulty}** level applications?`,
        explanation: `Virtualization or windowing (using libraries like TanStack Virtual) renders only items currently visible in the DOM, reducing layout thrashing and memory consumption.`,
        options: [
          { id: 'opt1', content: 'Use windowing/virtualization (e.g. TanStack Virtual)', correct: true },
          { id: 'opt2', content: 'Use inline CSS styles instead of className', correct: false },
          { id: 'opt3', content: 'Disable React StrictMode in production', correct: false },
          { id: 'opt4', content: 'Wrap every single component inside React.memo()', correct: false },
        ],
      })),
    };

    const validated = aiQuizOutputSchema.parse(rawAiOutput);
    await this.redisService.set(cacheKey, validated.questions, 60 * 60); // 1 hour cache
    return validated.questions;
  }

  /**
   * Explains a wrong answer and suggests targeted review concepts.
   */
  async explainWrongAnswer(
    input: AiExplainInput
  ): Promise<{ whyWrong: string; conceptToReview: string; suggestedAction: string }> {
    const cacheKey = `ai:explain:${input.questionId}:${input.userAnswer}`;
    const cached = await this.redisService.get<{
      whyWrong: string;
      conceptToReview: string;
      suggestedAction: string;
    }>(cacheKey);
    if (cached) return cached;

    const rawOutput = {
      whyWrong: `Your selected answer "${input.userAnswer}" does not account for asynchronous state batching in React 19 / Next.js server components.`,
      conceptToReview: 'React State Batching & Server Actions lifecycle',
      suggestedAction: 'Review the official React 19 docs on Server Actions and useTransition hooks, then re-attempt the practice quiz.',
    };

    const validated = aiExplainOutputSchema.parse(rawOutput);
    await this.redisService.set(cacheKey, validated, 24 * 60 * 60);
    return validated;
  }

  /**
   * Conversational AI Coach tailored to Frontend Interview preparation.
   */
  async coachChat(
    input: AiCoachChatInput
  ): Promise<{ reply: string; suggestedFollowUpQuestions?: string[] | undefined }> {
    const lastMsg = input.messages[input.messages.length - 1]?.content ?? '';

    const rawOutput = {
      reply: `I am your AI Coach. Based on your inquiry regarding "${lastMsg.substring(0, 50)}", I recommend focusing on building clear architectural boundaries, understanding Browser Rendering engines (Reflow vs Repaint), and mastering Next.js 16 Server Components.`,
      suggestedFollowUpQuestions: [
        'How does Next.js 16 handle Partial Prerendering (PPR)?',
        'What is the difference between useActionState and useTransition?',
      ],
    };

    return aiCoachOutputSchema.parse(rawOutput);
  }
}
