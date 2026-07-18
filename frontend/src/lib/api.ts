import {
  Question,
  QuestionFilter,
  Attempt,
  SubmitAttemptInput,
  Category,
  Company,
  Contest,
  Ranking,
  ContestSubmissionInput,
  Submission,
  AiGenerateQuizInput,
  AiExplainInput,
  AiCoachChatInput,
  QuestionOption,
  User,
} from '@onluyenphongvan/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  if (token && !('Authorization' in headers)) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(async () => ({ message: await res.text().catch(() => 'Request failed') }));
    const msg =
      (typeof errorData === 'object' && errorData !== null && 'error' in errorData && (errorData as { error?: { message?: string } }).error?.message) ||
      (typeof errorData === 'object' && errorData !== null && 'message' in errorData && (errorData as { message?: string }).message) ||
      'Request failed';
    throw new Error(`API Error (${res.status}): ${msg}`);
  }

  const envelope = await res.json().catch(() => ({ data: null }));
  if (envelope && typeof envelope === 'object' && 'data' in envelope) {
    if (envelope.meta && typeof envelope.meta === 'object' && 'nextCursor' in envelope.meta) {
      if (Array.isArray(envelope.data) && endpoint.startsWith('/questions') && !endpoint.includes('/attempts')) {
        return {
          questions: envelope.data,
          nextCursor: envelope.meta.nextCursor ?? null,
          total: (envelope.meta as { total?: number }).total ?? envelope.data.length,
        } as unknown as T;
      }
      if (Array.isArray(envelope.data) && endpoint.startsWith('/questions/attempts')) {
        return {
          attempts: envelope.data,
          nextCursor: envelope.meta.nextCursor ?? null,
        } as unknown as T;
      }
    }
    return envelope.data as T;
  }
  return envelope as T;
}

export const apiClient = {
  // Auth
  async register(email: string, passwordHash: string, name: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordHash, name }),
    });
  },

  async login(email: string, passwordHash: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordHash }),
    });
  },

  async getMe(): Promise<User> {
    return request('/auth/me');
  },

  // Questions & Metadata
  async getQuestions(filter: Partial<QuestionFilter> = {}): Promise<{ questions: Question[]; nextCursor: string | null; total: number }> {
    const params = new URLSearchParams();
    if (filter.difficulty) params.append('difficulty', filter.difficulty);
    if (filter.categoryId) params.append('categoryId', filter.categoryId);
    if (filter.companyId) params.append('companyId', filter.companyId);
    if (filter.cursor) params.append('cursor', filter.cursor);
    if (filter.limit) params.append('limit', filter.limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/questions${query}`);
  },

  async getQuestionBySlug(slug: string): Promise<Question> {
    return request(`/questions/${slug}`);
  },

  async submitAttempt(input: SubmitAttemptInput): Promise<Attempt> {
    return request('/questions/attempts', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async getCategories(): Promise<Category[]> {
    return request('/categories');
  },

  async getCompanies(): Promise<Company[]> {
    return request('/companies');
  },

  // Contests
  async getContests(): Promise<Contest[]> {
    return request('/contests');
  },

  async getContest(id: string): Promise<Contest | null> {
    return request(`/contests/${id}`);
  },

  async getLeaderboard(id: string): Promise<Ranking[]> {
    return request(`/contests/${id}/leaderboard`);
  },

  async submitContestAnswer(input: ContestSubmissionInput): Promise<{ submission: Submission; ranking: Ranking }> {
    return request('/contests/submissions', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  // AI Gateway
  async aiGenerateQuiz(input: AiGenerateQuizInput): Promise<{ title: string; markdown: string; explanation: string; options: QuestionOption[] }[]> {
    return request('/ai/generate-quiz', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async aiExplain(input: AiExplainInput): Promise<{ whyWrong: string; conceptToReview: string; suggestedAction: string }> {
    return request('/ai/explain', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async aiCoach(input: AiCoachChatInput): Promise<{ reply: string; suggestedFollowUpQuestions?: string[] }> {
    return request('/ai/coach', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  // Search
  async search(query: string): Promise<Question[]> {
    return request(`/search?q=${encodeURIComponent(query)}`);
  },
};
