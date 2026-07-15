import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';
import { Question } from '@onluyenphongvan/types';
import { IQuestionRepository } from '../question/domain/repositories.interface';
import { QUESTION_REPOSITORY } from '../question/application/get-questions.query';

@Injectable()
export class SearchService implements OnModuleInit {
  private meiliClient!: MeiliSearch;
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository
  ) {}

  onModuleInit(): void {
    const host = this.configService.get<string>('MEILI_HOST', 'http://localhost:7700');
    const apiKey =
      this.configService.get<string>('MEILI_API_KEY') ??
      this.configService.get<string>('MEILI_MASTER_KEY') ??
      'masterKey12345678901234567890';

    this.meiliClient = new MeiliSearch({ host, apiKey });
  }

  async indexQuestion(question: Question): Promise<void> {
    try {
      const index = this.meiliClient.index('questions');
      await index.addDocuments([
        {
          id: question._id,
          title: question.title,
          slug: question.slug,
          difficulty: question.difficulty,
          type: question.type,
          markdown: question.markdown.substring(0, 500),
          categoryId: question.categoryId,
        },
      ]);
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(`Failed to index question ${question._id}: ${err.message}`);
      }
    }
  }

  /**
   * Queries Meilisearch for matching IDs, then fetches exact Domain details from MongoDB per docs/09-search.md.
   */
  async searchQuestions(query: string, limit = 20): Promise<Question[]> {
    if (!query || query.trim() === '') {
      const res = await this.questionRepository.findMany({ limit });
      return res.questions;
    }

    try {
      const index = this.meiliClient.index('questions');
      const searchRes = await index.search(query, { limit });
      const ids = searchRes.hits.map((hit: Record<string, unknown>) => String(hit['id']));

      if (ids.length === 0) {
        return [];
      }

      const questions = await Promise.all(
        ids.map((id) => this.questionRepository.findById(id))
      );

      return questions.filter((q): q is Question => q !== null);
    } catch (err) {
      if (err instanceof Error) {
        this.logger.warn(`Meilisearch query failed, falling back to MongoDB repository: ${err.message}`);
      }
      const res = await this.questionRepository.findMany({ limit });
      return res.questions;
    }
  }
}
