import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  AiGenerateQuizInput,
  aiGenerateQuizInputSchema,
  AiExplainInput,
  aiExplainInputSchema,
  AiCoachChatInput,
  aiCoachChatInputSchema,
  QuestionOption,
} from '@onluyenphongvan/types';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { AiGatewayService } from './ai-gateway.service';

@UseGuards(AuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiGateway: AiGatewayService) {}

  @Post('generate-quiz')
  async generateQuiz(
    @Body(new ZodValidationPipe(aiGenerateQuizInputSchema)) body: AiGenerateQuizInput
  ): Promise<{ title: string; markdown: string; explanation: string; options: QuestionOption[] }[]> {
    return this.aiGateway.generateQuiz(body);
  }

  @Post('explain')
  async explain(
    @Body(new ZodValidationPipe(aiExplainInputSchema)) body: AiExplainInput
  ): Promise<{ whyWrong: string; conceptToReview: string; suggestedAction: string }> {
    return this.aiGateway.explainWrongAnswer(body);
  }

  @Post('coach')
  async coach(
    @Body(new ZodValidationPipe(aiCoachChatInputSchema)) body: AiCoachChatInput
  ): Promise<{ reply: string; suggestedFollowUpQuestions?: string[] | undefined }> {
    return this.aiGateway.coachChat(body);
  }
}
