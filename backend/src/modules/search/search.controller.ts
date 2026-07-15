import { Controller, Get, Query } from '@nestjs/common';
import { Question } from '@onluyenphongvan/types';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query('q') q?: string, @Query('limit') limit?: string): Promise<Question[]> {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.searchService.searchQuestions(q ?? '', limitNum);
  }
}
