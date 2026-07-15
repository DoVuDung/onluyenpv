import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FastifyRequest } from 'fastify';
import {
  Question,
  QuestionFilter,
  questionFilterSchema,
  createQuestionInputSchema,
  CreateQuestionInput,
  submitAttemptInputSchema,
  SubmitAttemptInput,
  Attempt,
  User,
} from '@onluyenphongvan/types';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetQuestionsQuery } from './application/get-questions.query';
import { GetQuestionBySlugQuery } from './application/get-question-by-slug.query';
import { CreateQuestionCommand } from './application/create-question.command';
import { SubmitAttemptCommand } from './application/submit-attempt.command';

interface RequestWithUser extends FastifyRequest {
  user?: User;
}

@Controller('questions')
export class QuestionController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @Get()
  async getQuestions(
    @Query(new ZodValidationPipe(questionFilterSchema)) filter: QuestionFilter
  ): Promise<{ questions: Question[]; nextCursor: string | null; total: number }> {
    return this.queryBus.execute(new GetQuestionsQuery(filter));
  }

  @Get(':slug')
  async getQuestionBySlug(@Param('slug') slug: string): Promise<Question> {
    return this.queryBus.execute(new GetQuestionBySlugQuery(slug));
  }

  @UseGuards(AuthGuard)
  @Roles('admin', 'moderator')
  @Post()
  async createQuestion(
    @Body(new ZodValidationPipe(createQuestionInputSchema)) body: CreateQuestionInput
  ): Promise<Question> {
    return this.commandBus.execute(new CreateQuestionCommand(body));
  }

  @UseGuards(AuthGuard)
  @Post('attempts')
  async submitAttempt(
    @Req() req: RequestWithUser,
    @Body(new ZodValidationPipe(submitAttemptInputSchema)) body: SubmitAttemptInput
  ): Promise<Attempt> {
    if (!req.user) {
      throw new Error('User context missing');
    }
    return this.commandBus.execute(new SubmitAttemptCommand(req.user._id, body));
  }
}
