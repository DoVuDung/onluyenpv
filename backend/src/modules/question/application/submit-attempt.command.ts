import { Inject, NotFoundException, Injectable } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { SubmitAttemptInput, Attempt } from '@onluyenphongvan/types';
import {
  IQuestionRepository,
  IAttemptRepository,
} from '../domain/repositories.interface';
import { Sm2Service } from '../domain/sm2.service';
import { QUESTION_REPOSITORY } from './get-questions.query';

export const ATTEMPT_REPOSITORY = 'ATTEMPT_REPOSITORY';

export class SubmitAttemptCommand {
  constructor(
    public readonly userId: string,
    public readonly input: SubmitAttemptInput
  ) {}
}

@CommandHandler(SubmitAttemptCommand)
@Injectable()
export class SubmitAttemptHandler
  implements ICommandHandler<SubmitAttemptCommand>
{
  constructor(
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
    @Inject(ATTEMPT_REPOSITORY)
    private readonly attemptRepository: IAttemptRepository,
    private readonly sm2Service: Sm2Service
  ) {}

  async execute(command: SubmitAttemptCommand): Promise<Attempt> {
    const { userId, input } = command;
    const question = await this.questionRepository.findById(input.questionId);

    if (!question) {
      throw new NotFoundException(`Question with ID "${input.questionId}" not found`);
    }

    let isCorrect = false;

    if (question.type === 'multiple-choice' && input.selectedOptionId) {
      const option = question.options?.find((o) => o.id === input.selectedOptionId);
      isCorrect = option?.correct ?? false;
    } else if (question.type === 'fill-blank' && input.submittedAnswer) {
      const userAnswers = input.submittedAnswer
        .split(',')
        .map((s: string) => s.trim().toLowerCase());
      const correctAnswers = (question.blanks ?? []).map((s: string) => s.trim().toLowerCase());
      isCorrect =
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((ans: string, idx: number) => ans === correctAnswers[idx]);
    } else if (question.type === 'code-output' && input.submittedAnswer) {
      isCorrect =
        input.submittedAnswer.trim().toLowerCase() === (question.expectedOutput ?? '').trim().toLowerCase();
    } else if (question.type === 'coding-challenge' && input.submittedAnswer) {
      if (question.testCases && question.testCases.length > 0) {
        isCorrect = question.testCases.every(
          (tc) =>
            input.submittedAnswer!.includes(tc.expectedOutput.trim()) ||
            input.submittedAnswer!.trim() === tc.expectedOutput.trim()
        );
      } else {
        isCorrect = Boolean(input.submittedAnswer.trim());
      }
    }

    const previousAttempt = await this.attemptRepository.findLatestByUserAndQuestion(
      userId,
      input.questionId
    );

    const sm2Result = this.sm2Service.calculate({
      correct: isCorrect,
      durationMs: input.durationMs,
      ...(previousAttempt
        ? {
            previousInterval: previousAttempt.sm2Interval,
            previousEFactor: previousAttempt.sm2EFactor,
            previousRepetitions: previousAttempt.sm2Repetitions,
          }
        : {}),
    });

    const newAttempt = await this.attemptRepository.create({
      userId,
      questionId: input.questionId,
      ...(input.selectedOptionId ? { selectedOptionId: input.selectedOptionId } : {}),
      ...(input.submittedAnswer ? { submittedAnswer: input.submittedAnswer } : {}),
      correct: isCorrect,
      durationMs: input.durationMs,
      sm2Interval: sm2Result.sm2Interval,
      sm2EFactor: sm2Result.sm2EFactor,
      sm2Repetitions: sm2Result.sm2Repetitions,
    });

    return newAttempt;
  }
}
