# Application Tracker

A full-featured job application tracker built with Next.js. Track applications, visualize your pipeline with a Kanban board and dashboard charts, sync emails from Gmail, search for jobs, and manage your resume profile — all in one place.

## Features

- **Applications CRUD** — Add, edit, delete, and filter job applications with a sortable data table
- **Kanban Board** — Drag-and-drop applications across status columns (Applied, Phone Screen, Interview, Offer, Rejected, Accepted, Withdrawn)
- **Dashboard** — Stats cards, timeline chart, status breakdown, top companies, and platform distribution
- **Gmail Sync** — Connect your Google account to automatically import application confirmation and rejection emails
- **Job Search** — Search jobs across multiple sources (JSearch, Adzuna) with optional web scraping (Indeed, Glassdoor)
- **Resume Parsing** — Upload your resume PDF to extract skills and job titles for smarter job matching
- **Saved Jobs** — Bookmark jobs from search results and convert them to tracked applications
- **Dark Mode** — Dark theme by default with light mode toggle

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | SQLite via Prisma 7 + better-sqlite3 |
| Auth | NextAuth v5 (Google OAuth) |
| Charts | Recharts |
| Drag & Drop | @hello-pangea/dnd |
| Forms | react-hook-form + Zod |
| Email | Gmail API (googleapis) |
| Job Search | JSearch API, Adzuna API, Playwright (optional) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/cristiam-developer/application-tracker.git
cd application-tracker
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite database path (default: `file:./dev.db`) |
| `NEXTAUTH_URL` | Yes | App URL (default: `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes | Random secret for session encryption |
| `GOOGLE_CLIENT_ID` | For Gmail sync | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | For Gmail sync | Google OAuth client secret |
| `JSEARCH_API_KEY` | For job search | RapidAPI key for JSearch |
| `ADZUNA_APP_ID` | For job search | Adzuna application ID |
| `ADZUNA_APP_KEY` | For job search | Adzuna application key |
| `ENABLE_SCRAPER` | Optional | Set to `true` to enable Playwright web scraping |

### Database Setup

```bash
npx prisma db push
```

To seed sample data:

```bash
npx prisma db seed
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Docker

Build and run with Docker:

```bash
docker build -t application-tracker .
docker run -p 3000:3000 -v app-data:/app/prisma application-tracker
```

The volume mount persists the SQLite database between container restarts.

To pass environment variables:

```bash
docker run -p 3000:3000 \
  -v app-data:/app/prisma \
  -e NEXTAUTH_SECRET=your-secret \
  -e GOOGLE_CLIENT_ID=your-id \
  -e GOOGLE_CLIENT_SECRET=your-secret \
  application-tracker
```

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/           # Route group with sidebar layout
│   │   ├── applications/      # Applications list, detail, new
│   │   ├── board/             # Kanban board
│   │   ├── dashboard/         # Stats & charts
│   │   ├── jobs/              # Job search & saved jobs
│   │   └── settings/          # Gmail, resume, preferences
│   ├── api/                   # API routes
│   │   ├── applications/      # CRUD endpoints
│   │   ├── auth/              # NextAuth handler
│   │   ├── gmail/             # Gmail sync endpoints
│   │   ├── jobs/              # Job search & saved jobs
│   │   ├── resume/            # Resume upload & skills
│   │   └── stats/             # Dashboard statistics
│   ├── layout.tsx             # Root layout (theme, session, toaster)
│   └── not-found.tsx          # Custom 404 page
├── components/
│   ├── applications/          # Data table, form, detail view
│   ├── board/                 # Kanban board, columns, cards
│   ├── dashboard/             # Stat cards, charts, period selector
│   ├── jobs/                  # Search form, job cards, saved jobs
│   ├── layout/                # Sidebar, topbar, theme toggle
│   ├── settings/              # Gmail, sync, resume settings
│   └── ui/                    # shadcn/ui primitives
├── generated/prisma/          # Generated Prisma client (gitignored)
├── lib/
│   ├── gmail/                 # Gmail client, parsers, sync engine
│   │   └── parsers/           # Platform-specific email parsers
│   ├── jobs/                  # Job search aggregator, API clients
│   ├── queries/               # Database query functions
│   ├── resume/                # PDF parser, skills extractor
│   ├── db.ts                  # Prisma client singleton
│   └── validators.ts          # Zod schemas
└── types/
    └── index.ts               # Shared types & config constants
```

## License

MIT
