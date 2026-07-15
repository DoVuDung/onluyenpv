import { Controller, Get, Query, Param, Inject } from '@nestjs/common';
import { Category, Topic, Company, Tag } from '@onluyenphongvan/types';
import {
  ICategoryRepository,
  ITopicRepository,
  ICompanyRepository,
  ITagRepository,
} from './domain/repositories.interface';

export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY';
export const TOPIC_REPOSITORY = 'TOPIC_REPOSITORY';
export const COMPANY_REPOSITORY = 'COMPANY_REPOSITORY';
export const TAG_REPOSITORY = 'TAG_REPOSITORY';

@Controller()
export class MetadataController {
  constructor(
    @Inject(CATEGORY_REPOSITORY) private readonly categoryRepo: ICategoryRepository,
    @Inject(TOPIC_REPOSITORY) private readonly topicRepo: ITopicRepository,
    @Inject(COMPANY_REPOSITORY) private readonly companyRepo: ICompanyRepository,
    @Inject(TAG_REPOSITORY) private readonly tagRepo: ITagRepository
  ) {}

  @Get('categories')
  async getCategories(): Promise<Category[]> {
    return this.categoryRepo.findAll();
  }

  @Get('topics')
  async getTopics(@Query('categoryId') categoryId?: string): Promise<Topic[]> {
    if (!categoryId) return [];
    return this.topicRepo.findByCategory(categoryId);
  }

  @Get('companies')
  async getCompanies(): Promise<Company[]> {
    return this.companyRepo.findAll();
  }

  @Get('companies/:slug')
  async getCompanyBySlug(@Param('slug') slug: string): Promise<Company | null> {
    return this.companyRepo.findBySlug(slug);
  }

  @Get('tags')
  async getTags(): Promise<Tag[]> {
    return this.tagRepo.findAll();
  }
}
