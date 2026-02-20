# Job Application Tracker - Design Document

## Context

Build a single-user job application tracker as a Next.js web app. The app has three core features:
1. **Gmail Integration** - Scan confirmation emails to automatically track applications
2. **Dashboard** - Visual dashboard with charts, stats, table view, and Kanban board
3. **Job Search** - Find relevant jobs via APIs (JSearch, Adzuna) + Indeed/Glassdoor scraping, powered by resume-extracted skills

**Key decisions:**
- Tech stack: Next.js 15 + TypeScript (App Router)
- Single user only (no multi-user auth)
- Build locally first, deploy later
- Job sources: Indeed/Glassdoor scraping + aggregate APIs (JSearch, Adzuna)
- Gmail scan window: 90 days
- Dark mode by default with toggle

---

## Tech Stack

| Category | Choice | Why |
|----------|--------|-----|
| Framework | Next.js 15 (App Router) + TypeScript | Full-stack, API routes built in |
| Database | SQLite via `better-sqlite3` + Prisma ORM | Zero-config, single-file DB, perfect for single-user |
| UI | shadcn/ui + Tailwind CSS v4 | Customizable, lightweight, owns the code |
| Charts | Recharts (via shadcn/ui chart components) | Built-in integration with shadcn |
| Kanban DnD | @hello-pangea/dnd | Maintained fork of react-beautiful-dnd |
| Data Table | @tanstack/react-table | Headless, sortable, filterable |
| Gmail | googleapis + next-auth v5 (Google OAuth) | Official API, clean token lifecycle |
| Email Parsing | mailparser + cheerio | MIME parsing + HTML extraction |
| Resume Parsing | pdf-parse + custom skill taxonomy | No external API needed |
| Job APIs | JSearch (RapidAPI) + Adzuna | Free tiers, aggregated listings |
| Scraping | Playwright (optional, for Indeed/Glassdoor) | Headless browser, stealth capabilities |
| Forms | react-hook-form + zod | Validation + type safety |
| Toasts | sonner | Integrates with shadcn/ui |
| Icons | lucide-react | Used by shadcn/ui |
| Dates | date-fns | Lightweight date formatting |

---

## Project Structure

```
application-tracker/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/
│   ├── seed.ts                # Sample dev data
│   └── dev.db                 # SQLite file (gitignored)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout + providers
│   │   ├── page.tsx           # Redirect to /dashboard
│   │   ├── globals.css
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx     # Sidebar + topbar shell
│   │   │   ├── dashboard/page.tsx      # Stats + charts
│   │   │   ├── applications/page.tsx   # Table view
│   │   │   ├── applications/[id]/page.tsx  # Detail/edit
│   │   │   ├── applications/new/page.tsx   # Manual entry
│   │   │   ├── board/page.tsx          # Kanban board
│   │   │   ├── jobs/page.tsx           # Job search
│   │   │   ├── jobs/saved/page.tsx     # Saved jobs
│   │   │   └── settings/page.tsx       # Gmail, resume, prefs
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── applications/route.ts       # GET list, POST create
│   │       ├── applications/[id]/route.ts  # GET, PUT, DELETE
│   │       ├── gmail/sync/route.ts         # POST trigger scan
│   │       ├── gmail/status/route.ts       # GET sync state
│   │       ├── jobs/search/route.ts        # GET search
│   │       ├── jobs/saved/route.ts         # GET, POST, DELETE
│   │       ├── resume/upload/route.ts      # POST upload PDF
│   │       ├── resume/skills/route.ts      # GET extracted skills
│   │       └── stats/route.ts              # GET dashboard stats
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── dashboard/         # Stats cards, charts
│   │   ├── applications/      # Table, form, card, status badge
│   │   ├── board/             # Kanban board + columns
│   │   ├── jobs/              # Job cards, search form
│   │   └── layout/            # Sidebar, topbar, theme provider
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── auth.ts            # NextAuth config
│   │   ├── gmail/
│   │   │   ├── client.ts      # Gmail API client
│   │   │   ├── sync.ts        # Email fetching logic
│   │   │   ├── parser.ts      # Parser orchestrator
│   │   │   └── parsers/       # Platform-specific parsers
│   │   │       ├── linkedin.ts, indeed.ts, greenhouse.ts
│   │   │       ├── lever.ts, workday.ts, icims.ts
│   │   │       ├── generic.ts # Fallback parser
│   │   │       └── index.ts   # Parser registry
│   │   ├── jobs/
│   │   │   ├── jsearch.ts     # JSearch API client
│   │   │   ├── adzuna.ts      # Adzuna API client
│   │   │   ├── scraper.ts     # Playwright scraper (optional)
│   │   │   └── aggregator.ts  # Merge + dedupe results
│   │   ├── resume/
│   │   │   ├── parser.ts      # PDF text extraction
│   │   │   ├── skills-extractor.ts
│   │   │   └── taxonomy.ts    # Skills dictionary (~500 terms)
│   │   ├── utils.ts
│   │   └── validators.ts      # Zod schemas
│   ├── hooks/                 # React data-fetching hooks
│   └── types/index.ts         # Shared TypeScript types
└── public/
```

---

## Database Schema (Prisma + SQLite)

### Models

**Application** - Core model
- `id` (cuid), `companyName`, `positionTitle`, `status` (applied/phone_screen/interview/offer/rejected/accepted/withdrawn)
- `platform` (linkedin/indeed/greenhouse/lever/workday/company_website/other)
- `applicationDate`, `lastUpdated`, `url`, `salary`, `location`, `jobType`
- `notes`, `source` (manual/gmail_sync), `emailMessageId` (unique, for dedup)
- `contactName`, `contactEmail`, `createdAt`
- Relations: `statusHistory` (StatusChange[]), `tags` (ApplicationTag[])

**StatusChange** - Audit trail
- `id`, `applicationId` (FK), `fromStatus`, `toStatus`, `changedAt`, `notes`

**SavedJob** - Bookmarked jobs from search
- `id`, `title`, `company`, `location`, `salary`, `url` (unique), `source`, `sourceId`
- `description`, `savedAt`, `applied` (boolean)

**Tag / ApplicationTag** - Flexible tagging
- Tag: `id`, `name` (unique), `color`
- ApplicationTag: composite key (`applicationId`, `tagId`)

**ResumeProfile** - Uploaded resume data
- `id`, `fileName`, `uploadedAt`, `rawText`, `skills` (JSON string), `jobTitles` (JSON string), `isActive`

**GmailSyncState** - Singleton for sync tracking
- `id` ("singleton"), `lastSyncAt`, `lastHistoryId`, `syncInProgress`, `totalSynced`

**Setting** - Key-value preferences
- `key` (PK), `value`

---

## API Routes

### Applications CRUD
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/applications` | List with filters: `status`, `search`, `sortBy`, `sortDir`, `page`, `limit`, `dateFrom`, `dateTo` |
| POST | `/api/applications` | Create (manual entry) |
| GET | `/api/applications/[id]` | Get single with status history |
| PUT | `/api/applications/[id]` | Update fields / change status |
| DELETE | `/api/applications/[id]` | Delete |

### Gmail Sync
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/gmail/sync` | Trigger email scan (`{ fullSync?: boolean }`) |
| GET | `/api/gmail/status` | Sync state (last sync, in-progress, count) |

### Job Search
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/jobs/search` | Search: `query`, `location`, `page`, `sources` |
| GET | `/api/jobs/saved` | List saved jobs |
| POST | `/api/jobs/saved` | Save a job |
| DELETE | `/api/jobs/saved/[id]` | Remove saved job |

### Resume
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/resume/upload` | Upload PDF, parse, store profile |
| GET | `/api/resume/skills` | Get extracted skills from active profile |

### Stats
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/stats` | Dashboard aggregations: `period` (7d/30d/90d/all) |

---

## Implementation Phases

### Phase 1: Project Foundation + Database
- Initialize Next.js 15 + TypeScript + Tailwind v4 + ESLint
- Install and configure shadcn/ui (`npx shadcn@latest init`), dark mode default
- Set up Prisma with SQLite, define full schema, run migration
- Create Prisma client singleton
- Build dashboard layout shell (sidebar + topbar + theme toggle)
- Create placeholder pages for all routes
- Seed DB with ~15 sample applications

### Phase 2: Applications CRUD + Table View
- API routes: GET (list with filters/sort/pagination), POST, PUT, DELETE
- Zod validation schemas
- Applications table page with @tanstack/react-table:
  - Columns: Company, Position, Status (badge), Platform, Date, Actions
  - Filter by status, search by company/position, sortable, paginated
- Application detail/edit page with status history timeline
- Manual entry form with react-hook-form + zod

### Phase 3: Dashboard with Charts
- Stats API: totals, by-status counts, weekly time series, top companies, platform breakdown, response rate
- Dashboard page:
  - Summary stat cards (total, active, interviews, offers)
  - Area chart: applications over time
  - Donut chart: by status
  - Bar chart: top companies
  - Recent applications mini-table
- Period selector: 7d, 30d, 90d, all time

### Phase 4: Kanban Board
- Board page with columns per status
- Application cards with company, position, date
- Drag-and-drop between columns (status update + audit trail)
- Context menu on cards: edit, delete, open detail

### Phase 5: Gmail Integration
- Google Cloud project setup (Gmail API + OAuth2 credentials)
- NextAuth with Google provider (gmail.readonly scope)
- Gmail client: search emails, fetch full content, incremental sync via historyId
- Email parser chain:
  - Identify sender domain -> platform-specific parser -> generic fallback
  - Platform parsers: LinkedIn, Indeed, Greenhouse, Lever, Workday, iCIMS
  - Confidence scoring (0.0-1.0), auto-import >= 0.6, flag rest for review
- Gmail search query: `subject:("application" OR "applied" OR "thank you for applying" ...) AND NOT subject:("interview" OR "reminder") AND -from:me AND newer_than:90d`
- Sync API routes (trigger sync, get status)
- Settings page: Connect Gmail button, Sync Now, last sync info, review low-confidence parses

### Phase 6: Job Search + Resume Parsing
- Resume upload: PDF -> text extraction -> skill matching against taxonomy (~500 terms)
- Job search clients: JSearch API + Adzuna API
- Aggregator: parallel fetch, deduplicate, sort by relevance
- Result caching (1-hour TTL in SQLite)
- Jobs search page: query + location + filters, "Use resume skills" button, job cards grid
- Saved jobs page: bookmarks, "Mark as Applied" creates Application record
- Optional: Playwright scraper for Indeed/Glassdoor (toggle in settings)

### Phase 7: Polish + Deployment Prep
- Responsive design pass
- Loading states, error boundaries, empty states
- Toast notifications for all actions
- .env.example + README with setup instructions
- Optional: Dockerfile for containerized deployment

---

## Key Architecture Details

### Email Parser Chain
Uses a chain-of-responsibility pattern. Each ATS platform gets its own parser module implementing a common interface:
```
Email -> Identify sender domain -> Platform-specific parser -> Generic fallback -> Result with confidence score
```
- Confidence >= 0.6: auto-import as Application
- Confidence < 0.6: flag for manual review
- `emailMessageId` prevents duplicate imports

### Job Search Aggregator
```
User query -> JSearch API  --+
          -> Adzuna API   ---+--> Deduplicate -> Sort -> Cache (1hr TTL) -> Return
          -> Scraper (opt) --+
```
- Free tier limits: JSearch 200 req/month, Adzuna 250 req/day
- Cache identical queries for 1 hour in SQLite

### Resume Skill Extraction
- `pdf-parse` extracts raw text from PDF
- Custom taxonomy (~500 terms) of tech skills, frameworks, languages, job titles
- Case-insensitive matching with abbreviation expansion (e.g., "JS" -> "JavaScript")
- Extracted skills auto-populate job search queries

---

## Verification Plan

After each phase:
1. `npm run dev` - confirm app starts without errors
2. `npx prisma studio` - verify database state
3. Manual testing of all new UI pages and API routes
4. After Phase 5: Connect real Gmail account and run a sync
5. After Phase 6: Upload a real resume and run a job search
6. After Phase 7: Test responsive design at mobile/tablet breakpoints
