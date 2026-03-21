# CitizenOS — Architecture Design Document (v2)

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                          FRONTEND                                │
│                 React + Vite + shadcn/ui                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                   Interactive USA Map (Hub)                │   │
│  │         Click state → panels load module data              │   │
│  └──────┬──────────────────┬──────────────────┬───────────────┘   │
│         │                  │                  │                   │
│  ┌──────▼──────┐   ┌──────▼───────┐   ┌──────▼──────┐           │
│  │ BillBreaker │   │  RepScore    │   │  VoteMap    │           │
│  │             │   │              │   │             │           │
│  │ • Bill list │   │ • Rep cards  │   │ • Quiz      │           │
│  │ • AI summary│   │ • Vote log   │   │ • Matching  │           │
│  │ • Persona   │   │ • Promise    │   │ • Compare   │           │
│  │   impact    │   │   alignment  │   │ • Reputation│           │
│  │ • Chat      │   │ • Contact    │   │ • Policy    │           │
│  │ • Notifs    │   │   rep        │   │   axes      │           │
│  └─────────────┘   └──────────────┘   └─────────────┘           │
│                                                                  │
│              Shared: Zustand stores + API layer                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │ REST API
┌──────────────────────────┴───────────────────────────────────────┐
│                      INSFORGE BACKEND                            │
│                                                                  │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐      │
│  │   Auth   │  │  Postgres │  │   Edge    │  │  Storage  │      │
│  │  (OAuth) │  │    DB     │  │ Functions │  │  (Files)  │      │
│  └──────────┘  └───────────┘  └───────────┘  └───────────┘      │
│                                                                  │
│  Edge Functions (by module):                                     │
│  ┌─────────────────┬──────────────────┬─────────────────┐        │
│  │  BillBreaker    │    RepScore      │    VoteMap      │        │
│  │  • /bills       │  • /reps         │  • /candidates  │        │
│  │  • /bills/chat  │  • /reps/votes   │  • /quiz        │        │
│  │  • /bills/impact│  • /reps/contact │  • /reputation  │        │
│  │  • /notifs      │  • /reps/score   │  • /compare     │        │
│  └─────────────────┴──────────────────┴─────────────────┘        │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────┴───────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│                                                                  │
│  Congress.gov API ── ProPublica API ── Google Civic Info API     │
│  TinyFish/AgentQL ── OpenSecrets API ── LLM (model gateway)     │
│  Ballotpedia (via TinyFish scrape)                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend Framework | React 18 + Vite | Fast dev, team knows it |
| UI Library | shadcn/ui + Tailwind CSS | Beautiful components, fast to build |
| Map | react-simple-maps | SVG-based, lightweight, perfect for state-level interaction |
| Charts | recharts | Lightweight, React-native, for score gauges + policy axes |
| State Management | Zustand | Minimal boilerplate, simple store |
| Backend | InsForge (Postgres + Auth + Edge Functions) | Zero backend setup, MCP-provisioned |
| AI/LLM | InsForge Model Gateway (or OpenAI/Gemini) | Bill summaries, chat, impact analysis, reputation |
| Data Scraping | TinyFish/AgentQL | Scrape Ballotpedia, OpenSecrets, state legislature sites |
| Deployment | InsForge Site Deployment | One-command deploy |

---

## Project Structure

```
citizenos/
├── public/
│   └── us-states-topo.json              # TopoJSON for USA map
├── src/
│   ├── main.tsx                         # App entry
│   ├── App.tsx                          # Router + layout
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui (auto-generated)
│   │   │
│   │   ├── layout/                      # SHARED — built in Sprint 0
│   │   │   ├── Header.tsx               # Nav + notifications + user menu
│   │   │   ├── Dashboard.tsx            # Aggregated user home
│   │   │   └── PageWrapper.tsx          # Common page layout
│   │   │
│   │   ├── auth/                        # SHARED — built in Sprint 0
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── OnboardingFlow.tsx       # 3-step wizard
│   │   │
│   │   ├── map/                         # SHARED — built in Sprint 0
│   │   │   ├── USAMap.tsx               # Interactive map (react-simple-maps)
│   │   │   ├── StatePanel.tsx           # Sheet with module tabs
│   │   │   ├── MapLegend.tsx            # Color scale legend
│   │   │   └── MapControls.tsx          # Color mode toggle, reset
│   │   │
│   │   ├── billbreaker/                 # PERSON A owns this folder
│   │   │   ├── BillList.tsx             # Paginated bill list with filters
│   │   │   ├── BillCard.tsx             # Bill preview card
│   │   │   ├── BillDetailPage.tsx       # Full bill page (/bill/:id)
│   │   │   ├── BillHeader.tsx           # Title, number, sponsor, status
│   │   │   ├── StatusTimeline.tsx       # Legislative progress stepper
│   │   │   ├── AISummary.tsx            # AI summary card with source toggle
│   │   │   ├── PersonaSelector.tsx      # Profile chip toggles
│   │   │   ├── ImpactPanel.tsx          # Persona-specific impact text
│   │   │   ├── ImpactStory.tsx          # AI narrative section
│   │   │   ├── BillChat.tsx             # Q&A chat interface
│   │   │   ├── RepsVoted.tsx            # Cross-module: reps who voted
│   │   │   ├── BillActionBar.tsx        # Save, contact, share buttons
│   │   │   ├── NotificationBell.tsx     # Bell icon + dropdown
│   │   │   ├── NotificationDropdown.tsx # Notification list
│   │   │   └── NotifPreferences.tsx     # Category toggle settings page
│   │   │
│   │   ├── repscore/                    # PERSON B owns this folder
│   │   │   ├── RepList.tsx              # Rep grid with filters
│   │   │   ├── RepCard.tsx              # Rep preview card with score
│   │   │   ├── RepDetailPage.tsx        # Full rep page (/rep/:id)
│   │   │   ├── RepHeader.tsx            # Photo, name, party, state
│   │   │   ├── ScoreGauges.tsx          # 3 circular score gauges
│   │   │   ├── PromiseTracker.tsx       # Promise list with status chips
│   │   │   ├── PromiseItem.tsx          # Single promise + evidence
│   │   │   ├── VotingRecord.tsx         # Paginated vote table
│   │   │   ├── BillsSponsored.tsx       # Bills this rep introduced
│   │   │   ├── ContactRep.tsx           # AI email generator
│   │   │   └── RepScoreDashboard.tsx    # Browse all reps (/reps)
│   │   │
│   │   └── votemap/                     # PERSON C owns this folder
│   │       ├── PolicyQuiz.tsx           # Quiz wrapper with progress
│   │       ├── QuizQuestion.tsx         # Single question card
│   │       ├── QuizResults.tsx          # Results wrapper
│   │       ├── MatchList.tsx            # Ranked candidate matches
│   │       ├── MatchCard.tsx            # Single match with axis bars
│   │       ├── PolicyRadar.tsx          # Radar chart (recharts)
│   │       ├── CandidateCompare.tsx     # Side-by-side comparison
│   │       ├── CandidateList.tsx        # Browse candidates
│   │       ├── CandidateDetail.tsx      # Full candidate page
│   │       ├── ReputationCard.tsx       # Funding, endorsements, flags
│   │       ├── FundingChart.tsx         # Bar chart for funding data
│   │       └── VoteMapPage.tsx          # Main /vote route page
│   │
│   ├── stores/
│   │   ├── useAuthStore.ts              # User auth state (Sprint 0)
│   │   ├── useMapStore.ts               # Map state (Sprint 0)
│   │   ├── useBillStore.ts              # Person A
│   │   ├── useNotifStore.ts             # Person A
│   │   ├── useRepStore.ts               # Person B
│   │   └── useQuizStore.ts              # Person C
│   │
│   ├── api/
│   │   ├── insforge.ts                  # InsForge client (Sprint 0)
│   │   ├── auth.ts                      # Auth calls (Sprint 0)
│   │   ├── map.ts                       # Map data calls (Sprint 0)
│   │   ├── bills.ts                     # Person A
│   │   ├── notifications.ts             # Person A
│   │   ├── reps.ts                      # Person B
│   │   ├── candidates.ts               # Person C
│   │   └── quiz.ts                      # Person C
│   │
│   ├── lib/
│   │   ├── utils.ts                     # shadcn/ui utils
│   │   ├── personas.ts                  # Persona definitions + display config
│   │   ├── categories.ts               # Category definitions + icons
│   │   ├── states.ts                    # US state data (names, codes, FIPS)
│   │   └── policyAxes.ts               # Policy axis definitions for quiz
│   │
│   └── styles/
│       └── globals.css                  # Tailwind + custom theme
│
├── seed/                                # Data seeding scripts
│   ├── seed-bills.ts                    # Fetch + AI-process bills
│   ├── seed-reps.ts                     # Fetch reps + voting records
│   ├── seed-promises.json               # Curated campaign promises
│   ├── seed-candidates.json             # Curated candidate data
│   ├── seed-positions.json              # Candidate policy positions
│   └── seed-reputation.ts              # TinyFish scrape + AI analysis
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── components.json                      # shadcn/ui config
└── .env                                 # API keys
```

---

## Database Schema (InsForge Postgres)

### Shared / Auth Tables

```sql
-- Core user record
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  state_code CHAR(2),
  zip_code TEXT,
  district TEXT,                          -- congressional district (e.g., 'TX-21')
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Multi-select persona profiles (student, veteran, visa_holder, etc.)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_type TEXT NOT NULL,
  UNIQUE(user_id, profile_type)
);

-- Issue categories user cares about, drives notifications
CREATE TABLE user_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  notify_enabled BOOLEAN DEFAULT true,
  UNIQUE(user_id, category)
);
```

### BillBreaker Tables

```sql
-- Cached bill data from Congress.gov API + AI enrichment
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id TEXT UNIQUE NOT NULL,           -- e.g., 'hr-4521-119'
  bill_type TEXT,                         -- 'hr', 's', 'hjres', 'sjres'
  bill_number INT,
  congress INT,                           -- e.g., 119
  title TEXT NOT NULL,
  short_title TEXT,
  sponsor_name TEXT,
  sponsor_party TEXT,
  sponsor_state CHAR(2),
  summary_raw TEXT,                       -- CRS summary from Congress API
  summary_ai TEXT,                        -- AI plain-English summary (cached)
  impact_story TEXT,                      -- AI narrative "how your day changes" (cached)
  status TEXT,                            -- 'introduced','in_committee','passed_house','passed_senate','enacted','vetoed'
  status_detail TEXT,                     -- latest action description
  categories TEXT[],                      -- AI-tagged: ['education','tax','healthcare']
  introduced_date DATE,
  last_action_date DATE,
  congress_url TEXT,
  full_text TEXT,                         -- bill text for chat/RAG
  impact_personas JSONB DEFAULT '{}',     -- { "student": "...", "veteran": "..." } cached per persona
  state_relevance TEXT[],                 -- states particularly affected
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  ai_processed BOOLEAN DEFAULT false      -- has AI enrichment been done?
);

-- Bill chat conversations
CREATE TABLE bill_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bill_id TEXT REFERENCES bills(bill_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications triggered by bill-category matching
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bill_id TEXT REFERENCES bills(bill_id) ON DELETE CASCADE,
  type TEXT DEFAULT 'bill_alert',         -- 'bill_alert', 'status_change', 'rep_voted'
  title TEXT NOT NULL,
  message TEXT NOT NULL,                  -- AI one-line impact summary
  impact_level TEXT CHECK (impact_level IN ('high', 'medium', 'low')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's saved/bookmarked bills
CREATE TABLE saved_bills (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bill_id TEXT REFERENCES bills(bill_id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, bill_id)
);
```

### RepScore Tables

```sql
-- Cached representative data from ProPublica + Google Civic
CREATE TABLE representatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT UNIQUE NOT NULL,         -- ProPublica member ID
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  party TEXT,                             -- 'D', 'R', 'I'
  state_code CHAR(2),
  district TEXT,                          -- null for senators
  chamber TEXT CHECK (chamber IN ('senate', 'house')),
  title TEXT,                             -- 'Senator', 'Representative'
  in_office BOOLEAN DEFAULT true,
  photo_url TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  office_address TEXT,
  social_links JSONB DEFAULT '{}',        -- { "twitter": "...", "facebook": "...", "youtube": "..." }
  votes_with_party_pct NUMERIC,           -- from ProPublica
  missed_votes_pct NUMERIC,              -- attendance metric
  bills_sponsored INT,
  bills_cosponsored INT,
  next_election TEXT,                     -- e.g., '2026'
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual vote records for each rep on each bill
CREATE TABLE rep_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT REFERENCES representatives(member_id) ON DELETE CASCADE,
  bill_id TEXT,                           -- may or may not match bills table
  vote_id TEXT,                           -- ProPublica roll call ID
  vote_date DATE,
  vote_position TEXT,                     -- 'Yes', 'No', 'Not Voting', 'Present'
  vote_question TEXT,                     -- 'On Passage', 'On Motion to Table', etc.
  vote_description TEXT,                  -- short description of what was voted on
  result TEXT,                            -- 'Passed', 'Failed', 'Agreed to'
  UNIQUE(member_id, vote_id)
);

-- Campaign promises (curated for demo, TinyFish-scraped for stretch)
CREATE TABLE campaign_promises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT REFERENCES representatives(member_id) ON DELETE CASCADE,
  promise_text TEXT NOT NULL,             -- "Will fight to lower prescription drug costs"
  category TEXT,                          -- 'healthcare', 'economy', 'immigration'
  source_url TEXT,                        -- where the promise was made
  status TEXT CHECK (status IN ('kept', 'broken', 'in_progress', 'not_yet_addressed')),
  evidence TEXT,                          -- brief explanation of why kept/broken
  related_vote_ids TEXT[],                -- vote IDs that relate to this promise
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-computed Promise Alignment Score
-- Score = (kept * 1.0 + in_progress * 0.5) / total_promises * 100
CREATE TABLE rep_scores (
  member_id TEXT PRIMARY KEY REFERENCES representatives(member_id) ON DELETE CASCADE,
  promise_alignment_score NUMERIC,        -- 0-100
  promises_kept INT DEFAULT 0,
  promises_broken INT DEFAULT 0,
  promises_in_progress INT DEFAULT 0,
  promises_not_addressed INT DEFAULT 0,
  party_loyalty_score NUMERIC,            -- votes_with_party_pct repackaged
  attendance_score NUMERIC,               -- 100 - missed_votes_pct
  overall_accountability_score NUMERIC,   -- weighted composite
  computed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### VoteMap Tables

```sql
-- Candidates (current + upcoming election candidates)
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  party TEXT,
  state_code CHAR(2),
  district TEXT,
  office_sought TEXT,                     -- 'President', 'Senate', 'House'
  incumbent BOOLEAN DEFAULT false,
  photo_url TEXT,
  bio TEXT,
  website TEXT,
  campaign_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate positions on policy axes (for matching algorithm)
-- Each row = one candidate's stance on one policy issue
CREATE TABLE candidate_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  policy_axis TEXT NOT NULL,              -- 'immigration', 'healthcare', 'economy', 'climate', etc.
  position_score INT CHECK (position_score BETWEEN -2 AND 2),
                                          -- -2=strongly against, -1=against, 0=neutral, 1=for, 2=strongly for
  position_summary TEXT,                  -- "Supports path to citizenship for DACA recipients"
  source_url TEXT,
  UNIQUE(candidate_id, policy_axis)
);

-- Reputation analysis (AI-generated from multiple sources)
CREATE TABLE candidate_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  reputation_score NUMERIC,               -- 0-100 composite
  funding_transparency TEXT,              -- 'high', 'medium', 'low' (from OpenSecrets)
  top_donors JSONB DEFAULT '[]',          -- [{ "name": "...", "amount": 50000 }]
  total_raised NUMERIC,
  small_donor_pct NUMERIC,               -- % from small individual donations
  controversy_flags JSONB DEFAULT '[]',   -- AI-extracted: [{ "issue": "...", "source": "..." }]
  endorsements JSONB DEFAULT '[]',        -- [{ "org": "NRA", "rating": "A+" }]
  media_sentiment TEXT,                   -- 'positive', 'neutral', 'negative' (AI-analyzed)
  ai_summary TEXT,                        -- AI narrative reputation summary
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz results
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,                 -- { "immigration": 2, "healthcare": -1, ... }
  matches JSONB,                          -- [{ "candidate_id": "...", "name": "...", "score": 85 }]
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Routes (InsForge Edge Functions)

### Shared / Auth
```
POST   /auth/signup                              → Create account (InsForge auth)
POST   /auth/login                               → Login
POST   /auth/logout                              → Logout
GET    /api/user/profile                         → Get user + profiles + categories
POST   /api/user/onboarding                      → Save state + profiles + categories
PUT    /api/user/onboarding                      → Update preferences
```

### Map (Shared Hub)
```
GET    /api/map/states                           → All states with summary stats
                                                   Returns: [{ code, name, bill_count, rep_count, civic_score }]
GET    /api/map/states/:code                     → Single state detail
                                                   Returns: { reps[], recent_bills[], stats }
GET    /api/map/states/:code/cities              → Major cities in state (stretch)
GET    /api/map/search?q={zip_or_city}           → Resolve zip/city → state + district
                                                   Uses: Google Civic Info API
```

### BillBreaker Module
```
GET    /api/bills?state={code}&category={cat}&status={status}&page={n}&limit=20
                                                 → Paginated bill list with filters
GET    /api/bills/:bill_id                       → Full bill detail + AI summary
                                                   Returns: bill + summary_ai + status timeline
GET    /api/bills/:bill_id/impact?personas=student,veteran
                                                 → Personalized impact per persona
                                                   Returns: { persona: impact_text } for each
                                                   Caches in bills.impact_personas JSONB
GET    /api/bills/:bill_id/story                 → AI "Impact Story" narrative
                                                   "If this passes, here's how your Tuesday changes..."
POST   /api/bills/:bill_id/chat                  → Ask a question about this bill
                                                   Body: { message, history: [{role, content}] }
                                                   Returns: { response, sources: [section refs] }
POST   /api/bills/:bill_id/save                  → Bookmark bill (auth required)
DELETE /api/bills/:bill_id/save                  → Remove bookmark
GET    /api/bills/saved                          → User's saved bills

GET    /api/bills/:bill_id/reps-voted            → Cross-module: which reps voted on this bill
                                                   Returns: [{ rep, vote_position }]
```

### Notifications (BillBreaker sub-module)
```
GET    /api/notifications?page={n}&unread_only={bool}
                                                 → User's notifications, newest first
PUT    /api/notifications/:id/read               → Mark single as read
PUT    /api/notifications/read-all               → Mark all as read
GET    /api/notifications/preferences            → Category toggles + frequency
PUT    /api/notifications/preferences            → Update category toggles
                                                   Body: { categories: { education: true, tax: false } }
GET    /api/notifications/count                  → Unread count (for bell badge)
```

### RepScore Module
```
GET    /api/reps?state={code}&chamber={senate|house}
                                                 → List reps for state/chamber
GET    /api/reps/:member_id                      → Full rep profile + scores
                                                   Returns: rep + rep_scores + latest votes
GET    /api/reps/:member_id/votes?page={n}       → Paginated voting record
                                                   Returns: [{ bill, vote_position, date, result }]
GET    /api/reps/:member_id/promises             → Campaign promises + status
                                                   Returns: [{ promise, status, evidence }]
GET    /api/reps/:member_id/score                → Promise Alignment Score breakdown
                                                   Returns: { promise_alignment, party_loyalty,
                                                              attendance, overall, breakdown }
POST   /api/reps/:member_id/contact              → Generate AI pre-filled email
                                                   Body: { bill_id?, concern_text }
                                                   Returns: { subject, body, mailto_link }

GET    /api/reps/:member_id/bills                → Cross-module: bills this rep sponsored/voted on
```

### VoteMap Module
```
GET    /api/candidates?state={code}&office={pres|senate|house}
                                                 → List candidates with basic info
GET    /api/candidates/:id                       → Full candidate detail
GET    /api/candidates/:id/positions             → All policy positions on each axis
GET    /api/candidates/:id/reputation            → Reputation analysis
                                                   Returns: { score, funding, donors, controversies,
                                                              endorsements, media_sentiment, ai_summary }
GET    /api/candidates/compare?ids=1,2           → Side-by-side on all axes
                                                   Returns: { candidates[], axes[], diff_matrix }
POST   /api/quiz/submit                          → Submit quiz, get matches
                                                   Body: { answers: { immigration: 2, healthcare: -1 } }
                                                   Returns: { matches: [{ candidate, score, axis_breakdown }] }
GET    /api/quiz/questions                       → Get quiz questions + options
                                                   Returns: [{ axis, question, options: [-2..2] }]
```

### Cross-Module Integration Points
```
Bill → Rep:    /api/bills/:bill_id/reps-voted    → See which reps voted and how
Rep → Bill:    /api/reps/:member_id/bills        → See what bills this rep touched
Rep → VoteMap: A sitting rep who is a candidate links to their candidate profile
Map → All:     /api/map/states/:code             → Returns bills + reps + candidates for state
Notif → Bill:  Each notification links to the bill that triggered it
```

---

## Component Tree & Data Flow

```
App
├── Header
│   ├── Logo + "CitizenOS" branding
│   ├── NavTabs: [Map | BillBreaker | RepScore | VoteMap]
│   ├── SearchBar (zip/city → resolves state + district → map navigation)
│   ├── NotificationBell → NotificationDropdown
│   │   ├── Unread count badge
│   │   ├── Notification items (click → navigate to bill)
│   │   └── "Mark all read" + "Preferences" links
│   └── UserMenu → [Dashboard | Settings | Logout]
│
├── Routes
│   │
│   ├── / → MapView (DEFAULT LANDING PAGE)
│   │   ├── USAMap (react-simple-maps, full viewport)
│   │   │   ├── State geography (clickable, hover tooltip with state name + bill count)
│   │   │   ├── Color-coded by: bill activity | civic score | party control (toggle)
│   │   │   └── User's home state highlighted with border
│   │   ├── MapLegend (bottom-left, shows color scale)
│   │   ├── MapControls (top-right: color-mode toggle, reset zoom)
│   │   └── StatePanel (shadcn Sheet — slides from right on state click)
│   │       ├── State header: name, population, # of districts
│   │       ├── Tabs: [Bills | Representatives | Candidates | Stats]
│   │       ├── Tab: Bills → BillList → BillCard[] (top 10 active, "View all" link)
│   │       ├── Tab: Reps → RepList → RepCard[] (senators + house reps)
│   │       ├── Tab: Candidates → CandidateList (upcoming election candidates)
│   │       └── Tab: Stats → civic metrics (voter turnout, bills introduced, etc.)
│   │
│   ├── /bill/:id → BillDetailPage
│   │   ├── BillHeader: title, bill number, sponsor, status badge
│   │   ├── StatusTimeline: visual stepper (introduced → committee → ... → enacted)
│   │   ├── AISummary: plain English (card with "AI Generated" badge)
│   │   ├── PersonaSelector: toggle chips for user's profiles
│   │   │   └── ImpactPanel: changes dynamically when persona toggled
│   │   ├── ImpactStory: AI narrative "how your day changes" (collapsible)
│   │   ├── OriginalText: collapsible raw bill text
│   │   ├── RepsVoted: which reps voted on this + how (cross-module link)
│   │   ├── BillChat: conversational Q&A about this bill
│   │   │   ├── Message history (scrollable)
│   │   │   ├── Input + send button
│   │   │   └── Suggested questions: ["Does this affect my taxes?", ...]
│   │   └── ActionBar: [Save bill | Contact my rep | Share link]
│   │
│   ├── /reps → RepScoreDashboard (browsable without selecting state)
│   │   ├── StateFilter + ChamberFilter (senate/house)
│   │   ├── SortBy: [alignment score | party loyalty | attendance]
│   │   └── RepGrid → RepCard[]
│   │
│   ├── /rep/:member_id → RepDetailPage
│   │   ├── RepHeader: photo, name, party badge, state, district, tenure
│   │   ├── ScoreGauges (row of 3 circular gauges):
│   │   │   ├── Promise Alignment Score (0-100)
│   │   │   ├── Party Loyalty (%)
│   │   │   └── Attendance (%)
│   │   ├── PromiseTracker: list of campaign promises
│   │   │   ├── Each: promise text + status chip (kept ✓ | broken ✗ | in progress ◉ | TBD ?)
│   │   │   ├── Evidence collapsible per promise
│   │   │   └── Linked votes per promise
│   │   ├── VotingRecord: paginated table
│   │   │   ├── Columns: date, bill, question, position (Yes/No badge), result
│   │   │   ├── Filter by category
│   │   │   └── Click bill → navigate to /bill/:id (cross-module)
│   │   ├── BillsSponsored: bills this rep introduced
│   │   └── ContactRep: AI-generated email template
│   │       ├── Select concern topic (or link from a bill)
│   │       ├── Generated subject + body
│   │       └── "Open in email" button (mailto: link)
│   │
│   ├── /vote → VoteMapPage
│   │   ├── PolicyQuiz
│   │   │   ├── ProgressBar (step X of 10)
│   │   │   ├── QuizQuestion: statement + 5-point scale (strongly disagree → strongly agree)
│   │   │   ├── "Skip" option per question
│   │   │   └── PolicyAxes covered:
│   │   │       immigration, healthcare, economy/tax, education,
│   │   │       climate/energy, gun_policy, criminal_justice,
│   │   │       foreign_policy, social_issues, government_spending
│   │   │
│   │   └── QuizResults (after submit)
│   │       ├── MatchList: candidates ranked by alignment % (descending)
│   │       │   └── Each: photo, name, party, score %, mini bar chart per axis
│   │       ├── PolicyRadar: radar chart showing user vs top 3 candidates
│   │       ├── CandidateCompare: select 2 → side-by-side
│   │       │   ├── Position on each axis (visual scale -2 to +2)
│   │       │   ├── Reputation score comparison
│   │       │   └── Funding comparison
│   │       └── ReputationCard (per candidate):
│   │           ├── Reputation score (0-100)
│   │           ├── Funding: total raised, small donor %, top donors
│   │           ├── Endorsements list
│   │           ├── Controversy flags (if any)
│   │           └── AI reputation summary
│   │
│   ├── /dashboard → UserDashboard
│   │   ├── "Bills affecting you" feed (filtered by user categories)
│   │   ├── "Your representatives" cards with quick scores
│   │   ├── Recent notifications
│   │   ├── Saved bills
│   │   └── Quiz results history
│   │
│   ├── /settings → SettingsPage
│   │   ├── Profile info (name, state, zip)
│   │   ├── Persona profiles (add/remove)
│   │   ├── Category toggles (notification preferences per category)
│   │   └── Notification frequency (in-app always, email: instant/daily/off)
│   │
│   ├── /login → LoginForm
│   ├── /signup → SignupForm
│   └── /onboarding → OnboardingFlow (3-step wizard)
│       ├── Step 1: "Where do you live?" → state picker (map or dropdown) + zip
│       ├── Step 2: "Who are you?" → profile chips (multi-select)
│       └── Step 3: "What matters to you?" → category toggles + priority ranking
```

---

## Key Data Flows

### Flow 1: Map → State → Everything
```
USAMap.onClick(stateCode)
  → useMapStore.setSelectedState("TX")
  → StatePanel opens (Sheet)
  → Parallel fetches:
      → GET /api/bills?state=TX       → BillList in tab 1
      → GET /api/reps?state=TX        → RepList in tab 2
      → GET /api/candidates?state=TX  → CandidateList in tab 3
  → Each edge function:
      1. Check local DB cache (bills/representatives/candidates tables)
      2. If stale (>24h) or empty → fetch from external API → cache → return
      3. If fresh → return from cache
```

### Flow 2: BillBreaker — Bill Summary + Persona Impact
```
BillCard.onClick(billId)
  → navigate(/bill/:id)
  → GET /api/bills/:id
      → Edge function:
         1. Check bills table for bill_id
         2. If summary_ai is null → call LLM with bill text → save summary_ai
         3. Return bill + summary
  → PersonaSelector renders user's profiles (from useAuthStore)
  → On persona toggle → GET /api/bills/:id/impact?personas=student,veteran
      → Edge function:
         1. Check bills.impact_personas JSONB for cached persona
         2. If persona key missing → LLM call with bill text + persona context
         3. Save to impact_personas → return
  → UI swaps impact text instantly (cached hits are fast)
```

### Flow 3: BillBreaker — "Ask This Bill" Chat
```
BillChat: user types question
  → POST /api/bills/:id/chat { message, history }
  → Edge function:
      1. Load bill.full_text from bills table
      2. Build prompt:
         - System: "You are answering questions about {bill title}."
         - Context: bill full text (truncated to fit context window)
         - History: prior messages
         - User: new question
      3. LLM call → response
      4. INSERT INTO bill_chats (user msg + assistant msg)
      5. Return { response, sources: [cited sections] }
  → UI appends messages, shows source citations
```

### Flow 4: BillBreaker — Notification Pipeline
```
Trigger: when /api/bills is called and new bills are found (or scheduled edge function)
  1. For each new bill not yet in DB:
     a. INSERT into bills table
     b. LLM call: categorize bill → categories[] (e.g., ['education', 'tax'])
     c. UPDATE bills SET categories = [...], ai_processed = true
  2. Query: SELECT user_id FROM user_categories
            WHERE category = ANY(bill.categories) AND notify_enabled = true
  3. For each matched user:
     a. LLM call: generate one-line impact summary for this user's profile
     b. INSERT INTO notifications (user_id, bill_id, title, message, impact_level)
  4. Frontend: useNotifStore polls GET /api/notifications/count every 60s
     OR: InsForge realtime subscription on notifications table
  5. NotificationBell updates badge count
  6. Click notification → navigate to /bill/:id
```

### Flow 5: RepScore — Promise Alignment Calculation
```
When rep data is loaded (GET /api/reps/:member_id/score):
  Edge function:
  1. Check rep_scores table for member_id
  2. If not computed or stale:
     a. Load campaign_promises for this member
     b. Load rep_votes for this member
     c. For each promise:
        - AI matches promise text against voting record
        - Determines status: kept | broken | in_progress | not_yet_addressed
        - Stores evidence text
     d. Calculate scores:
        promise_alignment = (kept * 1.0 + in_progress * 0.5) / total * 100
        party_loyalty = votes_with_party_pct (from ProPublica)
        attendance = 100 - missed_votes_pct
        overall = (promise_alignment * 0.5) + (attendance * 0.3) + (party_loyalty * 0.2)
     e. UPSERT into rep_scores
  3. Return full score breakdown
```

### Flow 6: RepScore — Contact Your Rep
```
User clicks "Contact" on RepDetail (or from BillDetail action bar)
  → POST /api/reps/:member_id/contact { bill_id?, concern_text }
  → Edge function:
      1. Load rep info (name, title, state)
      2. If bill_id provided → load bill summary
      3. LLM generates email:
         - Subject line
         - Body: professional, cites specific bill, includes user's concern
         - Sign-off
      4. Return { subject, body, mailto_link }
  → UI shows preview → user can edit → "Open in email" opens mailto:
```

### Flow 7: VoteMap — Quiz + Matching
```
User navigates to /vote
  → GET /api/quiz/questions
      → Returns 10 questions, one per policy axis
      → Each question: statement + 5-point scale (-2 to +2)
  → User answers questions → submit
  → POST /api/quiz/submit { answers: { immigration: 2, healthcare: -1, ... } }
  → Edge function:
      1. Load all candidate_positions
      2. For each candidate:
         score = 100 - (Σ |user_answer - candidate_position| / (max_diff * n_axes)) * 100
         axis_breakdown = { axis: { user, candidate, diff } per axis }
      3. Sort by score descending
      4. INSERT INTO quiz_results
      5. Return { matches: [{ candidate, score, axis_breakdown }] }
  → UI shows:
      - Ranked list with % match
      - Radar chart (recharts) overlaying user vs top candidates
      - Click any candidate → expand to full comparison
```

### Flow 8: VoteMap — Reputation Analysis
```
GET /api/candidates/:id/reputation
  → Edge function:
      1. Check candidate_reputation table
      2. If empty or stale:
         a. TinyFish scrape OpenSecrets → funding data, donor list
         b. TinyFish scrape Ballotpedia → endorsements, controversies
         c. LLM analyzes scraped data → generates:
            - reputation_score (0-100)
            - media_sentiment
            - ai_summary narrative
         d. INSERT INTO candidate_reputation
      3. Return full reputation profile
  → UI shows ReputationCard with funding chart, endorsements, flags
```

### Cross-Module Navigation Flows
```
Bill → Rep:  User reading a bill → sees "Reps who voted" section
             → clicks a rep → navigates to /rep/:member_id

Rep → Bill:  User viewing rep → sees voting record
             → clicks a bill in their vote list → navigates to /bill/:id

Rep → Vote:  If rep is also a current candidate → "See candidate profile" link
             → navigates to candidate detail in VoteMap

Map → All:   State panel has tabs for Bills, Reps, Candidates
             → clicking any item navigates to its detail page

Notif → Bill: Notification in dropdown → click → /bill/:id

Dashboard:   Aggregates all modules for the user's state + profile
```

---

## AI Prompt Architecture

### BillBreaker Prompts

**Bill Summary**
```
System: You are a legislative analyst writing for everyday citizens.
Summarize this bill in plain English. No legal jargon. No acronyms without explanation.

Structure your response as:
## What This Bill Does
(2-3 sentences)

## Who It Affects
(list the groups)

## Key Provisions
(3-5 bullet points, each 1-2 sentences)

## Current Status
(one sentence: where it is in the legislative process)

Bill text:
{bill_full_text}
```

**Persona Impact**
```
System: You explain how legislation impacts specific people.
Be concrete. Use real numbers and scenarios when possible.
If the bill doesn't directly affect a persona, say so honestly.

For each persona, write exactly ONE paragraph starting with the persona name in bold.
Include: what changes for them, estimated financial impact if applicable,
and what action they might need to take.

Bill: {bill_title}
Summary: {ai_summary}
Full text: {bill_full_text}
User's state: {state}
Personas to analyze: {personas}
```

**Impact Story (Narrative)**
```
System: You write compelling 150-word narratives about how legislation affects daily life.
Write in second person ("you"). Paint a picture of a specific day.
Make it feel personal and real, not abstract.

Format: Start with "It's a [day] morning in {state}..."
Then walk through how this bill changes the reader's routine, finances, or rights.
End with one concrete action they can take.

Bill: {bill_title}
Summary: {ai_summary}
User profile: {persona}
User state: {state}
```

**Bill Categorization**
```
System: Categorize this bill into one or more policy categories.
Return ONLY a JSON array of matching categories from this list:
["immigration", "healthcare", "education", "economy", "tax",
 "climate", "gun_policy", "criminal_justice", "foreign_policy",
 "social_issues", "government_spending", "veterans", "housing",
 "technology", "labor", "agriculture"]

Bill title: {title}
Bill summary: {summary}
```

**Bill Chat**
```
System: You answer questions about a specific piece of legislation.
Rules:
- Only answer based on the bill text provided below
- If the answer is not in the bill, say "This bill doesn't address that topic"
- Cite specific sections (e.g., "Section 3(b) states...")
- Keep answers under 200 words unless the user asks for detail
- If asked about political opinions, remain neutral and factual

=== BILL: {bill_title} ===
{bill_full_text}
===

Conversation:
{history}

User: {message}
```

### RepScore Prompts

**Promise-Vote Matching**
```
System: You are a nonpartisan political analyst.
Given a campaign promise and a list of votes, determine if the representative
kept, broke, or is still working on this promise.

Return JSON:
{
  "status": "kept" | "broken" | "in_progress" | "not_yet_addressed",
  "evidence": "Brief explanation (1-2 sentences) citing specific votes",
  "related_vote_ids": ["vote_id_1", "vote_id_2"]
}

Promise: "{promise_text}"
Category: {category}

Recent votes:
{votes_json}
```

**Contact Email Generation**
```
System: Draft a professional, respectful letter to a US representative.
Tone: concerned citizen, not aggressive. Include specific bill references.
Length: 150-200 words.

Structure:
- Subject line
- Greeting (Dear {title} {last_name})
- State your concern (reference the bill by name and number)
- Explain personal impact (based on user's profile)
- Specific ask (vote yes/no, co-sponsor, etc.)
- Thank them for their service
- Sign-off

Representative: {rep_name}, {title}, {party}-{state}
Bill: {bill_title} ({bill_id})
User concern: {concern_text}
User profile: {persona}
User state: {state}
```

### VoteMap Prompts

**Reputation Analysis**
```
System: You are a nonpartisan political analyst generating a reputation report.
Analyze the following data about a candidate and produce a balanced assessment.
Do NOT take sides. Present facts and let the reader decide.

Return JSON:
{
  "reputation_score": 0-100,
  "media_sentiment": "positive" | "neutral" | "negative" | "mixed",
  "ai_summary": "3-4 sentence balanced summary",
  "key_strengths": ["...", "..."],
  "key_concerns": ["...", "..."]
}

Candidate: {name} ({party}-{state})
Funding data: {funding_json}
Endorsements: {endorsements_json}
Controversies: {controversies_json}
Voting record (if incumbent): {voting_summary}
```

---

## 36-Hour Build Timeline — Feature-Based Ownership

### Team Roles (Each person owns a module END-TO-END: DB + API + UI)

| Person | Module | Owns (full stack) | External APIs |
|---|---|---|---|
| **Person A** | **BillBreaker** + Map Hub + Shared Foundation | Bills, chat, notifications, persona impact, map | Congress.gov API |
| **Person B** | **RepScore** | Rep profiles, voting records, promise tracking, scores, contact rep | ProPublica API, Google Civic |
| **Person C** | **VoteMap** | Candidates, quiz, matching, reputation, comparison | TinyFish/AgentQL, OpenSecrets |

### Why feature-based?
- Each person can work **fully in parallel** with zero blockers after Sprint 0
- Each person ships a **working vertical slice** — if one module is behind, the others still work
- Cross-module links (bill→rep, rep→candidate) are simple API calls added at integration time

---

### Sprint 0: Shared Foundation (Hours 0–4) — ALL THREE TOGETHER

One person drives, other two pair. Get the skeleton up so everyone can branch off.

```
- [ ] Vite + React + Tailwind + shadcn/ui init
- [ ] Install: react-simple-maps, zustand, react-router-dom, recharts, lucide-react
- [ ] InsForge MCP: provision project (DB, auth, storage)
- [ ] Create ALL database tables (run SQL from schema above)
- [ ] Set up project structure (folders, routing in App.tsx)
- [ ] Build shared components:
      - Header with NavTabs, placeholder NotificationBell, UserMenu
      - Layout wrapper
      - shadcn/ui components needed by all: Card, Button, Badge, Sheet, Tabs, Input, Avatar
- [ ] Build auth flow (InsForge auth):
      - LoginForm, SignupForm, OnboardingFlow (state + profiles + categories)
      - useAuthStore (Zustand)
- [ ] Build USAMap component:
      - react-simple-maps with TopoJSON
      - Clickable states, hover tooltips, color fill
      - useMapStore (selectedState, colorMode)
      - StatePanel (Sheet) with tab skeleton: [Bills | Reps | Candidates]
- [ ] Set up api/ layer: insforge.ts client, shared fetch helpers
- [ ] Get ALL API keys: Congress.gov, ProPublica, Google Civic, TinyFish, OpenSecrets
- [ ] Push to shared repo, create feature branches
```

After Sprint 0: everyone branches off to their module.

---

### Person A: BillBreaker Module (Hours 4–28)

**Phase 1 — Data Pipeline (Hours 4–10)**
```
- [ ] Edge function: /api/bills — fetch from Congress.gov API
      - Fetch bills by congress session, paginated
      - Parse response → INSERT INTO bills table
      - Support filters: ?state, ?category, ?status, ?page
- [ ] Edge function: /api/bills/:bill_id — single bill detail
      - If not in DB → fetch from Congress.gov → cache
      - Return full bill record
- [ ] Edge function: AI bill summary
      - On bill fetch: if ai_processed = false → LLM call → update summary_ai
      - Batch process: on first load of a state, process top 20 bills
- [ ] Edge function: AI bill categorization
      - LLM tags bill → categories[] → UPDATE bills
- [ ] Edge function: /api/bills/:bill_id/impact?personas=...
      - Check impact_personas JSONB for cached result
      - If missing → LLM call → cache → return
```

**Phase 2 — UI (Hours 10–18)**
```
- [ ] BillList + BillCard (in StatePanel Bills tab)
      - Shows: title, status badge, category chips, date, sponsor
      - Click → navigate to /bill/:id
- [ ] BillDetailPage
      - BillHeader (title, number, sponsor, status badge)
      - StatusTimeline (shadcn stepper or custom)
      - AISummary card (with "AI Generated" indicator + "View original" toggle)
      - PersonaSelector (chip toggles for user's profiles)
      - ImpactPanel (swaps content on persona toggle)
      - ImpactStory (collapsible narrative section)
      - RepsVoted section (placeholder — Person B provides API)
      - ActionBar: Save, Contact Rep, Share
- [ ] BillChat component
      - Message list (scroll area)
      - Input + send button
      - Suggested questions (3 chips above input)
      - Loading state while LLM responds
      - Edge function: /api/bills/:bill_id/chat
- [ ] Map integration:
      - Color states by bill activity count
      - StatePanel Bills tab wired to real data
```

**Phase 3 — Notifications (Hours 18–24)**
```
- [ ] Edge function: notification pipeline
      - When new bills are cached → match categories against user_categories
      - Generate notification per matched user
      - INSERT INTO notifications
- [ ] Edge function: /api/notifications (list, count, mark read, preferences)
- [ ] NotificationBell component
      - Badge with unread count (polls /count every 60s)
      - Dropdown with notification list
      - Click notification → navigate to /bill/:id
- [ ] NotifPreferences page
      - Toggle per category
      - Wired to /api/notifications/preferences
- [ ] Saved bills: /api/bills/:id/save + saved bills list on dashboard
```

**Phase 4 — Polish (Hours 24–28)**
```
- [ ] Bill search/filter bar (by category, status, keyword)
- [ ] Skeleton loading states on BillList, BillDetail
- [ ] Empty states ("No bills found for this state")
- [ ] Error handling (API failures, LLM timeouts)
- [ ] Cross-module link: /api/bills/:bill_id/reps-voted
      (query rep_votes table — may need Person B's data)
```

---

### Person B: RepScore Module (Hours 4–28)

**Phase 1 — Data Pipeline (Hours 4–10)**
```
- [ ] Edge function: /api/reps?state=XX&chamber=senate|house
      - Fetch from ProPublica Congress API: /members/{chamber}/{state}/current
      - Parse → INSERT INTO representatives table
      - Include: votes_with_party_pct, missed_votes_pct, bills_sponsored
- [ ] Edge function: /api/reps/:member_id
      - Fetch detailed member info if not cached
- [ ] Edge function: /api/reps/:member_id/votes
      - Fetch from ProPublica: /members/{id}/votes
      - Parse → INSERT INTO rep_votes table
      - Support pagination
- [ ] Seed campaign_promises table
      - Curate 5-8 prominent reps with 3-5 promises each
      - Research: campaign websites, debate transcripts, news articles
      - Include source URLs for credibility
- [ ] Edge function: /api/reps/:member_id/score
      - AI promise-vote matching (LLM analyzes promises against votes)
      - Calculate scores: promise_alignment, party_loyalty, attendance, overall
      - UPSERT into rep_scores table
```

**Phase 2 — UI (Hours 10–18)**
```
- [ ] RepList + RepCard (in StatePanel Reps tab)
      - Shows: photo (avatar), name, party badge (D blue/R red/I purple),
        chamber, district, overall score gauge
      - Click → navigate to /rep/:member_id
- [ ] RepDetailPage
      - RepHeader: large photo, name, party, state, district, tenure, in_office badge
      - ScoreGauges: 3 circular gauges in a row (recharts RadialBarChart)
        - Promise Alignment (0-100, color: green/yellow/red)
        - Party Loyalty (%)
        - Attendance (%)
      - PromiseTracker:
        - List of campaign promises
        - Each: promise text + status chip (kept=green, broken=red, in_progress=yellow, TBD=gray)
        - Expand → evidence text + linked votes
      - VotingRecord:
        - Paginated table (shadcn Table)
        - Columns: Date, Bill, Question, Position (Yes/No badge), Result
        - Filter by category dropdown
        - Click bill → /bill/:id (cross-module)
      - BillsSponsored: compact list of bills this rep introduced
- [ ] RepScoreDashboard (/reps route)
      - Browse all reps without needing map
      - State filter + chamber filter + sort by score
      - Grid of RepCards
```

**Phase 3 — Contact Rep + Cross-Module (Hours 18–24)**
```
- [ ] ContactRep component
      - Edge function: /api/reps/:member_id/contact
      - Input: optional bill_id, concern text
      - LLM generates professional email
      - Preview: editable subject + body
      - "Open in email client" button (mailto: link)
      - "Copy to clipboard" button
- [ ] Edge function: /api/reps/:member_id/bills
      - Query rep_votes JOIN bills → bills this rep voted on
      - Used by BillBreaker's "Reps who voted" section
- [ ] Map integration:
      - StatePanel Reps tab wired to real data
      - State color mode: "Party control" option on map
- [ ] Dashboard integration:
      - "Your representatives" section with quick score cards
```

**Phase 4 — Polish (Hours 24–28)**
```
- [ ] Score explanation tooltip (how is this calculated?)
- [ ] Promise status distribution chart (pie/donut chart with recharts)
- [ ] Voting record: highlight votes that contradict promises (visual flag)
- [ ] Loading skeletons for RepCard, RepDetail
- [ ] Empty state: "No voting record found"
- [ ] Rep comparison (stretch): side-by-side two reps from same state
```

---

### Person C: VoteMap Module (Hours 4–28)

**Phase 1 — Data + Quiz Engine (Hours 4–10)**
```
- [ ] Seed candidates table
      - Curate 10-15 candidates (mix of presidential, senate, house)
      - Include: name, party, state, photo, bio, website
- [ ] Seed candidate_positions table
      - For each candidate: position on 10 policy axes (-2 to +2)
      - Policy axes: immigration, healthcare, economy, education, climate,
        gun_policy, criminal_justice, foreign_policy, social_issues, gov_spending
      - Include position_summary text per axis
      - Source: campaign websites, Ballotpedia, news
- [ ] Edge function: /api/quiz/questions
      - Return 10 questions (one per axis)
      - Each: { axis, question_text, options: [{ value: -2, label: "Strongly Disagree" }, ...] }
- [ ] Edge function: /api/quiz/submit
      - Input: { answers: { immigration: 2, healthcare: -1, ... } }
      - Matching algorithm:
        For each candidate:
          per_axis_diff = |user_score - candidate_score|
          total_diff = sum of all per_axis_diff
          max_possible_diff = 4 * num_axes  (range is -2 to +2, max diff = 4)
          match_pct = (1 - total_diff / max_possible_diff) * 100
      - Return sorted matches with per-axis breakdown
      - Save to quiz_results table
```

**Phase 2 — Reputation Engine (Hours 10–16)**
```
- [ ] Seed candidate_reputation for curated candidates
      - TinyFish/AgentQL: scrape OpenSecrets for funding data
        - Total raised, small donor %, top donors
      - TinyFish/AgentQL: scrape Ballotpedia for endorsements, controversies
      - LLM: analyze scraped data → reputation_score, media_sentiment, ai_summary
      - INSERT INTO candidate_reputation
- [ ] Edge function: /api/candidates/:id/reputation
      - Return full reputation profile
- [ ] Edge function: /api/candidates/:id/positions
      - Return all positions with summaries
- [ ] Edge function: /api/candidates/compare?ids=1,2
      - Return both candidates' positions + reputation side-by-side
      - Include diff_matrix: per-axis comparison
```

**Phase 3 — UI (Hours 16–24)**
```
- [ ] PolicyQuiz component
      - Progress bar (step X of 10)
      - Question card with 5-point slider or button group
      - Navigation: Back / Skip / Next
      - Submit button on last question
- [ ] QuizResults component
      - MatchList: ranked candidates with % score bar
      - Each match card: photo, name, party, score %, mini bar per axis
      - Click → expand to full candidate detail
- [ ] PolicyRadar: recharts RadarChart
      - Overlay: user answers (blue) vs top 3 candidates (distinct colors)
      - Interactive: hover shows exact values
- [ ] CandidateCompare component
      - Side-by-side layout (2 columns)
      - Per axis: visual scale showing both positions
      - Reputation scores compared
      - Funding compared (bar chart)
- [ ] ReputationCard component
      - Reputation score gauge
      - Funding breakdown: total raised, small donor %, top 5 donors
      - Endorsements list with org logos/names
      - Controversy flags (if any, shown as warning cards)
      - AI summary paragraph
- [ ] CandidateList in StatePanel Candidates tab
      - Filter by office sought
      - Click → full candidate detail
```

**Phase 4 — Polish (Hours 24–28)**
```
- [ ] Quiz: "retake quiz" button, "share results" button
- [ ] Candidate detail page (/candidate/:id) with all info unified
- [ ] Policy axis explainer tooltips ("What does 'immigration' cover?")
- [ ] Map integration:
      - StatePanel Candidates tab wired to real data
- [ ] Dashboard integration:
      - "Your latest quiz results" section
- [ ] Loading skeletons, empty states
- [ ] Link incumbent candidates to their RepScore profile (cross-module)
```

---

### Integration Sprint (Hours 28–32) — ALL THREE

```
- [ ] Cross-module navigation:
      Bill → "Reps who voted" links to /rep/:id     (A needs B's API)
      Rep → voting record bills link to /bill/:id    (B needs A's data)
      Rep → "candidate profile" links to /candidate  (B needs C's data)
      Map StatePanel: all 3 tabs working with real data
- [ ] Dashboard page:
      - Combine data from all 3 modules for logged-in user
      - "Bills affecting you" (A's data)
      - "Your reps" with scores (B's data)
      - "Quiz results" (C's data)
- [ ] End-to-end smoke test:
      Signup → onboarding → map → click state → bill → chat → rep → contact → quiz
- [ ] Bug fixes, edge cases, error states
- [ ] Deploy via InsForge
```

---

### Data Seeding Strategy

For the demo to work smoothly, seed real-ish data before presenting:

```
1. Bills: Fetch 50-100 active bills from Congress.gov API (real data)
   → Run AI enrichment (summary, categories) as a batch job
   → Pre-compute impact_personas for 3 key personas

2. Reps: Fetch all current members from ProPublica (real data)
   → Fetch voting records for 5-8 featured reps
   → Manually curate campaign promises for those 5-8 reps
   → Pre-compute rep_scores

3. Candidates: Curate 10-15 candidates manually
   → Fill candidate_positions (10 axes each)
   → Run TinyFish to scrape reputation data
   → Pre-compute reputation analysis

4. Demo user: Create a test user account
   → State: Texas, Profiles: [student, veteran]
   → Categories: [education, healthcare, veterans]
   → Pre-populate notifications (3-5 bill alerts)
   → Pre-populate saved bills (2-3)
   → Pre-populate quiz results
```

---

## Key Design Decisions

1. **react-simple-maps over Leaflet**: State-level clicking, not street maps. SVG is lighter, faster, styleable with Tailwind.

2. **Zustand over Redux/Context**: Minimal boilerplate, multiple independent stores, no provider wrapping.

3. **Edge Functions over traditional API server**: InsForge deploys instantly. No server management. Each function isolated.

4. **Cache-first data strategy**: Bills and reps don't change by the minute. Fetch → cache in Postgres → serve from cache. Refresh every 24h.

5. **AI summaries pre-computed + cached**: Generate once, store in `bills.summary_ai`. Only chat is real-time LLM.

6. **Persona impact as JSONB**: All persona impacts in one column. Compute lazily on first request, then cache forever.

7. **Feature-based team split over layer-based**: Each person owns a full vertical slice (DB + API + UI). Eliminates cross-team blocking. Modules integrate via API calls at the end.

8. **Promise Alignment Score formula**: `(kept * 1.0 + in_progress * 0.5) / total * 100`. Simple, explainable, defensible to judges.

9. **VoteMap matching uses L1 distance**: `match% = (1 - Σ|user - candidate| / (4 * n_axes)) * 100`. Simple, transparent, no black-box ML.

10. **Reputation analysis combines scraped + AI**: TinyFish scrapes OpenSecrets/Ballotpedia for facts, LLM synthesizes into a balanced narrative. Keeps it grounded in real data.

11. **recharts for all visualizations**: Lightweight, React-native, supports radar charts (policy axes), radial bars (score gauges), and bar charts (funding comparison). One library for everything.

12. **Bias mitigation strategy**: Every AI summary shows "AI Generated" badge + toggle to view original text. Reputation analysis cites sources. Category tagging is transparent. This is important for governance track judges.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Congress.gov API rate limits | Bills don't load | Cache aggressively, seed data before demo |
| ProPublica API key delay | No rep data | Apply immediately, have backup curated data |
| LLM hallucination in bill summaries | Credibility hit | Always show original text, cite sections |
| TinyFish scraping fails | No reputation data | Pre-scrape and seed, have manual fallback |
| Three modules don't integrate in time | Disjointed demo | Each module works standalone, integration is additive |
| Scope creep | Nothing finished | Sprint 0 locks scope, each person has clear boundaries |
