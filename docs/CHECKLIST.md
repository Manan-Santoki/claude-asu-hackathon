# CitizenOS — Complete Build Checklist

## Legend
- `[ ]` = Not started
- `[~]` = In progress
- `[x]` = Complete
- `[!]` = Blocked / needs attention
- `P0` = Must have for demo
- `P1` = Should have
- `P2` = Nice to have

---

## PHASE 0: FOUNDATION

### 0.1 Project Scaffolding
- [ ] P0 — Init Next.js project: `bunx create-next-app@latest citizenos --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- [ ] P0 — Init shadcn/ui: `bunx --bun shadcn@latest init`
- [ ] P0 — Add shadcn components: button, card, input, label, tabs, badge, dialog, sheet, separator, avatar, progress, slider, select, checkbox, radio-group, form, toast, sonner
- [ ] P0 — Install all prod dependencies (see TECH_STACK.md full list)
- [ ] P0 — Create `.env.example` with all variables
- [ ] P0 — Create `docker-compose.yml` (PG + Redis + MinIO)
- [ ] P0 — Create project directory structure (src/app, src/components, src/lib, etc.)

### 0.2 Database
- [ ] P0 — Write `prisma/schema.prisma` (from DATABASE_SCHEMA.md)
- [ ] P0 — Run `bunx prisma migrate dev --name init`
- [ ] P0 — Apply pgvector SQL migration (CREATE EXTENSION, ALTER TABLE, indexes)
- [ ] P0 — Create Prisma client singleton (`src/lib/db/prisma.ts`)
- [ ] P1 — Write seed script (`prisma/seed.ts`)
- [ ] P1 — Verify all tables with `bunx prisma studio`

### 0.3 Auth
- [ ] P0 — Install NextAuth v5: `bun add next-auth@beta @auth/prisma-adapter`
- [ ] P0 — Create `src/app/api/auth/[...nextauth]/route.ts`
- [ ] P0 — Create `src/lib/auth.ts` with NextAuth config
- [ ] P0 — Credentials provider (email + bcrypt password hash)
- [ ] P0 — Create `/login` page
- [ ] P0 — Create `/register` page
- [ ] P0 — Create auth middleware (`middleware.ts`) — protect all routes except login/register/landing
- [ ] P1 — Google OAuth provider
- [ ] P2 — GitHub OAuth provider

### 0.4 App Shell
- [ ] P0 — Root layout (`src/app/layout.tsx`) with providers (session, theme)
- [ ] P0 — AppShell component with sidebar + topnav
- [ ] P0 — Sidebar component with nav links (Dashboard, BillBreaker, RepScore, VoteMap, Settings)
- [ ] P0 — TopNav with user avatar dropdown (profile, settings, logout)
- [ ] P0 — Landing page (`src/app/page.tsx`) — hero + CTA for non-authenticated users
- [ ] P1 — Mobile responsive sidebar (hamburger menu)
- [ ] P2 — Dark mode toggle

### 0.5 Core Utilities
- [ ] P0 — Redis client (`src/lib/redis.ts`)
- [ ] P0 — MinIO S3 client (`src/lib/minio.ts`)
- [ ] P0 — OpenRouter client (`src/lib/api/openrouter.ts`)
- [ ] P0 — Cached fetch utility with Redis TTL
- [ ] P0 — TypeScript types: Bill, Rep, Candidate, UserProfile, etc. (`src/types/*.ts`)
- [ ] P1 — Error handling utilities (API error wrapper)
- [ ] P1 — Rate limiting middleware for API routes

---

## PHASE 1: ONBOARDING

### 1.1 Onboarding Wizard
- [ ] P0 — Stepper component (4 steps with progress bar)
- [ ] P0 — Step 1: Location — zip code input, auto-derive state
- [ ] P0 — Step 2: Identity — citizenship dropdown, age bracket
- [ ] P0 — Step 3: Occupation — multi-select tags, income bracket (optional)
- [ ] P0 — Step 4: Interests — policy area checkboxes, drag to rank top 3
- [ ] P0 — Zod validation schema for each step
- [ ] P0 — Server Action: save profile to `user_profiles` table
- [ ] P0 — Redirect to dashboard after completion
- [ ] P0 — Onboarding guard: redirect to onboarding if profile not completed

### 1.2 Settings
- [ ] P1 — `/settings` page to edit profile
- [ ] P1 — Pre-populate form with existing profile data
- [ ] P1 — Server Action to update profile

---

## PHASE 2: BILLBREAKER

### 2.1 API Clients
- [ ] P0 — `src/lib/api/congress.ts` — Congress.gov API client
  - [ ] `fetchRecentBills(congress, limit, offset)`
  - [ ] `fetchBillDetail(congress, type, number)`
  - [ ] `fetchBillText(congress, type, number)`
  - [ ] `fetchBillActions(congress, type, number)`
  - [ ] `searchBills(query)`
- [ ] P1 — `src/lib/api/legiscan.ts` — LegiScan API client
  - [ ] `searchBills(state, query)`
  - [ ] `getBillDetail(billId)`
  - [ ] `getBillText(textId)` — base64 decode

### 2.2 Bill Sync Pipeline
- [ ] P0 — API route: `POST /api/bills/sync`
- [ ] P0 — Fetch recent federal bills from Congress.gov
- [ ] P1 — Fetch state bills from LegiScan (user's state)
- [ ] P0 — Upsert bills to PostgreSQL (dedup via externalId)
- [ ] P0 — Fetch and store bill full text
- [ ] P1 — Handle PDF bills (OCR → text)

### 2.3 AI Pipelines
- [ ] P0 — `src/lib/ai/summarize.ts` — bill summarization
  - [ ] Text chunker: split into 1000-token chunks, 200 overlap
  - [ ] `src/lib/ai/embeddings.ts` — call self-hosted embedding model
  - [ ] Store chunks + embeddings in BillChunk table (pgvector)
  - [ ] Call OpenRouter with summarization prompt → store summary
- [ ] P0 — `src/lib/ai/impact.ts` — personal impact analysis
  - [ ] Define 10+ profile archetypes
  - [ ] For each archetype, call OpenRouter with impact prompt
  - [ ] Parse JSON response → store in BillImpact table
  - [ ] Classify severity: HIGH / MEDIUM / LOW / NONE

### 2.4 Bill Dashboard UI
- [ ] P0 — `/billbreaker/page.tsx` — main dashboard
- [ ] P0 — Two-tab layout: "Impacts Me" + "All Bills"
- [ ] P0 — `BillCard.tsx` — title, status, severity, impact summary, tags, date
- [ ] P0 — `ImpactBadge.tsx` — color-coded severity badge
- [ ] P0 — API route: `GET /api/bills` — list with filters
- [ ] P1 — Filter bar: severity, policy area, status, chamber
- [ ] P1 — Search with debounce
- [ ] P1 — Pagination or infinite scroll

### 2.5 Bill Detail Page
- [ ] P0 — `/billbreaker/[billId]/page.tsx`
- [ ] P0 — Header: bill number, title, status timeline
- [ ] P0 — Plain-English summary section
- [ ] P0 — "Impact On You" personalized section
- [ ] P0 — `BillChat.tsx` — RAG-powered Q&A interface
- [ ] P0 — API route: `POST /api/bills/[billId]/chat`
  - [ ] Embed question
  - [ ] pgvector similarity search (top 5 chunks)
  - [ ] LLM answer with chunk citations
- [ ] P1 — Sponsors list (with links to RepScore)
- [ ] P2 — Raw bill text expandable section

---

## PHASE 3: REPSCORE

### 3.1 API Clients
- [ ] P0 — `src/lib/api/openstates.ts` — Open States v3
  - [ ] `getRepsByGeo(lat, lng)` — geo lookup
  - [ ] `getRepDetail(ocdId)`
- [ ] P0 — Zip-to-lat/lng utility (dataset or geocoding API)
- [ ] P0 — `src/lib/api/fec.ts` — FEC API client
  - [ ] `searchCandidates(name)`
  - [ ] `getCandidateFinancials(candidateId)`
  - [ ] `getTopContributors(committeeId)`

### 3.2 Rep Data Pipeline
- [ ] P0 — API route: `GET /api/reps?zip=XXXXX`
- [ ] P0 — Lookup state reps via Open States geo
- [ ] P0 — Lookup federal reps via Congress.gov /member
- [ ] P0 — Merge and return combined rep list
- [ ] P0 — Fetch voting records → categorize by policy area
- [ ] P0 — Calculate party-line voting %

### 3.3 Promise Pipeline
- [ ] P0 — `src/lib/scraping/firecrawl.ts` — FireCrawl client
- [ ] P0 — `src/lib/scraping/serpapi.ts` — SerpAPI client
- [ ] P1 — `src/lib/scraping/puppeteer.ts` — Puppeteer fallback
- [ ] P0 — API route: `POST /api/reps/[repId]/scrape`
- [ ] P0 — Scrape campaign site + search for promises
- [ ] P0 — Store raw content in MinIO
- [ ] P0 — `src/lib/ai/promises.ts` — OpenRouter: extract promises
- [ ] P0 — Parse JSON → store in rep_promises

### 3.4 Scoring
- [ ] P0 — Promise scoring engine: compare promises vs votes
- [ ] P0 — Calculate Promise Alignment Score
- [ ] P1 — Days-to-fulfill calculation for kept promises
- [ ] P1 — Cache score on representative record

### 3.5 Financial Data
- [ ] P1 — Fetch FEC data for each rep
- [ ] P1 — Top contributors list
- [ ] P1 — Industry categorization
- [ ] P1 — Store in rep_finances table

### 3.6 RepScore UI
- [ ] P0 — `/repscore/page.tsx` — my reps dashboard
- [ ] P0 — `RepCard.tsx` — photo, name, party, score gauge, top issues
- [ ] P0 — API route: `GET /api/reps/:id`
- [ ] P0 — `/repscore/[repId]/page.tsx` — rep detail
- [ ] P0 — `AlignmentScore.tsx` — circular gauge component
- [ ] P0 — `PromiseTimeline.tsx` — visual timeline
- [ ] P1 — `VotingPatternChart.tsx` — Recharts bar chart
- [ ] P1 — `DonorBreakdown.tsx` — pie chart or treemap
- [ ] P2 — Score trend over time line chart

---

## PHASE 4: VOTEMAP

### 4.1 Candidate Data
- [ ] P0 — API route: `POST /api/candidates/[id]/scrape`
- [ ] P0 — Scrape candidate sites (FireCrawl + Crawl4AI)
- [ ] P0 — SerpAPI: positions + controversies + endorsements
- [ ] P0 — `src/lib/ai/reputation.ts` — reputation analysis
- [ ] P0 — OpenRouter: extract 15 policy positions (-2 to +2)
- [ ] P0 — Store in candidate_positions + candidate_reputation_items

### 4.2 Quiz
- [ ] P0 — `/votemap/quiz/page.tsx` — 15-question policy quiz
- [ ] P0 — `PolicyQuiz.tsx` — slider component per question (-2 to +2)
- [ ] P0 — Submit → store in quiz_answers table
- [ ] P0 — API route: `POST /api/votemap/quiz`

### 4.3 Matching Engine
- [ ] P0 — `src/lib/ai/matching.ts`
- [ ] P0 — Cosine similarity: user quiz vector vs candidate positions
- [ ] P0 — Per-issue breakdown (agree / partial / disagree)
- [ ] P0 — Compute economic + social axis for compass placement
- [ ] P1 — OpenRouter: natural language match explanation

### 4.4 VoteMap UI
- [ ] P0 — `/votemap/page.tsx`
- [ ] P0 — `PoliticalCompass.tsx` — D3.js 2D scatter plot
  - [ ] X-axis: economic, Y-axis: social
  - [ ] User point (highlighted)
  - [ ] Candidate points (party-colored)
  - [ ] Click interaction → flyout
- [ ] P0 — Candidate cards grid (sorted by alignment %)
- [ ] P0 — `CandidateCard.tsx` — name, party, alignment %, top issues, reputation
- [ ] P1 — `/votemap/candidate/[id]/page.tsx` — candidate detail
- [ ] P1 — `RadarChart.tsx` — Recharts radar (user vs candidate on 15 axes)
- [ ] P1 — `ReputationPanel.tsx` — grade, positives, controversies
- [ ] P2 — Financial backers section

---

## PHASE 5: POLISH & DEMO

### 5.1 Dashboard
- [ ] P0 — `/dashboard/page.tsx` — overview with 3 module summary cards
- [ ] P0 — BillBreaker summary: "X bills impact you"
- [ ] P0 — RepScore summary: your reps + scores
- [ ] P0 — VoteMap summary: "Take the quiz" or top match

### 5.2 Visual Polish
- [ ] P1 — Loading skeletons for all data-fetching pages
- [ ] P1 — Error boundaries with retry
- [ ] P1 — Empty states with CTAs
- [ ] P1 — Consistent typography and spacing
- [ ] P2 — Animations / transitions
- [ ] P2 — Dark mode full support

### 5.3 Demo Prep
- [ ] P0 — Seed script with realistic demo data (10-15 bills, 5-6 reps, 3-4 candidates)
- [ ] P0 — Pre-run AI pipelines for all seed data
- [ ] P0 — Write demo flow script (2-3 min walkthrough)
- [ ] P0 — End-to-end test of full demo flow
- [ ] P0 — Deploy to Hetzner via Dokploy
- [ ] P1 — Custom domain (citizenos.msantoki.com or similar)

### 5.4 Presentation
- [ ] P0 — Prepare 3-minute demo video or live demo
- [ ] P0 — Write project summary (problem, solution, tech, impact)
- [ ] P1 — Architecture diagram for presentation
- [ ] P1 — Screenshots / screen recordings as backup

---

## TOTAL TASK COUNT

| Priority | Count | Status |
|----------|-------|--------|
| P0 (Must have) | ~85 | [ ] |
| P1 (Should have) | ~30 | [ ] |
| P2 (Nice to have) | ~8 | [ ] |
| **Total** | **~123** | |
