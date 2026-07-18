import { Contest, Ranking, Submission, ContestSubmissionInput } from '@onluyenphongvan/types';

export const CONTEST_REPOSITORY = 'CONTEST_REPOSITORY';
export const SUBMISSION_REPOSITORY = 'SUBMISSION_REPOSITORY';
export const RANKING_REPOSITORY = 'RANKING_REPOSITORY';

export interface IContestRepository {
  findAll(): Promise<Contest[]>;
  findById(id: string): Promise<Contest | null>;
}

export interface IRankingRepository {
  findByContest(contestId: string, limit: number): Promise<Ranking[]>;
}

export interface ISubmissionRepository {
  submitAndRank(
    userId: string,
    input: ContestSubmissionInput,
    isCorrect: boolean,
    scoreDelta: number
  ): Promise<{ submission: Submission; ranking: Ranking }>;
}
