import { NotFoundException } from '@nestjs/common';
import { SubmitAttemptHandler, SubmitAttemptCommand } from './submit-attempt.command';
import { Sm2Service } from '../domain/sm2.service';
import { IQuestionRepository, IAttemptRepository } from '../domain/repositories.interface';
import { Question } from '@onluyenphongvan/types';

describe('SubmitAttemptHandler', () => {
  let handler: SubmitAttemptHandler;
  let mockQuestionRepo: jest.Mocked<IQuestionRepository>;
  let mockAttemptRepo: jest.Mocked<IAttemptRepository>;
  let sm2Service: Sm2Service;

  beforeEach(() => {
    mockQuestionRepo = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    };

    mockAttemptRepo = {
      create: jest.fn(),
      findLatestByUserAndQuestion: jest.fn(),
      findByUser: jest.fn(),
    };

    sm2Service = new Sm2Service();

    handler = new SubmitAttemptHandler(mockQuestionRepo, mockAttemptRepo, sm2Service);
  });

  it('should throw NotFoundException if question does not exist', async () => {
    mockQuestionRepo.findById.mockResolvedValue(null);

    await expect(
      handler.execute(
        new SubmitAttemptCommand('user_123', {
          questionId: 'q_999',
          durationMs: 12000,
        })
      )
    ).rejects.toThrow(NotFoundException);
  });

  it('should grade multiple-choice question correctly and store attempt', async () => {
    const mockQuestion: Question = {
      _id: 'q_1',
      slug: 'react-hooks',
      difficulty: 'middle',
      title: 'React Hooks Question',
      markdown: 'What is useEffect used for?',
      explanation: 'Side effects handling.',
      type: 'multiple-choice',
      options: [
        { id: 'opt_1', content: 'Side effects', correct: true },
        { id: 'opt_2', content: 'Styling', correct: false },
      ],
      tagIds: ['tag_1'],
      categoryId: 'cat_1',
      companyIds: ['comp_1'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
    mockAttemptRepo.findLatestByUserAndQuestion.mockResolvedValue(null);
    mockAttemptRepo.create.mockImplementation(async (data) => ({
      _id: 'att_1',
      ...data,
      createdAt: new Date(),
    }));

    const result = await handler.execute(
      new SubmitAttemptCommand('user_123', {
        questionId: 'q_1',
        selectedOptionId: 'opt_1',
        durationMs: 20000,
      })
    );

    expect(result.correct).toBe(true);
    expect(result.sm2Interval).toBe(1);
    expect(mockAttemptRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_123',
        questionId: 'q_1',
        selectedOptionId: 'opt_1',
        correct: true,
      })
    );
  });
});
