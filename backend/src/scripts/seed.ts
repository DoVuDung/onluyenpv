import mongoose from 'mongoose';
import { MeiliSearch } from 'meilisearch';

const MONGODB_URI =
  process.env['MONGODB_URI'] ||
  'mongodb+srv://thanhthaodn2902_db_user:ihXqjRbqd1G4lN2u@cluster0.usteene.mongodb.net/onluyenphongvan?retryWrites=true&w=majority';

const MEILI_HOST = process.env['MEILI_HOST'] || 'https://onluyenpv-search.onrender.com';
const MEILI_API_KEY = process.env['MEILI_API_KEY'] || 'masterKey12345678901234567890';

const categoriesData = [
  {
    slug: 'javascript',
    name: 'JavaScript Core & ES6+',
    description: 'Chinh phục trọn bộ kiến thức JavaScript cốt lõi: Event Loop, Closures, Prototypes, Async/Await, ES6+ và cơ chế bộ nhớ.',
    icon: '⚡',
  },
  {
    slug: 'react',
    name: 'React & State Management',
    description: 'Làm chủ React Hooks, Virtual DOM, Server-Side Rendering (SSR/RSC), State Management (Zustand, Redux Toolkit) và Tối ưu hiệu năng.',
    icon: '⚛️',
  },
  {
    slug: 'css-html',
    name: 'HTML5, CSS3 & Web Layouts',
    description: 'Thành thạo Flexbox, CSS Grid, Responsive Web Design, Animations, Accessibility (a11y) và các best practice về Semantic HTML.',
    icon: '🎨',
  },
  {
    slug: 'system-design',
    name: 'Frontend System Design',
    description: 'Thiết kế kiến trúc hệ thống web quy mô lớn, Micro-frontends, Caching, Bundle Optimization và xử lý hàng triệu người dùng.',
    icon: '🏗️',
  },
  {
    slug: 'web-performance',
    name: 'Web Performance & Optimization',
    description: 'Tối ưu Core Web Vitals (LCP, INP, CLS), Memory Leaks, Code Splitting, Asset Delivery và Network protocols.',
    icon: '🚀',
  },
];

const topicsData = [
  { slug: 'closures-scope', name: 'Closures & Scope', categoryId: 'javascript' },
  { slug: 'async-eventloop', name: 'Async & Event Loop', categoryId: 'javascript' },
  { slug: 'this-prototypes', name: 'this Keyword & Prototypes', categoryId: 'javascript' },
  { slug: 'react-hooks', name: 'React Hooks Deep Dive', categoryId: 'react' },
  { slug: 'react-performance', name: 'React Performance Tuning', categoryId: 'react' },
  { slug: 'react-architecture', name: 'React Component Architecture', categoryId: 'react' },
  { slug: 'flexbox-grid', name: 'Modern CSS Layouts (Flex & Grid)', categoryId: 'css-html' },
  { slug: 'core-web-vitals', name: 'Core Web Vitals Deep Dive', categoryId: 'web-performance' },
  { slug: 'caching-storage', name: 'Browser Caching & Storage', categoryId: 'system-design' },
];

const questionsData = [
  {
    slug: 'js-event-loop-microtask-vs-macrotask',
    difficulty: 'middle',
    title: 'Giải thích thứ tự thực thi của Event Loop: Microtasks vs Macrotasks',
    markdown: `Cho đoạn mã sau, output in ra ra console theo thứ tự nào là chính xác?

\`\`\`javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');
\`\`\`

Hãy giải thích nguyên lý hoạt động của **Call Stack**, **Task Queue (Macrotask Queue)** và **Microtask Queue** trong JavaScript V8 engine.`,
    explanation: `Thứ tự chính xác là: \`1 -> 4 -> 3 -> 2\`.

**Giải thích chi tiết:**
1. \`console.log('1')\` được đẩy vào Call Stack và chạy đồng bộ -> In \`1\`.
2. \`setTimeout(...)\` được Web APIs xử lý, callback được chuyển vào **Macrotask Queue** (chờ chạy sau).
3. \`Promise.resolve().then(...)\` tạo ra một microtask được đẩy vào **Microtask Queue**.
4. \`console.log('4')\` chạy đồng bộ -> In \`4\`.
5. Khi Call Stack trống, Event Loop sẽ ưu tiên quét toàn bộ **Microtask Queue** trước -> In \`3\`.
6. Sau khi Microtask Queue trống, Event Loop mới lấy task tiếp theo trong **Macrotask Queue** ra chạy -> In \`2\`.`,
    type: 'multiple-choice',
    options: [
      { id: 'opt-1', text: '1 -> 4 -> 3 -> 2', isCorrect: true },
      { id: 'opt-2', text: '1 -> 2 -> 3 -> 4', isCorrect: false },
      { id: 'opt-3', text: '1 -> 4 -> 2 -> 3', isCorrect: false },
      { id: 'opt-4', text: '1 -> 3 -> 4 -> 2', isCorrect: false },
    ],
    tagIds: ['event-loop', 'async', 'promises'],
    categoryId: 'javascript',
    topicId: 'async-eventloop',
    companyIds: ['google', 'shopee', 'grab', 'fpt'],
  },
  {
    slug: 'js-closure-private-counter',
    difficulty: 'junior',
    title: 'Code Output: Closure trong vòng lặp var vs let',
    markdown: `Hãy cho biết kết quả xuất ra màn hình khi thực thi đoạn code sau:

\`\`\`javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100);
}
\`\`\``,
    explanation: `**Kết quả xuất ra:**
\`3, 3, 3\` (từ vòng lặp sử dụng \`var\`) và sau đó là \`0, 1, 2\` (từ vòng lặp sử dụng \`let\`).

**Nguyên nhân:**
- \`var\` có phạm vi function/global scope. Biến \`i\` được dùng chung cho tất cả các callback. Khi setTimeout thực hiện sau 100ms, vòng lặp đã kết thúc và \`i = 3\`.
- \`let\` có phạm vi block scope (phạm vi khối). Với mỗi lần lặp, JavaScript tạo ra một binding mới cho \`j\`, giúp closure giữ lại được đúng giá trị của \`j\` tại từng vòng lặp (\`0, 1, 2\`).`,
    type: 'code-output',
    codeSnippet: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 10);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 10);
}`,
    expectedOutput: '3\n3\n3\n0\n1\n2',
    tagIds: ['closures', 'scope', 'es6'],
    categoryId: 'javascript',
    topicId: 'closures-scope',
    companyIds: ['meta', 'vng', 'shopee'],
  },
  {
    slug: 'react-usecallback-vs-usememo',
    difficulty: 'middle',
    title: 'Phân biệt useCallback và useMemo trong React Hooks',
    markdown: `Trong React, khi nào nên sử dụng \`useCallback\` và khi nào nên sử dụng \`useMemo\`? Chọn phát biểu **chính xác nhất** bên dưới.`,
    explanation: `- \`useMemo(() => fn, deps)\` dùng để ghi nhớ (memoize) **giá trị tính toán (return value)** của hàm, giúp tránh việc phải tính toán lại những logic nặng (heavy computations) ở mỗi lần render.
- \`useCallback(fn, deps)\` dùng để ghi nhớ **chính tham chiếu của hàm (function reference)**, ngăn tạo ra instance mới của hàm mỗi lần render, cực kỳ quan trọng khi truyền callback xuống component con có sử dụng \`React.memo\` hoặc đưa vào dependency của hook khác.
- Lưu ý: \`useCallback(fn, deps)\` hoàn toàn tương đương với \`useMemo(() => fn, deps)\`.`,
    type: 'multiple-choice',
    options: [
      { id: 'opt-a', text: 'useCallback ghi nhớ tham chiếu của hàm (function reference), còn useMemo ghi nhớ kết quả/giá trị trả về của hàm (return value).', isCorrect: true },
      { id: 'opt-b', text: 'useMemo dùng cho async function, còn useCallback chỉ dùng cho sync function.', isCorrect: false },
      { id: 'opt-c', text: 'useCallback làm component render nhanh hơn 100% trong mọi trường hợp mà không tốn bộ nhớ.', isCorrect: false },
      { id: 'opt-d', text: 'useMemo ghi nhớ tham chiếu của hàm, còn useCallback ghi nhớ kết quả tính toán.', isCorrect: false },
    ],
    tagIds: ['react-hooks', 'performance', 'memoization'],
    categoryId: 'react',
    topicId: 'react-hooks',
    companyIds: ['grab', 'shopee', 'vng'],
  },
  {
    slug: 'react-implement-debounce-hook',
    difficulty: 'senior',
    title: 'Coding Challenge: Tự viết custom hook useDebounce',
    markdown: `Hãy triển khai custom hook \`useDebounce(value, delay)\` trong React giúp trì hoãn việc cập nhật giá trị cho đến khi người dùng ngừng thao tác trong khoảng thời gian \`delay\` milliseconds.

**Yêu cầu:**
- Trả về \`debouncedValue\` mới sau \`delay\` ms kể từ lần cuối cùng \`value\` thay đổi.
- Đảm bảo dọn dẹp (cleanup) timeout cũ khi \`value\` hoặc \`delay\` thay đổi trước khi timeout hoàn thành để tránh memory leak.`,
    explanation: `Cách triển khai chuẩn xác sử dụng \`useState\` và \`useEffect\`:

\`\`\`typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function xóa timer cũ khi value thay đổi trước delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
\`\`\``,
    type: 'coding-challenge',
    starterCode: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  // TODO: Implement custom useDebounce hook
  return value;
}`,
    testCases: [
      {
        id: 'tc-1',
        input: '{"value": "hello", "delay": 500}',
        expectedOutput: '"hello"',
        isHidden: false,
      },
    ],
    tagIds: ['custom-hooks', 'debounce', 'react-architecture'],
    categoryId: 'react',
    topicId: 'react-hooks',
    companyIds: ['google', 'grab', 'meta'],
  },
  {
    slug: 'css-flexbox-vs-grid-layout-use-cases',
    difficulty: 'junior',
    title: 'Khi nào nên chọn CSS Grid thay vì Flexbox?',
    markdown: `Phát biểu nào sau đây mô tả đúng nhất sự khác biệt triết lý giữa **CSS Flexbox** và **CSS Grid**?`,
    explanation: `**CSS Grid vs Flexbox:**
- **Flexbox (1D - Một chiều):** Thiết kế tối ưu cho layout theo một trục duy nhất (hoặc theo hàng ngang Row, hoặc theo cột ngang Column). Phù hợp cho thanh điều hướng (Navbar), danh sách icon, căn giữa phần tử.
- **CSS Grid (2D - Hai chiều):** Thiết kế tối ưu cho layout theo cả hàng (Rows) lẫn cột (Columns) đồng thời. Phù hợp cho kiến trúc tổng thể của trang web, lưới sản phẩm phức tạp, dashboard layout.`,
    type: 'multiple-choice',
    options: [
      { id: 'g-1', text: 'CSS Grid được thiết kế cho bố cục hai chiều (2D - cả hàng và cột), trong khi Flexbox tối ưu cho bố cục một chiều (1D - theo hàng hoặc theo cột).', isCorrect: true },
      { id: 'g-2', text: 'Flexbox chỉ chạy trên trình duyệt di động còn CSS Grid chỉ chạy trên trình duyệt máy tính.', isCorrect: false },
      { id: 'g-3', text: 'CSS Grid nhanh hơn Flexbox gấp 10 lần trong việc render DOM.', isCorrect: false },
      { id: 'g-4', text: 'Flexbox không hỗ trợ tính năng căn giữa phần tử theo cả hai trục.', isCorrect: false },
    ],
    tagIds: ['css-grid', 'flexbox', 'responsive'],
    categoryId: 'css-html',
    topicId: 'flexbox-grid',
    companyIds: ['shopee', 'fpt', 'vng'],
  },
  {
    slug: 'system-design-frontend-caching-strategies',
    difficulty: 'senior',
    title: 'Các chiến lược Caching HTTP và Service Worker cho Frontend',
    markdown: `Để tối ưu tốc độ tải trang cho ứng dụng Single Page Application (SPA) có hàng triệu người dùng, bạn sẽ thiết lập Header \`Cache-Control\` cho các file tài nguyên tĩnh (**js/css bundle có kèm hash**, ví dụ \`main.8f7b2a.js\`) như thế nào để vừa đạt tốc độ cao nhất, vừa đảm bảo người dùng luôn nhận được code mới khi deploy?`,
    explanation: `Chiến lược chuẩn xác cho SPA (Next.js / Vite / Webpack):
1. **Với các file bundle tĩnh có kèm hash (\`*.hash.js\`, \`*.hash.css\`, hình ảnh tĩnh):**
   Thiết lập \`Cache-Control: public, max-age=31536000, immutable\` (Cache vĩnh viễn 1 năm). Vì mỗi khi deploy code mới, tên file hash sẽ thay đổi hoàn toàn nên trình duyệt sẽ tự tải file mới mà không bao giờ bị lỗi cache cũ.
2. **Với file \`index.html\` (chứa thẻ script trỏ đến các bundle):**
   Thiết lập \`Cache-Control: no-cache\` hoặc \`max-age=0, must-revalidate\`. Trình duyệt sẽ luôn kiểm tra nhanh với server xem có \`index.html\` mới hay không trước khi render.`,
    type: 'multiple-choice',
    options: [
      { id: 'c-1', text: 'Bundle JS/CSS có hash: Cache-Control: public, max-age=31536000, immutable. File index.html: Cache-Control: no-cache.', isCorrect: true },
      { id: 'c-2', text: 'Tất cả các file bao gồm cả index.html: Cache-Control: public, max-age=3600.', isCorrect: false },
      { id: 'c-3', text: 'Bundle JS/CSS có hash: Cache-Control: no-store. File index.html: Cache-Control: public, max-age=86400.', isCorrect: false },
      { id: 'c-4', text: 'Chỉ sử dụng LocalStorage để lưu trữ toàn bộ code bundle Javascript.', isCorrect: false },
    ],
    tagIds: ['caching', 'http', 'performance', 'system-design'],
    categoryId: 'system-design',
    topicId: 'caching-storage',
    companyIds: ['google', 'meta', 'grab'],
  },
  {
    slug: 'web-performance-core-web-vitals-inp-lcp',
    difficulty: 'senior',
    title: 'Tối ưu chỉ số INP (Interaction to Next Paint) và LCP trong Core Web Vitals',
    markdown: `Từ tháng 3/2024, Google chính thức thay thế chỉ số **FID (First Input Delay)** bằng **INP (Interaction to Next Paint)** làm chỉ số đo lường độ phản hồi của trang web.

Một trang web thương mại điện tử có chỉ số INP đang bị kém (> 500ms) khi người dùng bấm nút "Thêm vào giỏ hàng". Nguyên nhân phổ biến nhất và cách tối ưu hiệu quả nhất là gì?`,
    explanation: `**INP (Interaction to Next Paint)** đo lường toàn bộ thời gian từ lúc người dùng tương tác (click, tap, keypress) cho đến khi khung hình tiếp theo được render lên màn hình.

**Nguyên nhân INP cao:**
- Main thread bị chặn bởi các tác vụ đồng bộ nặng (Long Tasks > 50ms) xảy ra ngay trong event handler hoặc khi React tính toán re-render một cây component quá lớn.

**Cách tối ưu tốt nhất:**
1. **Chia nhỏ Long Tasks (Yield to Main Thread):** Sử dụng \`setTimeout(..., 0)\` hoặc \`scheduler.yield()\` để trả lại quyền điều khiển cho trình duyệt vẽ UI phản hồi nhanh (spinner/animation) trước khi chạy tiếp logic xử lý nặng.
2. **Tối ưu React Re-render:** Sử dụng \`useTransition()\` hoặc \`startTransition\` cho các cập nhật state không khẩn cấp, chia nhỏ component, virtualization cho danh sách dài.`,
    type: 'multiple-choice',
    options: [
      { id: 'p-1', text: 'Chia nhỏ các Long Tasks (> 50ms) trên Main Thread bằng scheduler.yield() hoặc setTimeout, đồng thời dùng useTransition trong React để ưu tiên vẽ UI phản hồi ngay lập tức.', isCorrect: true },
      { id: 'p-2', text: 'Nén hình ảnh sang định dạng WebP và thêm thuộc tính loading="lazy" cho tất cả hình ảnh trên trang.', isCorrect: false },
      { id: 'p-3', text: 'Chuyển toàn bộ CSS từ file bên ngoài vào inline style bên trong thẻ <head>.', isCorrect: false },
      { id: 'p-4', text: 'Tắt hoàn toàn JavaScript và viết toàn bộ giỏ hàng bằng PHP thuần.', isCorrect: false },
    ],
    tagIds: ['core-web-vitals', 'inp', 'lcp', 'performance'],
    categoryId: 'web-performance',
    topicId: 'core-web-vitals',
    companyIds: ['google', 'shopee', 'grab'],
  },
  {
    slug: 'js-fill-blank-promise-all-vs-allsettled',
    difficulty: 'middle',
    title: 'Điền vào chỗ trống: Điểm khác biệt giữa Promise.all và Promise.allSettled',
    markdown: `Hãy điền phương thức thích hợp vào chỗ trống để đoạn code xử lý **tất cả** các promise trả về kết quả (dù thành công hay thất bại) mà **không bị ngắt (short-circuit)** khi có một promise bị reject:

\`\`\`javascript
const p1 = Promise.resolve('Thành công 1');
const p2 = Promise.reject('Lỗi kết nối API');
const p3 = Promise.resolve('Thành công 2');

const results = await Promise.[BLANK_1]([p1, p2, p3]);
console.log(results.length); // In ra: 3
\`\`\``,
    explanation: `- \`Promise.all()\` sẽ lập tức bị reject (short-circuit) ngay khi có bất kỳ 1 promise nào trong mảng bị reject.
- \`Promise.allSettled()\` chờ đợi cho đến khi **tất cả** các promise đều hoàn thành (hoặc fulfilled hoặc rejected) và trả về mảng object có dạng \`{ status: 'fulfilled' | 'rejected', value/reason: ... }\`.`,
    type: 'fill-blank',
    blanks: ['allSettled'],
    tagIds: ['promises', 'async', 'es2020'],
    categoryId: 'javascript',
    topicId: 'async-eventloop',
    companyIds: ['grab', 'shopee'],
  },
];

async function runSeed() {
  console.log('🌱 Bắt đầu kết nối MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI, {
    family: 4,
    serverSelectionTimeoutMS: 10000,
  });
  console.log('✅ Kết nối MongoDB thành công!');

  if (!mongoose.connection.db) {
    throw new Error('Không thể lấy đối tượng Database từ kết nối Mongoose');
  }
  const db = mongoose.connection.db;

  // 1. Seed Categories
  console.log('📦 Đang xóa dữ liệu cũ và seed Categories...');
  await db.collection('categories').deleteMany({});
  await db.collection('categories').insertMany(
    categoriesData.map((c) => ({ ...c, createdAt: new Date(), updatedAt: new Date() }))
  );
  console.log(`✅ Đã seed ${categoriesData.length} Categories.`);

  // 2. Seed Topics
  console.log('📚 Đang seed Topics...');
  await db.collection('topics').deleteMany({});
  await db.collection('topics').insertMany(
    topicsData.map((t) => ({ ...t, createdAt: new Date(), updatedAt: new Date() }))
  );
  console.log(`✅ Đã seed ${topicsData.length} Topics.`);

  // 3. Seed Questions
  console.log('💡 Đang seed Questions...');
  await db.collection('questions').deleteMany({});
  await db.collection('questions').insertMany(
    questionsData.map((q) => ({ ...q, createdAt: new Date(), updatedAt: new Date() }))
  );
  console.log(`✅ Đã seed ${questionsData.length} Questions vào MongoDB.`);

  // 4. Seed Contests (Bộ Ôn Tập & Thi đấu)
  console.log('🏆 Đang seed Contests (Bộ Ôn Tập & Kỳ Thi)...');
  await db.collection('contests').deleteMany({});

  const questionSlugs = questionsData.map((q) => q.slug);
  const now = new Date();

  const contestsData = [
    {
      title: 'Thử thách Luyện Phỏng vấn Frontend Junior/Middle #1 - JavaScript Core & React',
      slug: 'junior-middle-js-react-challenge-1',
      description: 'Bộ câu hỏi chọn lọc thường gặp nhất tại các công ty công nghệ (Shopee, Grab, VNG) dành cho ứng viên Junior và Middle.',
      startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Hôm qua
      endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 ngày tới
      questionIds: questionSlugs.slice(0, 5),
      status: 'live',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'Đấu trường Senior Frontend Engineer #2 - System Design & Performance',
      slug: 'senior-system-design-performance-2',
      description: 'Thử thách thiết kế kiến trúc hệ thống, xử lý bộ nhớ, tối ưu Core Web Vitals và chiến lược Caching cho ứng dụng hàng triệu users.',
      startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 giờ trước
      endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 ngày tới
      questionIds: questionSlugs.slice(3, 8),
      status: 'live',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'Mock Interview Big Tech (Google, Meta, Grab) - Kỳ thi Cuối tuần',
      slug: 'big-tech-mock-interview-weekend',
      description: 'Tổng hợp các câu hỏi hóc búa nhất về thuật toán, cấu trúc dữ liệu và thực hành viết custom hooks chuẩn chỉ.',
      startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 ngày sau
      endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 ngày sau
      questionIds: questionSlugs,
      status: 'upcoming',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection('contests').insertMany(contestsData);
  console.log(`✅ Đã seed ${contestsData.length} Contests/Bộ ôn tập vào MongoDB.`);

  // 5. Sync với Meilisearch
  try {
    console.log(`🔍 Đang đồng bộ ${questionsData.length} câu hỏi lên Meilisearch (${MEILI_HOST})...`);
    const meili = new MeiliSearch({
      host: MEILI_HOST,
      apiKey: MEILI_API_KEY,
    });

    const index = meili.index('questions');
    // Định nghĩa searchable attributes và filterable attributes
    await index.updateFilterableAttributes(['difficulty', 'categoryId', 'tagIds', 'companyIds']);
    await index.updateSearchableAttributes(['title', 'markdown', 'explanation', 'tagIds']);

    const meiliDocuments = questionsData.map((q) => ({
      id: q.slug,
      slug: q.slug,
      title: q.title,
      markdown: q.markdown,
      explanation: q.explanation,
      difficulty: q.difficulty,
      categoryId: q.categoryId,
      tagIds: q.tagIds,
      companyIds: q.companyIds,
      type: q.type,
    }));

    const task = await index.addDocuments(meiliDocuments);
    console.log(`✅ Đã gửi request đồng bộ Meilisearch thành công! Task UID: ${task.taskUid}`);
  } catch (meiliError: any) {
    console.warn(`⚠️ Không thể đồng bộ sang Meilisearch (có thể do kết nối hoặc API Key):`, meiliError.message);
  }

  await mongoose.disconnect();
  console.log('🎉 Hoàn tất toàn bộ quá trình tự động tạo bộ ôn tập và dữ liệu thực tế vào Database!');
}

runSeed().catch((err) => {
  console.error('❌ Lỗi khi seed dữ liệu:', err);
  process.exit(1);
});
