# AmberPress — AI-Powered Tech Blog

A modern, personal blog platform with AI-assisted writing and live tech-news
aggregation. Write, rewrite, and curate blog posts with an AI co-writer, and
pull the latest AI & technology headlines from around the web — all in a
clean, responsive, amber-themed interface.

![AmberPress](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8) ![Prisma](https://img.shields.io/badge/Prisma-6-2d3748)

## Features

- **Full blog CRUD** — create, read, edit, and delete posts with an instant-refresh grid.
- **AI co-writer** (powered by Z.ai):
  - *Generate from topic* — give a topic, get a full Markdown draft (title + content + excerpt + tags).
  - *Rewrite* — rephrase content in a chosen tone (professional, casual, enthusiastic, informative, storytelling).
  - *Improve* — fix grammar, clarity, and style.
  - *Summarize → excerpt* — auto-generate a 1–2 sentence excerpt from the content.
- **Live AI & tech news** — fetches real headlines from around the world via web search, with one-click *Import to my blogs*.
- **Markdown everywhere** — write in Markdown, preview inline, render in the reader.
- **Responsive & mobile-first** — single-column on mobile, up to three columns on desktop.
- **Light amber theme** — warm, modern UI with a dark-mode toggle.
- **Sticky footer** — stays put on short pages, pushed down on long content.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Database | Prisma ORM + SQLite |
| Data fetching | TanStack Query |
| Animations | Framer Motion |
| Markdown | react-markdown |
| AI | z-ai-web-dev-sdk (LLM + web search) — backend only |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- A `.env` file with a SQLite database path (see `.env.example`)

### Install & run

```bash
# 1. Install dependencies
bun install   # or: npm install

# 2. Set up the environment
cp .env.example .env

# 3. Create the database & generate the Prisma client
bun run db:push

# 4. (Optional) Seed sample blogs
bun run prisma/seed.ts

# 5. Start the dev server
bun run dev
```

Open `http://localhost:3000` in your browser.

### Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start the dev server (port 3000) |
| `bun run build` | Production build (standalone output) |
| `bun run start` | Run the production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push the Prisma schema to the database |
| `bun run db:generate` | Regenerate the Prisma client |

## Project structure

```
src/
├── app/
│   ├── api/                  # API routes (backend)
│   │   ├── blogs/            # Blog CRUD
│   │   ├── ai/               # AI endpoints (rewrite, improve, generate, summarize)
│   │   └── news/             # Live tech-news web search
│   ├── globals.css           # Light amber theme + dark mode
│   ├── layout.tsx            # Root layout (ThemeProvider, toasters)
│   └── page.tsx              # The blog page (only user-visible route)
├── components/
│   ├── blog/                 # Blog-specific UI (header, cards, dialogs, footer…)
│   ├── ui/                   # shadcn/ui primitives
│   ├── theme-toggle.tsx
│   └── providers.tsx         # TanStack Query provider
├── lib/
│   ├── db.ts                 # Prisma client
│   ├── types.ts              # Shared types (Blog, NewsItem, …)
│   └── utils.ts
└── hooks/
prisma/
├── schema.prisma             # Blog model
└── seed.ts                   # Sample blogs
```

## How it works

- **Blogs** are stored in a local SQLite database via Prisma. The UI reads them
  through `GET /api/blogs` and writes via `POST`/`PUT`/`DELETE`.
- **AI features** call the Z.ai SDK (`z-ai-web-dev-sdk`) on the server only —
  never in the browser. The LLM powers generate/rewrite/improve/summarize.
- **News** uses the Z.ai web-search function to retrieve live AI & tech
  headlines, which can be imported into your blog list with one click.

## License

MIT — free to use as a personal project.
