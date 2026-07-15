import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import {
  Contest,
  Ranking,
  Submission,
  contestSubmissionInputSchema,
  ContestSubmissionInput,
  User,
} from '@onluyenphongvan/types';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { ContestService } from './contest.service';
import { ContestGateway } from './contest.gateway';

interface RequestWithUser extends FastifyRequest {
  user?: User;
}

@Controller('contests')
export class ContestController {
  constructor(
    private readonly contestService: ContestService,
    private readonly contestGateway: ContestGateway
  ) {}

  @Get()
  async getContests(): Promise<Contest[]> {
    return this.contestService.findAll();
  }

  @Get(':id')
  async getContest(@Param('id') id: string): Promise<Contest | null> {
    return this.contestService.findById(id);
  }

  @Get(':id/leaderboard')
  async getLeaderboard(@Param('id') id: string): Promise<Ranking[]> {
    return this.contestService.getLeaderboard(id);
  }

  @UseGuards(AuthGuard)
  @Post('submissions')
  async submit(
    @Req() req: RequestWithUser,
    @Body(new ZodValidationPipe(contestSubmissionInputSchema)) body: ContestSubmissionInput
  ): Promise<{ submission: Submission; ranking: Ranking }> {
    if (!req.user) throw new Error('User context missing');
    const result = await this.contestService.submitAnswer(req.user._id, body);
    void this.contestGateway.broadcastLeaderboardUpdate(body.contestId);
    return result;
  }
}
