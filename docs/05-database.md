# 05 — Database (MongoDB)

## Collections chính
`users`, `questions`, `categories`, `topics`, `companies`, `tags`, `attempts`, `bookmarks`, `discussions`, `votes`, `contests`, `submissions`, `notifications`, `achievements`.

## Nguyên tắc thiết kế schema
1. Mỗi field phải có type rõ ràng trong Mongoose Schema — **không dùng `Schema.Types.Mixed`** trừ khi thật sự bắt buộc, và nếu dùng phải kèm Zod schema validate + comment lý do.
2. **Embed** khi dữ liệu con luôn đọc cùng cha, ít khi update độc lập, kích thước nhỏ và ổn định (vd: `QuestionOption` embed trong `Question`).
3. **Reference** (ObjectId) khi dữ liệu được nhiều nơi trỏ tới, có thể lớn dần, hoặc cần query độc lập (vd: `Tag`, `Category`, `Company`, `User`).
4. **Không embed** dữ liệu tăng trưởng không giới hạn (vd: `Attempt`, `Discussion`, `Vote`) — luôn tách collection riêng, tham chiếu bằng ObjectId.
5. Mỗi collection có 1 TypeScript interface + Zod schema tương ứng đặt trong `packages/types`, dùng chung frontend/backend.

## Ví dụ: Question
```ts
interface Question {
  _id: QuestionId;
  slug: string;
  difficulty: 'junior' | 'middle' | 'senior' | 'staff' | 'principal';
  title: string;
  markdown: string;
  explanation: string;
  options: QuestionOption[];   // embedded
  tagIds: TagId[];             // reference -> tags
  categoryId: CategoryId;      // reference -> categories
  companyIds: CompanyId[];
  createdAt: Date;
  updatedAt: Date;
}

interface QuestionOption {
  id: string;       // nanoid, không phải ObjectId — không cần query riêng lẻ
  content: string;
  correct: boolean;
}
```

## Attempt (tách riêng — không embed vào User hay Question)
```ts
interface Attempt {
  _id: AttemptId;
  userId: UserId;
  questionId: QuestionId;
  selectedOptionId: string;
  correct: boolean;
  durationMs: number;
  createdAt: Date;
}
```

## Index bắt buộc
- `questions`: `{ slug: 1 }` unique, `{ categoryId: 1, difficulty: 1 }`, `{ companyIds: 1, difficulty: 1 }`, text index làm fallback search.
- `attempts`: `{ userId: 1, createdAt: -1 }`, `{ questionId: 1 }`.
- Composite index phải đúng thứ tự field theo query pattern thực tế (điều kiện bằng trước, range/sort sau).

## Transaction
Dùng MongoDB multi-document transaction (session) cho thao tác cần atomic trên nhiều collection, ví dụ: nộp bài contest (tạo `Submission` + cập nhật `Ranking` + trừ lượt thi). Không dùng transaction cho thao tác đơn giản trên 1 document.

## Cấm
- Không lưu blob JSON tự do không có schema để query — nếu dữ liệu cần query theo field bên trong, phải định nghĩa field rõ ràng trong schema.
- Không query MongoDB trực tiếp từ Controller — luôn đi qua Repository (xem `.agents/rules/database-mongodb.md`).
