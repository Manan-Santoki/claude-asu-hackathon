# CitizenOS — Hackathon Build Plan

> HackASU: March 20–22, 2026 (~24 hours of building time)

## Priority Order

**BillBreaker first** — it's the most demo-friendly module and stands alone. RepScore second. VoteMap last (most scraping-heavy, can be partially mocked for demo).

---

## Phase 0: Foundation (Hours 0–3)

### 0.1 Project Setup (30 min)
- [ ] `bunx create-next-app@latest citizenos --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- [ ] Initialize shadcn/ui: `bunx --bun shadcn@latest init`
- [ ] Add shadcn components: button, card, input, label, tabs, badge, dialog, sheet, separator, avatar, progress, slider, select, checkbox, radio-group, form, toast, sonner
- [ ] Install all production dependencies (see TECH_STACK.md)
- [ ] Set up `.env.example` with all needed variables
- [ ] Set up `docker-compose.yml` for PG + Redis + MinIO

### 0.2 Database Setup (30 min)
- [ ] Write `prisma/schema.prisma` (copy from DATABASE_SCHEMA.md)
- [ ] Run `bunx prisma migrate dev --name init`
- [ ] Apply pgvector migration (raw SQL)
- [ ] Verify with `bunx prisma studio`

### 0.3 Auth Setup (45 min)
- [ ] Configure NextAuth.js v5 with Prisma adapter
- [ ] Credentials provider (email + password with bcrypt)
- [ ] Create auth pages: `/login`, `/register`
- [ ] Set up middleware for protected routes
- [ ] Test: can register, login, logout

### 0.4 App Shell & Layout (45 min)
- [ ] Root layout with sidebar navigation
- [ ] Sidebar links: Dashboard, BillBreaker, RepScore, VoteMap, Settings
- [ ] Top nav with user avatar + logout
- [ ] Responsive: sidebar collapses on mobile
- [ ] Dashboard page with 3 module cards (placeholder)
- [ ] Consistent page layout wrapper component

### 0.5 Core Utilities (30 min)
- [ ] Prisma client singleton (`lib/db/prisma.ts`)
- [ ] Redis client (`lib/redis.ts`)
- [ ] MinIO client (`lib/minio.ts`)
- [ ] OpenRouter client wrapper (`lib/api/openrouter.ts`)
- [ ] Cached fetch utility with Redis
- [ ] Type definitions for all modules (`types/*.ts`)

---

## Phase 1: Onboarding + User Profile (Hours 3–5)

### 1.1 Onboarding Wizard (1.5 hours)
- [ ] Multi-step form component with stepper UI
- [ ] Step 1: Location (zip code input → auto-derive state/district)
- [ ] Step 2: Identity (citizenship status dropdown, age bracket)
- [ ] Step 3: Occupation (multi-select tags, optional income bracket)
- [ ] Step 4: Interests (policy area checkboxes + drag-to-rank top 3)
- [ ] Form validation with Zod
- [ ] Save to `user_profiles` table via Server Action
- [ ] Redirect to dashboard after completion

### 1.2 Profile Settings Page (30 min)
- [ ] `/settings` page to edit profile
- [ ] Pre-populate form with existing profile data
- [ ] Update profile via Server Action

---

## Phase 2: BillBreaker (Hours 5–12)

### 2.1 Congress.gov API Client (45 min)
- [ ] `lib/api/congress.ts` — typed client
- [ ] `fetchRecentBills(congress, limit)` — list bills
- [ ] `fetchBillDetail(congress, type, number)` — bill detail
- [ ] `fetchBillText(congress, type, number)` — bill text URL
- [ ] `fetchBillActions(congress, type, number)` — status history
- [ ] Error handling + retry logic
- [ ] Redis caching layer (6hr TTL for bill lists, 24hr for text)

### 2.2 LegiScan API Client (30 min)
- [ ] `lib/api/legiscan.ts` — typed client
- [ ] `searchBills(state, query)` — search state bills
- [ ] `getBillDetail(billId)` — bill detail
- [ ] `getBillText(textId)` — bill text (base64 decode)
- [ ] Redis caching

### 2.3 Bill Sync Pipeline (1 hour)
- [ ] API route: `POST /api/bills/sync`
- [ ] Fetch latest federal bills from Congress.gov
- [ ] Fetch state bills from LegiScan (based on user's state)
- [ ] Upsert bills into PostgreSQL (avoid duplicates via externalId)
- [ ] Fetch and store full text (in MinIO if PDF, in DB if plaintext)

### 2.4 AI Summarization Pipeline (1.5 hours)
- [ ] `lib/ai/summarize.ts` — bill summarization
- [ ] Text chunking utility: split bill text into 1000-token chunks with 200 overlap
- [ ] Generate embeddings for each chunk → store in pgvector
- [ ] Call OpenRouter with summarization prompt → store plain-English summary
- [ ] `lib/ai/impact.ts` — personal impact analysis
- [ ] Define profile archetypes: f1_student, veteran, small_business, h1b_worker, parent, retiree, healthcare_worker, gig_worker, homeowner, renter, citizen_general
- [ ] For each archetype, call OpenRouter with impact prompt → store in BillImpact table
- [ ] Impact severity classification: HIGH / MEDIUM / LOW / NONE

### 2.5 BillBreaker Dashboard UI (1.5 hours)
- [ ] `/billbreaker/page.tsx` — two-tab layout
- [ ] Tab 1: "Bills That Impact Me" — filtered by user profile
- [ ] Tab 2: "All Recent Bills" — unfiltered
- [ ] BillCard component: title, status badge, severity badge, impact summary, tags, date
- [ ] Filter bar: severity, policy area, status, chamber
- [ ] Search input with debounced full-text search
- [ ] Pagination (or infinite scroll)
- [ ] API route: `GET /api/bills` with query params for filtering

### 2.6 Bill Detail Page (1.5 hours)
- [ ] `/billbreaker/[billId]/page.tsx`
- [ ] Header: bill number, title, sponsors, status timeline
- [ ] Summary section: AI-generated plain English
- [ ] "Impact On You" section: personalized based on logged-in user's profile
- [ ] Bill Chat (RAG): chat UI component with message input
- [ ] API route: `POST /api/bills/[billId]/chat` — RAG pipeline
  - Embed user question → pgvector similarity search → top 5 chunks → LLM answer
- [ ] Expandable raw text section

---

## Phase 3: RepScore (Hours 12–18)

### 3.1 Open States API Client (30 min)
- [ ] `lib/api/openstates.ts`
- [ ] `getRepsByLocation(lat, lng)` — geo lookup
- [ ] `getRepDetail(ocdId)` — rep detail
- [ ] Zip-to-lat/lng conversion (use a lookup dataset or API)

### 3.2 Rep Lookup + Voting Record (1 hour)
- [ ] API route: `GET /api/reps?zip=85281`
- [ ] Combine: Open States (state reps) + Congress.gov /member (federal reps)
- [ ] Fetch voting records from Congress.gov
- [ ] Categorize votes by policy area
- [ ] Calculate party-line voting percentage
- [ ] Store in rep_votes table

### 3.3 Promise Scraping Pipeline (1.5 hours)
- [ ] API route: `POST /api/reps/[repId]/scrape`
- [ ] FireCrawl: scrape campaign website
- [ ] SerpAPI: search for campaign promises + press releases
- [ ] Store raw scraped content in MinIO
- [ ] OpenRouter: extract structured promises from scraped text
- [ ] Store promises in rep_promises table

### 3.4 Promise Scoring Engine (1 hour)
- [ ] `lib/ai/promises.ts`
- [ ] For each promise, compare against voting record
- [ ] OpenRouter: determine status (KEPT/BROKEN/IN_PROGRESS/NOT_YET_ACTIONABLE)
- [ ] Calculate Promise Alignment Score
- [ ] Calculate days-to-fulfill for kept promises
- [ ] Update rep's cached promiseScore

### 3.5 Financial Data (30 min)
- [ ] `lib/api/fec.ts` — FEC API client
- [ ] Fetch top contributors for each rep
- [ ] Categorize by industry
- [ ] Store in rep_finances table

### 3.6 RepScore Dashboard UI (1.5 hours)
- [ ] `/repscore/page.tsx` — rep cards for user's zip
- [ ] RepCard: photo, name, party, alignment score gauge, top issues
- [ ] `/repscore/[repId]/page.tsx` — rep detail
- [ ] Promise Timeline component (visual timeline with status badges)
- [ ] Voting Pattern chart (Recharts bar chart by policy area)
- [ ] Party-line gauge
- [ ] Donor breakdown (pie chart or treemap)
- [ ] Score trend over time (line chart)

---

## Phase 4: VoteMap (Hours 18–22)

### 4.1 Candidate Data Collection (1 hour)
- [ ] API route: `POST /api/candidates/[id]/scrape`
- [ ] Scrape candidate campaign sites (FireCrawl/Crawl4AI)
- [ ] SerpAPI: find positions, controversies, endorsements
- [ ] OpenRouter: extract positions on 15 policy axes (-2 to +2)
- [ ] OpenRouter: generate reputation analysis
- [ ] Store in candidate_positions + candidate_reputation_items

### 4.2 Policy Quiz (1 hour)
- [ ] `/votemap/quiz/page.tsx`
- [ ] 15-question quiz with slider (-2 to +2 per question)
- [ ] Submit → store in quiz_answers table
- [ ] Generate user position vector (embed all 15 scores)
- [ ] Redirect to `/votemap` with results

### 4.3 Matching Engine (1 hour)
- [ ] `lib/ai/matching.ts`
- [ ] Compute alignment: cosine similarity between user vector and candidate vectors
- [ ] Per-issue breakdown: agree, partial, disagree per policy area
- [ ] Compute economic + social axis positions for compass placement
- [ ] OpenRouter: generate natural language match explanation

### 4.4 VoteMap Dashboard UI (1 hour)
- [ ] `/votemap/page.tsx`
- [ ] D3.js political compass (2D scatter plot)
  - Economic axis (x) + Social axis (y)
  - User point + candidate points
  - Color-coded by party
  - Click → flyout
- [ ] Candidate cards grid (sorted by alignment %)
- [ ] CandidateCard: photo, name, party, alignment %, top matching issues, reputation grade

### 4.5 Candidate Detail Page (30 min)
- [ ] `/votemap/candidate/[id]/page.tsx`
- [ ] Radar chart: user vs candidate on 15 axes (Recharts)
- [ ] Position breakdown table
- [ ] Reputation panel
- [ ] Financial backers (if data available)

---

## Phase 5: Polish & Demo Prep (Hours 22–24)

### 5.1 Dashboard Overview (30 min)
- [ ] `/dashboard` page with 3 module summary cards
- [ ] BillBreaker card: "X bills impact you" with severity breakdown
- [ ] RepScore card: your reps with alignment scores
- [ ] VoteMap card: "Take the quiz" CTA or top match

### 5.2 Visual Polish (30 min)
- [ ] Consistent color scheme across modules
- [ ] Loading states / skeletons for all data-fetching components
- [ ] Error states with retry buttons
- [ ] Empty states with helpful CTAs
- [ ] Mobile responsiveness check

### 5.3 Demo Data Seeding (30 min)
- [ ] Seed script with realistic sample data
- [ ] 10-15 bills with pre-generated summaries and impacts
- [ ] 5-6 representatives with promises and voting records
- [ ] 3-4 candidates with positions and reputation data
- [ ] Pre-run all AI pipelines so demo loads instantly

### 5.4 Demo Flow Script (30 min)
- [ ] Write out the exact demo flow (2-3 minutes)
- [ ] Register → Onboarding (F-1 student in AZ)
- [ ] BillBreaker: show immigration bill with HIGH impact
- [ ] Click into bill → show personalized impact → ask RAG question
- [ ] RepScore: show AZ senator → promise timeline → broken promise
- [ ] VoteMap: take quiz → see compass → see top matching candidate
- [ ] Test the full flow end-to-end
