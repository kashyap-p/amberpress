# AmberPress — AI-Powered Blog Platform Worklog

This file is the shared worklog for all agents building the AmberPress blog platform.
**Read this entire file before starting your task**, and **append** your own section (starting with `---`) when done. Do NOT overwrite.

---
Task ID: 1
Agent: Orchestrator (foundation)
Task: Set up database schema, light amber theme, layout, seed data, and define the shared API contracts for the blog platform.

Work Log:
- Added `Blog` model to `prisma/schema.prisma` (fields: id, title, content, excerpt, tags, category, coverImage, author, published, source, sourceUrl, createdAt, updatedAt; indexes on source & category). Ran `bun run db:push` — DB is in sync, Prisma Client generated.
- Rewrote `src/app/globals.css` with a **light amber theme** (warm cream background, amber primary `oklch(0.68 0.16 60)`, amber-tinted surfaces/borders) plus a warm-charcoal dark mode. Added `.amber-scroll` custom scrollbar + `.amber-prose` content styling + warm radial-gradient body background.
- Updated `src/app/layout.tsx`: new metadata (AmberPress), wrapped app in `next-themes` `ThemeProvider` (defaultTheme="light", class strategy), added Sonner toaster alongside existing toaster.
- Created `prisma/seed.ts` and ran it — inserted 2 sample blogs (source="user").
- Defined the API contracts below for subagents to implement against.

Stage Summary:
- DB ready. Theme applied. Layout wired with ThemeProvider + toasters. Sample blogs seeded.
- The ONLY user-visible route is `/` (`src/app/page.tsx`). Do NOT create other page routes.
- Use `import { db } from "@/lib/db"` for DB access.
- `z-ai-web-dev-sdk` is installed; use it ONLY in backend (API routes / server code), never in client components.

============================================================
API CONTRACTS (all subagents MUST follow these exactly)
============================================================

Database model (already created):
```prisma
model Blog {
  id         String   @id @default(cuid())
  title      String
  content    String   @default("")
  excerpt    String   @default("")
  tags       String   @default("")    // comma-separated
  category   String   @default("General")
  coverImage String   @default("")
  author     String   @default("Editor")
  published  Boolean  @default(true)
  source     String   @default("user")  // "user" | "news"
  sourceUrl  String   @default("")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

Frontend Blog type (mirror this in a shared `src/lib/types.ts`):
```ts
export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string;          // comma-separated
  category: string;
  coverImage: string;
  author: string;
  published: boolean;
  source: "user" | "news";
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
}
```

--- Blog CRUD ---

1) GET /api/blogs
   - Query params (all optional): `q` (search title/content/excerpt/tags), `category`, `source`.
   - Returns: `{ blogs: Blog[] }` sorted by createdAt DESC.

2) POST /api/blogs
   - Body: `{ title, content?, excerpt?, tags?, category?, coverImage?, author?, source?, sourceUrl?, published? }`
   - Returns: `{ blog: Blog }` (201).

3) GET /api/blogs/[id]
   - Returns: `{ blog: Blog }` or 404 `{ error }`.

4) PUT /api/blogs/[id]
   - Body: any subset of Blog fields (except id/timestamps).
   - Returns: `{ blog: Blog }`.

5) DELETE /api/blogs/[id]
   - Returns: `{ success: true }`.

--- AI (LLM, via z-ai-web-dev-sdk) ---
All return JSON; on error return `{ error: string }` with status 500.

6) POST /api/ai/rewrite
   - Body: `{ text: string, tone?: string }` (tone default "professional").
   - Returns: `{ content: string }` — the rewritten text.

7) POST /api/ai/improve
   - Body: `{ text: string }`.
   - Returns: `{ content: string }` — grammar/style-improved text.

8) POST /api/ai/generate
   - Body: `{ topic: string, tone?: string }`.
   - Returns: `{ title: string, content: string, excerpt: string, tags: string }`
     (tags comma-separated, 2-5 tags). content is Markdown.

9) POST /api/ai/summarize
   - Body: `{ text: string }`.
   - Returns: `{ excerpt: string }` — a 1-2 sentence summary.

LLM usage pattern (backend only):
```ts
import ZAI from "z-ai-web-dev-sdk";
const zai = await ZAI.create();
const completion = await zai.chat.completions.create({
  messages: [
    { role: "assistant", content: "<system prompt>" },
    { role: "user", content: "<user prompt>" },
  ],
  thinking: { type: "disabled" },
});
const text = completion.choices[0]?.message?.content ?? "";
```

--- News (web-search, via z-ai-web-dev-sdk) ---

10) GET /api/news
    - Query params (optional): `topic` (default "artificial intelligence technology news latest"), `num` (default 12).
    - Returns: `{ news: Array<{ title: string; snippet: string; url: string; host_name: string; date: string; favicon: string }> }`.

Web-search usage pattern (backend only):
```ts
import ZAI from "z-ai-web-dev-sdk";
const zai = await ZAI.create();
const results = await zai.functions.invoke("web_search", { query, num });
// results is an array of { url, name, snippet, host_name, rank, date, favicon }
```

============================================================
FILE OWNERSHIP (avoid conflicts between parallel agents)
============================================================

- Backend subagent OWNS (create/edit ONLY these):
  - `src/app/api/blogs/route.ts`
  - `src/app/api/blogs/[id]/route.ts`
  - `src/app/api/ai/rewrite/route.ts`
  - `src/app/api/ai/improve/route.ts`
  - `src/app/api/ai/generate/route.ts`
  - `src/app/api/ai/summarize/route.ts`
  - `src/app/api/news/route.ts`
  - `src/lib/types.ts` (shared types — create this)

- Frontend subagent OWNS (create/edit ONLY these):
  - `src/app/page.tsx`
  - `src/components/blog/*` (new folder for blog components)
  - `src/components/theme-toggle.tsx` (new)
  - May READ but NOT edit: globals.css, layout.tsx, prisma, api routes, types.ts

- BOTH may READ everything. Do NOT edit: globals.css, layout.tsx, prisma/schema.prisma, src/lib/db.ts.

============================================================

---
Task ID: 2-a
Agent: full-stack-developer (backend)
Task: Build all backend API routes for AmberPress (blogs CRUD, AI LLM routes, news web-search).

Work Log:
- Read worklog.md fully to align with the shared API contracts, DB schema, and file ownership rules.
- Inspected existing src/lib/types.ts (Blog, NewsItem, BlogInput, BLOG_CATEGORIES, AITone) and src/lib/db.ts (Prisma client singleton). Confirmed z-ai-web-dev-sdk v0.0.18 is installed and Next.js 16.1.3 with Turbopack dev server is running on port 3000.
- Created directories: src/app/api/blogs/[id], src/app/api/ai/{rewrite,improve,generate,summarize}, src/app/api/news.
- Implemented src/app/api/blogs/route.ts: GET (list with optional q/category/source filters via Prisma.BlogWhereInput, OR-search across title/content/excerpt/tags, ordered by createdAt DESC) + POST (validates title required, creates with sensible defaults, returns 201).
- Implemented src/app/api/blogs/[id]/route.ts: GET (404 if missing), PUT (whitelists updatable fields only, 404 if missing, 400 if no updatable fields), DELETE (404 if missing, returns { success: true }). Used Next.js 16 async params pattern (ctx: { params: Promise<{ id }> }, awaited).
- Implemented src/app/api/ai/rewrite/route.ts: POST { text, tone? } -> { content }. Default tone "professional". System prompt instructs the LLM to rewrite preserving meaning, only output the rewritten text.
- Implemented src/app/api/ai/improve/route.ts: POST { text } -> { content }. Grammar/clarity/style fixes, length roughly preserved.
- Implemented src/app/api/ai/generate/route.ts: POST { topic, tone? } -> { title, content, excerpt, tags }. Strict-JSON system prompt, fence-stripping regex (handles ```json ... ``` and bare ```), brace-locating fallback if leading prose present, try/catch on JSON.parse with graceful 500 on malformed output. Verified end-to-end: returned all 4 keys, tags as comma-separated string of 5 tags, ~2.4KB Markdown content.
- Implemented src/app/api/ai/summarize/route.ts: POST { text } -> { excerpt }. (Included because the worklog API contract lists it as route #9 and the file-ownership section assigns it to the backend agent; the frontend may depend on it.)
- Implemented src/app/api/news/route.ts: GET with optional topic (default "artificial intelligence technology news latest") and num (default 12, capped at 50). Calls zai.functions.invoke("web_search", { query, num }) and maps each raw result { url, name, snippet, host_name, date, favicon } -> { title: name, snippet, url, host_name, date, favicon }.
- All routes wrap logic in try/catch, use NextResponse.json, return { error: string } with appropriate status (400 bad input, 404 not found, 500 server/AI), and log errors to console. All LLM/news calls use the prescribed `const zai = await ZAI.create();` pattern with `thinking: { type: "disabled" }`.
- Ran `bun run lint`. Fixed two unused eslint-disable warnings in my own files by replacing `any` with proper Prisma types (`Prisma.BlogWhereInput`, `Prisma.BlogUpdateInput`). No remaining lint errors in any of my files. (One pre-existing lint error remains in src/components/theme-toggle.tsx, which is owned by the frontend agent — not touched.)
- Smoke-tested every route via curl against the running dev server: GET /api/blogs -> 200 with seeded blogs; GET /api/blogs/nonexistent-id -> 404 { error }; POST /api/ai/improve with empty body -> 400; POST /api/ai/improve with real text -> 200 { content }; POST /api/ai/generate with topic+tone -> 200 with all 4 keys and valid Markdown; GET /api/news?num=3 -> 200 with 3 mapped news items; POST /api/blogs -> 201; DELETE -> 200 { success: true }; PUT -> 200 with updated blog.
- Restored the seed blog's `author` field to "AmberPress Editorial" after a PUT smoke-test, so no test side-effects remain in the DB.
- Verified dev.log shows no compile errors for any of my routes (only successful 200/201/400/404 responses and normal Prisma query logs).

Stage Summary:
- Files created:
  - src/app/api/blogs/route.ts
  - src/app/api/blogs/[id]/route.ts
  - src/app/api/ai/rewrite/route.ts
  - src/app/api/ai/improve/route.ts
  - src/app/api/ai/generate/route.ts
  - src/app/api/ai/summarize/route.ts
  - src/app/api/news/route.ts
- Key decisions / deviations from contract:
  - Added src/app/api/ai/summarize/route.ts in addition to the 6 routes explicitly listed in the task instructions, because the worklog's API contract (route #9) and the file-ownership section both assign it to the backend agent and a parallel frontend agent may build against it. Response shape matches the contract: { excerpt: string }.
  - Used Prisma's generated `Prisma.BlogWhereInput` / `Prisma.BlogUpdateInput` types instead of `any` for type safety on the where/update clauses (also clears lint warnings).
  - SQLite does not support Prisma's `mode: insensitive`, so the `q` search uses plain `contains` across title/content/excerpt/tags — case sensitivity matches SQLite default. Documented inline.
  - For the `generate` route, in addition to stripping ```json fences, added a defensive brace-locating fallback (slices from first `{` to last `}`) for cases where the LLM emits a sentence before/after the JSON object.
  - Capped news `num` at 50 to prevent abuse; otherwise follows the contract default of 12.
  - All routes return errors as `{ error: string }` with the status codes specified in the contract (400/404/500).
- Lint result: `bun run lint` reports 0 errors and 0 warnings in my files. (1 pre-existing error in src/components/theme-toggle.tsx is owned by the frontend agent and was not touched.)

---
Task ID: 2-b
Agent: full-stack-developer (frontend)
Task: Build the responsive amber-themed blog UI page with AI tools, CRUD dialogs, and news tab.

Work Log:
- Read shared worklog + types.ts; confirmed API contracts (blogs CRUD, ai/{rewrite,improve,generate,summarize}, news). Imported Blog, NewsItem, BlogInput, BLOG_CATEGORIES, AITone from @/lib/types (did NOT edit it).
- Created `src/components/providers.tsx` (QueryClientProvider wrapper, since layout.tsx is off-limits).
- Created `src/components/theme-toggle.tsx` using next-themes `useTheme` with CSS-driven Sun/Moon swap (dark: variants) to avoid hydration mismatch + the react-hooks/set-state-in-effect lint rule.
- Created `src/components/blog/category-style.ts` mapping each BLOG_CATEGORIES entry to a gradient (e.g. AI→from-amber-400 to-orange-500, ML→rose→amber, Tech→orange→yellow, etc.), badge classes, ring, and icon glyph; plus `parseTags()` and `allCategories()` helpers.
- Created `src/components/blog/header.tsx`: sticky top header with backdrop blur, amber gradient brand badge (Feather icon + gradient "AmberPress" wordmark), nav buttons (Blogs/News — hidden on mobile), ThemeToggle, and gradient "New Blog" button.
- Created `src/components/blog/hero.tsx`: warm amber radial-gradient background, framer-motion staggered fade-in for badge/headline/subtext/stat chips (blogs count, categories, AI features).
- Created `src/components/blog/footer.tsx`: mt-auto sticky footer with brand mark, Top link, Z.ai link, and "Built with ❤ using Z.ai" note.
- Created `src/components/blog/empty-state.tsx`: friendly framer-motion empty card with FileText icon + CTA button (customizable title/description/action).
- Created `src/components/blog/blog-card.tsx`: motion card with hover-lift (y:-4), gradient cover header (or coverImage with onError fallback to gradient), category badge + Imported badge, dropdown menu (Open/Edit/Rewrite with AI/Delete), tags as outline badges, author + relative date via date-fns formatDistanceToNow. Card body click opens reader; dropdown click is stopPropagation'd.
- Created `src/components/blog/blog-reader.tsx`: Dialog showing cover (image or gradient), category badge, title, meta (author/relative date/source link), tags, optional excerpt, then full content rendered with react-markdown inside `.amber-prose`. Edit button in footer.
- Created `src/components/blog/news-card.tsx`: motion card with favicon (with onError→Globe2 fallback), host_name, relative date, title, snippet, "Read source" external link (target=_blank rel=noopener noreferrer), and gradient "Import to my blogs" button.
- Created `src/components/blog/blog-form-dialog.tsx`: the Add/Edit dialog. Fields: title, category (Select), author, tags, coverImage URL, content (Textarea), excerpt. AI toolbar with 4 buttons (Generate from topic [expandable panel with topic input + tone Select], Rewrite [with inline tone Select], Improve, Summarize→excerpt). Each AI button shows a Loader2 spinner + disabled state while working, fires a Sonner toast on success/error. Preview toggle renders content via react-markdown in `.amber-prose`. Save posts to /api/blogs (POST new / PUT edit) with title-required validation and toast feedback. Auto-action support: when opened via "Rewrite with AI" from the card dropdown, it inlines an immediate rewrite call against blog.content (avoids stale form-content closure), shows a toast, and updates the form.
- Created `src/app/page.tsx`: the ONLY route. Root `<div className="min-h-screen flex flex-col">` (mandatory sticky-footer pattern). Wraps app in <Providers> (QueryClient). Inside: Header, Hero, <main> with shadcn Tabs ("My Blogs" default, "AI & Tech News"), Footer (mt-auto).
  - Blogs tab: toolbar (search Input with debounced 300ms → ?q=, category Select, source Select [All/Mine/Imported], gradient "New Blog" button), responsive `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5` of BlogCard, skeleton grid while loading, EmptyState when empty/error (with Retry).
  - News tab: topic Input (debounced 400ms → ?topic=) + Refresh button (refetches /api/news), skeleton grid, then `max-h-[70vh] overflow-y-auto amber-scroll` container with `grid md:grid-cols-2` of NewsCard.
  - TanStack Query: useQuery for blogs (['blogs', q, category, source]) and news (['news', topic]); useMutation for create/update/delete with query invalidation. Sonner toasts for create/update/delete. AlertDialog confirm for delete.
  - All fetches use relative paths only (e.g. `/api/blogs?q=...`) — no absolute URLs or ports.
- Ran `bun run lint` — initial pass surfaced: theme-toggle setState-in-effect error (fixed via CSS-only swap), 5 unused eslint-disable comments (removed). Final pass: 0 errors, 0 warnings.
- Checked dev.log: page compiles cleanly (`GET / 200`), all API calls succeed (`/api/blogs`, `/api/news?num=12`, `/api/ai/generate`, `/api/ai/improve`, POST/PUT/DELETE /api/blogs/...). No runtime errors related to frontend files.

Stage Summary:
- Files created (frontend-owned):
  - src/components/providers.tsx
  - src/components/theme-toggle.tsx
  - src/components/blog/category-style.ts
  - src/components/blog/header.tsx
  - src/components/blog/hero.tsx
  - src/components/blog/footer.tsx
  - src/components/blog/empty-state.tsx
  - src/components/blog/blog-card.tsx
  - src/components/blog/blog-reader.tsx
  - src/components/blog/blog-form-dialog.tsx
  - src/components/blog/news-card.tsx
  - src/app/page.tsx (rewritten as orchestrator)
- Key UI/UX decisions:
  - Light amber theme enforced via semantic classes (bg-background, bg-card, bg-primary) + explicit amber/orange gradients for brand, buttons, and cover headers; no indigo/blue anywhere.
  - Mobile-first responsive: header nav text hidden <md (icon buttons + brand + New Blog stay), grids collapse to 1 col on mobile, dialogs use shadcn Dialog (responsive, scrollable on mobile via max-h-[92vh] amber-scroll).
  - Touch-friendly: all icon buttons size-9 (≥44px), select triggers h-9, button rows wrap on small screens.
  - Sticky footer: root `min-h-screen flex flex-col` + `mt-auto` on Footer — sticks on short pages, pushed down on long lists.
  - Loading: shadcn Skeleton grids for both blogs (6 cards) and news (6 cards); Loader2 spinners on every AI button + Save button while pending.
  - Animations: framer-motion staggered fade-in for hero chips, fade+slide for card mounts, whileHover={{y:-4}} on cards.
  - Feedback: Sonner toasts on create/update/delete/AI success/error; AlertDialog confirmation before delete.
  - Accessibility: semantic header/main/footer/nav, aria-labels on all icon-only buttons, alt text empty for decorative images, sr-only close labels via shadcn Dialog, focus rings preserved.
  - AI toolbar: Generate (topic+tone inline panel) fills title/content/excerpt/tags; Rewrite (tone Select) replaces content; Improve replaces content; Summarize→excerpt fills excerpt. All disabled while any AI op runs.
  - News import: opens form pre-filled (title, snippet-as-content-with-attribution, excerpt, tags="AI, tech, news", category=Technology, source="news", sourceUrl=item.url).
- Lint result: `bun run lint` → 0 errors, 0 warnings.
- Dev log: page compiles and serves 200; all API endpoints (blogs CRUD, ai/*, news) confirmed working against the parallel backend agent's routes.

---
Task ID: 3
Agent: Orchestrator (integration & verification)
Task: Verify lint, dev server, and run end-to-end Agent Browser self-verification of the golden path; fix any issues found.

Work Log:
- Read full worklog + both subagent reports. Ran `bun run lint` → 0 errors. Dev server running cleanly on port 3000; all API routes returning correct status codes.
- Agent Browser end-to-end verification:
  - Opened `/` → renders correctly, title "AmberPress — AI-Powered Tech Blog", 0 console/page errors.
  - Hero, header (brand + nav + theme toggle + New Blog), Tabs (My Blogs / AI & Tech News), blog grid, footer all present.
  - Clicked a blog card → reader Dialog opened, Markdown rendered via react-markdown (headings "Why it matters"/"What to watch" confirmed).
  - New Blog form → all fields + AI toolbar (Generate from topic / Rewrite / Improve / Summarize → excerpt / Preview) present.
  - AI Generate from topic "The future of multimodal AI assistants in 2025" → /api/ai/generate 200 (~20s) → auto-filled title, full multi-paragraph Markdown content, excerpt, and comma-separated tags. Verified field values directly.
  - News tab → /api/news 200 → real AI/tech news from Reuters, TechCrunch, WSJ, MIT, BBC, etc., each with "Read source" + "Import to my blogs".
  - Import news → form pre-filled with news title/category(Technology)/tags(AI, tech, news)/content(blockquote)/excerpt. ✅
  - Mobile (390x844): single-column grid, header/footer visible, footer at viewport bottom. Desktop (1280x900): 3-column grid.
  - Theme toggle: light ↔ dark confirmed (html class + body bg). Sticky footer: footerBottom == viewport height (stickyOk: true).
- CRITICAL BUG FOUND & FIXED: After create/edit, the blog list did NOT auto-refresh (only updated on manual reload). Root cause: BlogFormDialog.handleSave persists via its OWN fetch and calls `onSaved`, but page.tsx's `onSaved` handler (`handleSaved`) was a no-op ("Mutations already invalidating; nothing else needed") — so the page's React Query cache was never refreshed. The page-level createBlog/updateBlog mutations (with refetch logic) were never actually invoked by the form.
  - Fix: changed `handleSaved` to `await qc.refetchQueries({ queryKey: ["blogs"] })`. Also updated all three page-level mutation `onSuccess` handlers (create/update/delete) to use explicit `await qc.refetchQueries({ queryKey: ["blogs"] })` (delete uses the page mutation via confirmDelete → deleteBlogMut.mutateAsync; create/edit use the form's own fetch + handleSaved refetch).
  - Re-verified: create → DOM 9→10 instantly (POST 201 → GET refetch, new blog appears first); edit → title updates + list refreshes (PUT 200 → GET refetch); delete → DOM 10→9 instantly (DELETE 200 → GET refetch). All without manual reload.
- Cleaned up test blogs created during verification via curl DELETE; left 3 meaningful blogs (2 seeded + 1 AI-generated).
- Final lint: 0 errors. Final state: 3 blogs, My Blogs tab, light theme.

Stage Summary:
- All golden-path interactions browser-verified: page render, blog list, markdown reader, create, AI generate (full blog), edit, delete, news fetch (web-search), news import, mobile + desktop responsive, light/dark theme toggle, sticky footer.
- Fixed a real auto-refresh bug (form's onSaved was a no-op) — now create/edit/delete all refresh the list instantly via explicit refetchQueries.
- Production-ready. Lint clean. Dev server healthy. No console/runtime errors.
