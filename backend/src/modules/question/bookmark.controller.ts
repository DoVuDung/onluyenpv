import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Inject,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { z } from 'zod';
import { Bookmark, User } from '@onluyenphongvan/types';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { IBookmarkRepository } from './domain/repositories.interface';

export const BOOKMARK_REPOSITORY = 'BOOKMARK_REPOSITORY';

const createBookmarkSchema = z.object({
  questionId: z.string().min(1),
});

interface RequestWithUser extends FastifyRequest {
  user?: User;
}

@UseGuards(AuthGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(
    @Inject(BOOKMARK_REPOSITORY)
    private readonly bookmarkRepository: IBookmarkRepository
  ) {}

  @Get()
  async list(@Req() req: RequestWithUser): Promise<Bookmark[]> {
    if (!req.user) throw new Error('User context missing');
    return this.bookmarkRepository.findByUser(req.user._id);
  }

  @Post()
  async add(
    @Req() req: RequestWithUser,
    @Body(new ZodValidationPipe(createBookmarkSchema)) body: { questionId: string }
  ): Promise<Bookmark> {
    if (!req.user) throw new Error('User context missing');
    const exists = await this.bookmarkRepository.exists(req.user._id, body.questionId);
    if (exists) {
      const all = await this.bookmarkRepository.findByUser(req.user._id);
      const found = all.find((b) => b.questionId === body.questionId);
      if (found) return found;
    }
    return this.bookmarkRepository.create(req.user._id, body.questionId);
  }

  @Delete(':questionId')
  async remove(
    @Req() req: RequestWithUser,
    @Param('questionId') questionId: string
  ): Promise<{ success: boolean }> {
    if (!req.user) throw new Error('User context missing');
    const deleted = await this.bookmarkRepository.delete(req.user._id, questionId);
    return { success: deleted };
  }
}
