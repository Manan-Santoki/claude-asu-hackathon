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

### Team Roles

| Person | Role | Owns |
|---|---|---|
| **Person A** | **Sprint 0 Lead + BillBreaker** | Full frontend foundation (project init, map, auth UI, routing, shared components, InsForge backend setup) THEN BillBreaker module |
| **Person B** | **RepScore** | During Sprint 0: curate campaign promises data + get API keys. THEN RepScore module end-to-end |
| **Person C** | **VoteMap** | During Sprint 0: curate candidate data + policy positions. THEN VoteMap module end-to-end |

### How to use this plan with Claude Code

Each person opens Claude Code in the `claude-asu-hackathon` repo on the `v2-architecture` branch and says:

- Person A: **"I am Person A. Execute Sprint 0 tasks first, then Person A BillBreaker tasks."**
- Person B: **"I am Person B. Execute Person B tasks."** (starts with data curation while Sprint 0 runs, then RepScore after Sprint 0 is merged)
- Person C: **"I am Person C. Execute Person C tasks."** (starts with data curation while Sprint 0 runs, then VoteMap after Sprint 0 is merged)

Each person's section below is **fully self-contained** — it lists every file to create/edit, every edge function to deploy, every component to build, and which API endpoints to wire up.

---

## SPRINT 0 — Person A: Full Frontend + Backend Foundation

> **Goal:** Set up the entire project so all 3 people can work on their modules independently after this.
> **Time:** Hours 0–4
> **Files to create/edit:** Everything in `citizenos/src/components/layout/`, `citizenos/src/components/auth/`, `citizenos/src/components/map/`, `citizenos/src/stores/useAuthStore.ts`, `citizenos/src/stores/useMapStore.ts`, `citizenos/src/api/insforge.ts`, `citizenos/src/api/auth.ts`, `citizenos/src/api/map.ts`, `citizenos/src/lib/`, `citizenos/src/main.tsx`, `citizenos/src/App.tsx`, `citizenos/src/styles/globals.css`, and all config files.

### S0-1: Project Initialization
```
- [ ] Initialize Vite + React + TypeScript project inside citizenos/
      Command: npm create vite@latest . -- --template react-ts
- [ ] Install Tailwind CSS v3 + postcss + autoprefixer
- [ ] Initialize shadcn/ui: npx shadcn-ui@latest init
- [ ] Add shadcn components:
      npx shadcn-ui@latest add button card input badge tabs sheet avatar
      npx shadcn-ui@latest add select checkbox scroll-area toast separator
- [ ] Install dependencies:
      npm install react-simple-maps zustand react-router-dom recharts lucide-react
      npm install -D @types/react-simple-maps
- [ ] Set up citizenos/src/styles/globals.css with Tailwind directives
- [ ] Set up citizenos/.env with placeholder API keys (copy from .env.example)
- [ ] Verify: npm run dev shows a blank page without errors
```

### S0-2: InsForge Backend Setup (via MCP)
```
- [ ] Connect InsForge MCP to Claude Code
- [ ] Provision new InsForge project (DB + auth + storage)
- [ ] Create ALL database tables using SQL from the "Database Schema" section above:
      Shared: users, user_profiles, user_categories
      BillBreaker: bills, bill_chats, notifications, saved_bills
      RepScore: representatives, rep_votes, campaign_promises, rep_scores
      VoteMap: candidates, candidate_positions, candidate_reputation, quiz_results
- [ ] Set up InsForge auth (email + password)
- [ ] Save InsForge API base URL and API key to .env
- [ ] Test: can create a user via InsForge auth
```

### S0-3: Routing + Layout Shell
```
- [ ] citizenos/src/main.tsx — React entry with BrowserRouter
- [ ] citizenos/src/App.tsx — Route definitions:
      /              → MapView (default landing)
      /bill/:id      → BillDetailPage
      /reps          → RepScoreDashboard
      /rep/:memberId → RepDetailPage
      /vote          → VoteMapPage
      /dashboard     → Dashboard
      /settings      → SettingsPage
      /login         → LoginForm
      /signup        → SignupForm
      /onboarding    → OnboardingFlow
- [ ] citizenos/src/components/layout/PageWrapper.tsx
      — Common page wrapper with max-width, padding
- [ ] citizenos/src/components/layout/Header.tsx
      — Logo "CitizenOS"
      — NavTabs: [Map | BillBreaker | RepScore | VoteMap] using react-router NavLink
      — SearchBar placeholder (zip/city input)
      — NotificationBell placeholder (bell icon + badge, wired later by Person A)
      — UserMenu: avatar dropdown → [Dashboard | Settings | Logout]
- [ ] Verify: all routes render placeholder pages, header nav works
```

### S0-4: Interactive USA Map
```
- [ ] Download TopoJSON: citizenos/public/us-states-topo.json
      Source: https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json
- [ ] citizenos/src/components/map/USAMap.tsx
      — react-simple-maps ComposableMap + Geographies + Geography
      — Each state: clickable, hover effect (opacity/color change)
      — Hover tooltip: state name + "X bills active"
      — Click: calls useMapStore.setSelectedState(stateCode)
      — Color fill: default gray, hovered lighter, user's home state highlighted
- [ ] citizenos/src/components/map/StatePanel.tsx
      — shadcn Sheet component, slides from right when selectedState is set
      — Header: state name, close button
      — Tabs: [Bills | Representatives | Candidates | Stats]
      — Each tab: placeholder text "Loading {module}..."
      — These placeholders get replaced by Person A/B/C when they build their modules
- [ ] citizenos/src/components/map/MapLegend.tsx
      — Bottom-left overlay showing color scale meaning
- [ ] citizenos/src/components/map/MapControls.tsx
      — Top-right overlay: color mode dropdown (bill activity | party control | civic score)
- [ ] citizenos/src/stores/useMapStore.ts
      — State: selectedState, colorMode, hoveredState
      — Actions: setSelectedState, setColorMode, clearSelection
- [ ] citizenos/src/api/map.ts
      — getStateStats() → placeholder, returns mock state data for now
- [ ] Verify: map renders, click state opens panel, tabs visible
```

### S0-5: Auth UI + Onboarding
```
- [ ] citizenos/src/api/insforge.ts
      — InsForge client: base URL from env, auth token management
      — Helper: insforgeGet(), insforgePost() with auth headers
- [ ] citizenos/src/api/auth.ts
      — signup(email, password, name) → InsForge auth
      — login(email, password) → InsForge auth → returns token
      — logout() → clear token
      — getProfile() → GET user + profiles + categories
      — saveOnboarding(state, profiles, categories) → POST to user tables
- [ ] citizenos/src/stores/useAuthStore.ts
      — State: user, profiles[], categories[], isAuthenticated, isLoading
      — Actions: login, signup, logout, setProfiles, setCategories
      — Persist auth token to localStorage
- [ ] citizenos/src/components/auth/LoginForm.tsx
      — Email + password inputs, submit button
      — On success → redirect to / (map) or /onboarding if first login
- [ ] citizenos/src/components/auth/SignupForm.tsx
      — Name + email + password inputs, submit button
      — On success → redirect to /onboarding
- [ ] citizenos/src/components/auth/OnboardingFlow.tsx
      — 3-step wizard using shadcn Tabs or custom stepper:
      — Step 1: "Where do you live?" → state dropdown (from states.ts) + zip input
      — Step 2: "Who are you?" → profile chips multi-select (from personas.ts)
        Options: Student, Veteran, Visa Holder, Small Business Owner, Senior, Parent, Healthcare Worker, Gig Worker
      — Step 3: "What matters to you?" → category toggles (from categories.ts)
        Options: Immigration, Healthcare, Education, Economy, Tax, Climate, Gun Policy, Criminal Justice, etc.
      — Submit → saveOnboarding() → redirect to /
- [ ] Verify: can signup, login, complete onboarding, see data in InsForge DB
```

### S0-6: Shared Libraries
```
- [ ] citizenos/src/lib/utils.ts — cn() function for shadcn class merging
- [ ] citizenos/src/lib/personas.ts — export PERSONAS array:
      [{ id: 'student', label: 'Student', icon: 'GraduationCap' },
       { id: 'veteran', label: 'Veteran', icon: 'Shield' },
       { id: 'visa_holder', label: 'Visa Holder', icon: 'Globe' },
       { id: 'small_business', label: 'Small Business Owner', icon: 'Store' },
       { id: 'senior', label: 'Senior Citizen', icon: 'Heart' },
       { id: 'parent', label: 'Parent', icon: 'Users' },
       { id: 'healthcare_worker', label: 'Healthcare Worker', icon: 'Stethoscope' },
       { id: 'gig_worker', label: 'Gig Worker', icon: 'Briefcase' }]
- [ ] citizenos/src/lib/categories.ts — export CATEGORIES array:
      [{ id: 'immigration', label: 'Immigration' },
       { id: 'healthcare', label: 'Healthcare' },
       { id: 'education', label: 'Education' },
       { id: 'economy', label: 'Economy' },
       { id: 'tax', label: 'Tax' },
       { id: 'climate', label: 'Climate & Energy' },
       { id: 'gun_policy', label: 'Gun Policy' },
       { id: 'criminal_justice', label: 'Criminal Justice' },
       { id: 'foreign_policy', label: 'Foreign Policy' },
       { id: 'social_issues', label: 'Social Issues' },
       { id: 'government_spending', label: 'Government Spending' },
       { id: 'veterans', label: 'Veterans' },
       { id: 'housing', label: 'Housing' },
       { id: 'technology', label: 'Technology' },
       { id: 'labor', label: 'Labor' }]
- [ ] citizenos/src/lib/states.ts — export US_STATES array:
      [{ code: 'AL', name: 'Alabama', fips: '01' }, ... all 50 states + DC]
- [ ] citizenos/src/lib/policyAxes.ts — export POLICY_AXES array:
      [{ id: 'immigration', label: 'Immigration', question: 'The government should provide a path to citizenship for undocumented immigrants' },
       ... 10 total axes with questions for VoteMap quiz]
```

### Sprint 0 Completion Checklist
```
After Sprint 0, the following must work:
✓ npm run dev loads the app
✓ Map renders with all 50 states clickable
✓ Click state → panel slides open with tabs
✓ Header nav links work (all routes render)
✓ Signup → login → onboarding flow works end-to-end
✓ User data persists in InsForge DB
✓ Auth token persists across page refresh
✓ All shared lib files export correct data
✓ InsForge has all 13 DB tables created
✓ .env has InsForge API URL and key

Person A: commit + push, then notify Person B and C to pull.
```

---

## WHILE SPRINT 0 RUNS — Person B: Data Curation

> **Goal:** Prepare all data that Person B's module needs so coding can start immediately after Sprint 0.
> **Time:** Hours 0–4 (parallel with Sprint 0)
> **This is research/manual work, not coding.**

```
- [ ] Get ProPublica Congress API key: https://www.propublica.org/datastore/api/propublica-congress-api
      Save to .env as PROPUBLICA_API_KEY
- [ ] Get Google Civic Information API key: https://console.cloud.google.com/
      Save to .env as GOOGLE_CIVIC_API_KEY
- [ ] Test ProPublica API: fetch members for one state, verify response format
- [ ] Curate campaign promises for 5-8 prominent reps:
      Pick 3 senators + 3-5 house reps from different states (mix of parties)
      For each rep, find 3-5 specific campaign promises:
        - Source: campaign websites, debate transcripts, news articles, social media
        - Each promise needs: promise_text, category, source_url
        - Example: "I will fight to cap insulin prices at $35/month" (healthcare)
      Write to citizenos/seed/seed-promises.json in this format:
      [{ "member_id": "S001217", "promises": [
        { "promise_text": "...", "category": "healthcare", "source_url": "...", "status": "kept" },
        ...
      ]}]
- [ ] For each curated promise, research if it was kept/broken:
      Check voting record on congress.gov
      Note the evidence (which vote, what bill)
- [ ] Document the member_ids (ProPublica IDs) of curated reps
```

---

## WHILE SPRINT 0 RUNS — Person C: Data Curation

> **Goal:** Prepare all data that Person C's module needs so coding can start immediately after Sprint 0.
> **Time:** Hours 0–4 (parallel with Sprint 0)
> **This is research/manual work, not coding.**

```
- [ ] Get TinyFish API key: https://www.tinyfish.ai/ (hackathon credits)
      Save to .env as TINYFISH_API_KEY
- [ ] Get OpenSecrets API key: https://www.opensecrets.org/api
      Save to .env as OPENSECRETS_API_KEY
- [ ] Get Congress.gov API key: https://api.congress.gov/sign-up/
      Save to .env as CONGRESS_GOV_API_KEY
- [ ] Curate 10-15 candidates for demo:
      Mix: 3-4 presidential, 4-5 senate, 4-5 house candidates
      For each: name, party, state, office_sought, bio (2-3 sentences), website, photo_url
      Write to citizenos/seed/seed-candidates.json
- [ ] For each candidate, research positions on 10 policy axes:
      Score each -2 to +2 with a position_summary sentence
      Policy axes: immigration, healthcare, economy, education, climate,
                   gun_policy, criminal_justice, foreign_policy, social_issues, gov_spending
      Source: campaign websites, Ballotpedia, VoteSmart, news
      Write to citizenos/seed/seed-positions.json in this format:
      [{ "candidate_name": "...", "positions": {
        "immigration": { "score": 2, "summary": "Supports path to citizenship for DACA recipients" },
        ...
      }}]
- [ ] Write 10 quiz questions (one per policy axis) in citizenos/src/lib/policyAxes.ts format:
      Each question is a policy statement users agree/disagree with
      Example: "The government should provide universal healthcare coverage"
```

---

## PERSON A TASKS — BillBreaker Module

> **Prerequisite:** Sprint 0 must be complete.
> **Time:** Hours 4–28
> **Files to create/edit:** Everything in `citizenos/src/components/billbreaker/`, `citizenos/src/stores/useBillStore.ts`, `citizenos/src/stores/useNotifStore.ts`, `citizenos/src/api/bills.ts`, `citizenos/src/api/notifications.ts`
> **External API:** Congress.gov API (key in .env as CONGRESS_GOV_API_KEY)
> **InsForge tables used:** bills, bill_chats, notifications, saved_bills, user_categories
> **AI prompts:** Use prompts from "AI Prompt Architecture > BillBreaker Prompts" section of this document

### A-Phase 1: Data Pipeline — Edge Functions (Hours 4–10)
```
- [ ] Deploy edge function: GET /api/bills
      - Accepts query params: ?state, ?category, ?status, ?page, ?limit=20
      - Fetches from Congress.gov API: https://api.congress.gov/v3/bill?api_key={key}
      - For each bill: UPSERT into bills table
      - If bill.ai_processed = false:
        → LLM call with "Bill Categorization" prompt → update categories[]
        → LLM call with "Bill Summary" prompt → update summary_ai
        → Set ai_processed = true
      - Returns paginated bill list from DB

- [ ] Deploy edge function: GET /api/bills/:bill_id
      - Check bills table for bill_id
      - If not found → fetch from Congress.gov → insert → AI process → return
      - Returns: full bill record including summary_ai

- [ ] Deploy edge function: GET /api/bills/:bill_id/impact?personas=student,veteran
      - Load bill from DB
      - For each persona in query:
        → Check bills.impact_personas JSONB for cached key
        → If missing → LLM call with "Persona Impact" prompt
        → Save to impact_personas JSONB → return
      - Returns: { student: "impact text...", veteran: "impact text..." }

- [ ] Deploy edge function: GET /api/bills/:bill_id/story
      - Load bill + user profile from auth
      - LLM call with "Impact Story (Narrative)" prompt
      - Cache in bills.impact_story
      - Returns: narrative text

- [ ] Deploy edge function: POST /api/bills/:bill_id/chat
      - Body: { message: string, history: [{role, content}] }
      - Load bill.full_text from DB
      - LLM call with "Bill Chat" prompt (bill text as context + history + question)
      - INSERT into bill_chats table (both user and assistant messages)
      - Returns: { response: string, sources: [section references] }

- [ ] citizenos/src/api/bills.ts — frontend API client:
      getBills(filters) → GET /api/bills?...
      getBillDetail(billId) → GET /api/bills/:id
      getBillImpact(billId, personas) → GET /api/bills/:id/impact?personas=...
      getBillStory(billId) → GET /api/bills/:id/story
      chatWithBill(billId, message, history) → POST /api/bills/:id/chat
      saveBill(billId) → POST /api/bills/:id/save
      unsaveBill(billId) → DELETE /api/bills/:id/save
      getSavedBills() → GET /api/bills/saved
      getRepsVoted(billId) → GET /api/bills/:id/reps-voted

- [ ] citizenos/src/stores/useBillStore.ts:
      State: bills[], selectedBill, filters, chatHistory[], isLoading
      Actions: fetchBills, fetchBillDetail, fetchImpact, sendChatMessage, toggleSave
```

### A-Phase 2: UI Components (Hours 10–18)
```
- [ ] citizenos/src/components/billbreaker/BillList.tsx
      - Renders list of BillCards
      - Filter bar: category dropdown, status dropdown, search input
      - Pagination (load more button or infinite scroll)
      - Uses useBillStore.fetchBills()

- [ ] citizenos/src/components/billbreaker/BillCard.tsx
      - Card showing: title (truncated), bill number, status badge (color-coded),
        category chips, introduced date, sponsor name
      - Click → navigate to /bill/:id

- [ ] citizenos/src/components/billbreaker/BillDetailPage.tsx
      - Route: /bill/:id
      - On mount: fetch bill detail + impact for user's personas
      - Composes all sub-components below in a single scrollable page

- [ ] citizenos/src/components/billbreaker/BillHeader.tsx
      - Bill number (e.g., "H.R. 4521"), full title, sponsor + party, status badge

- [ ] citizenos/src/components/billbreaker/StatusTimeline.tsx
      - Horizontal stepper: Introduced → Committee → Passed House → Passed Senate → Enacted
      - Current step highlighted, completed steps have checkmarks

- [ ] citizenos/src/components/billbreaker/AISummary.tsx
      - Card with "AI Generated" badge (top-right)
      - Renders summary_ai as markdown
      - Toggle button: "View Original" → shows summary_raw / original text

- [ ] citizenos/src/components/billbreaker/PersonaSelector.tsx
      - Row of toggle chips for user's profiles (from useAuthStore)
      - On toggle → calls getBillImpact() with selected personas
      - Uses persona data from lib/personas.ts for labels + icons

- [ ] citizenos/src/components/billbreaker/ImpactPanel.tsx
      - Displays persona impact text below PersonaSelector
      - Updates dynamically when personas toggled
      - Shows loading skeleton while fetching

- [ ] citizenos/src/components/billbreaker/ImpactStory.tsx
      - Collapsible section: "How this affects your day"
      - Fetches narrative from /api/bills/:id/story
      - Italic narrative text style

- [ ] citizenos/src/components/billbreaker/BillChat.tsx
      - Chat interface (shadcn ScrollArea for messages)
      - Message bubbles: user (right, blue) and assistant (left, gray)
      - Input bar at bottom with send button
      - 3 suggested question chips above input:
        "Does this affect my taxes?", "When does this take effect?", "Who supports this?"
      - Loading indicator while LLM responds
      - Source citations shown after assistant messages

- [ ] citizenos/src/components/billbreaker/RepsVoted.tsx
      - Section showing which reps voted on this bill
      - Calls GET /api/bills/:id/reps-voted (cross-module, uses Person B's rep_votes data)
      - If no data yet: "Voting record not available yet"
      - Each rep: name, party badge, vote position (Yes=green, No=red)
      - Click rep → navigate to /rep/:memberId

- [ ] citizenos/src/components/billbreaker/BillActionBar.tsx
      - Fixed bottom bar or floating action buttons:
      - Save/bookmark toggle (heart icon)
      - "Contact My Rep" → navigates to rep contact with bill context
      - "Share" → copy link to clipboard

- [ ] Wire BillList into StatePanel Bills tab:
      - Edit citizenos/src/components/map/StatePanel.tsx
      - Bills tab: render <BillList> filtered by selectedState

- [ ] Map coloring:
      - Edit citizenos/src/components/map/USAMap.tsx
      - When colorMode = "bill_activity": color states by bill count
```

### A-Phase 3: Notifications (Hours 18–24)
```
- [ ] Deploy edge function: notification pipeline
      - Triggered when new bills are inserted
      - For each new bill with categories:
        → Query user_categories WHERE category = ANY(bill.categories) AND notify_enabled
        → For each matched user: LLM generates one-line impact summary
        → INSERT INTO notifications (user_id, bill_id, title, message, impact_level)

- [ ] Deploy edge functions for notification CRUD:
      GET  /api/notifications?page&unread_only → paginated list
      GET  /api/notifications/count → { unread: number }
      PUT  /api/notifications/:id/read → mark single read
      PUT  /api/notifications/read-all → mark all read
      GET  /api/notifications/preferences → user's category toggles
      PUT  /api/notifications/preferences → update toggles

- [ ] Deploy edge functions for saved bills:
      POST   /api/bills/:bill_id/save → bookmark
      DELETE /api/bills/:bill_id/save → remove bookmark
      GET    /api/bills/saved → user's saved bills

- [ ] citizenos/src/api/notifications.ts — frontend client
- [ ] citizenos/src/stores/useNotifStore.ts:
      State: notifications[], unreadCount, preferences
      Actions: fetchNotifications, markRead, markAllRead, updatePreferences
      Poll: call getUnreadCount() every 60 seconds

- [ ] citizenos/src/components/billbreaker/NotificationBell.tsx
      - Bell icon (lucide-react Bell)
      - Red badge with unreadCount (hidden if 0)
      - Click → opens NotificationDropdown

- [ ] citizenos/src/components/billbreaker/NotificationDropdown.tsx
      - Popover or dropdown list of recent notifications
      - Each: title, message preview, time ago, unread dot
      - Click notification → navigate to /bill/:bill_id
      - Footer: "Mark all read" link + "Settings" link

- [ ] citizenos/src/components/billbreaker/NotifPreferences.tsx
      - Page section (under /settings)
      - Toggle switch per category (from categories.ts)
      - Save button → PUT /api/notifications/preferences

- [ ] Wire NotificationBell into Header.tsx (replace placeholder)
```

### A-Phase 4: Polish (Hours 24–28)
```
- [ ] Bill search/filter bar with debounced search input
- [ ] Skeleton loading states (shadcn Skeleton) on BillList, BillDetail
- [ ] Empty states: "No bills found for this state" with illustration
- [ ] Error handling: toast notifications on API failure, retry buttons
- [ ] Cross-module: deploy GET /api/bills/:bill_id/reps-voted
      (query rep_votes JOIN representatives WHERE bill matches)
```

---

## PERSON B TASKS — RepScore Module

> **Prerequisite:** Sprint 0 must be complete (pull latest from Person A). Seed data from Person B's curation phase must be in seed/seed-promises.json.
> **Time:** Hours 4–28
> **Files to create/edit:** Everything in `citizenos/src/components/repscore/`, `citizenos/src/stores/useRepStore.ts`, `citizenos/src/api/reps.ts`
> **External APIs:** ProPublica Congress API (key: PROPUBLICA_API_KEY), Google Civic Info API (key: GOOGLE_CIVIC_API_KEY)
> **InsForge tables used:** representatives, rep_votes, campaign_promises, rep_scores
> **AI prompts:** Use prompts from "AI Prompt Architecture > RepScore Prompts" section of this document

### B-Phase 1: Data Pipeline — Edge Functions (Hours 4–10)
```
- [ ] Deploy edge function: GET /api/reps?state={code}&chamber={senate|house}
      - Fetch from ProPublica: GET https://api.propublica.org/congress/v1/members/{chamber}/{state}/current.json
        Header: X-API-Key: {PROPUBLICA_API_KEY}
      - Parse response → UPSERT into representatives table
      - Include: name, party, state_code, district, chamber, photo_url,
        votes_with_party_pct, missed_votes_pct, bills_sponsored, website, phone
      - Returns: list of reps for that state

- [ ] Deploy edge function: GET /api/reps/:member_id
      - Check representatives table
      - If not cached → fetch from ProPublica /members/{id} → cache
      - Returns: full rep record

- [ ] Deploy edge function: GET /api/reps/:member_id/votes?page={n}
      - Fetch from ProPublica: GET /members/{id}/votes
      - Parse → UPSERT into rep_votes table
      - Each vote: member_id, vote_id, bill_id, vote_date, vote_position, vote_question, result
      - Returns: paginated vote list

- [ ] Deploy edge function: GET /api/reps/:member_id/promises
      - Query campaign_promises WHERE member_id = :member_id
      - Returns: list of promises with status

- [ ] Seed campaign_promises from seed/seed-promises.json:
      - Deploy edge function or run seed script to INSERT curated promises
      - Each promise: member_id, promise_text, category, source_url, status, evidence

- [ ] Deploy edge function: GET /api/reps/:member_id/score
      - Load campaign_promises for member
      - Load rep_votes for member
      - For each promise with status not yet determined:
        → LLM call with "Promise-Vote Matching" prompt
        → Update promise status + evidence
      - Calculate scores:
        promise_alignment = (kept * 1.0 + in_progress * 0.5) / total_scored * 100
        party_loyalty = votes_with_party_pct (from representatives table)
        attendance = 100 - missed_votes_pct
        overall = (promise_alignment * 0.5) + (attendance * 0.3) + (party_loyalty * 0.2)
      - UPSERT into rep_scores table
      - Returns: { promise_alignment, party_loyalty, attendance, overall, breakdown }

- [ ] Deploy edge function: POST /api/reps/:member_id/contact
      - Body: { bill_id?: string, concern_text: string }
      - Load rep info + bill info (if bill_id provided)
      - LLM call with "Contact Email Generation" prompt
      - Returns: { subject, body, mailto_link }

- [ ] citizenos/src/api/reps.ts — frontend API client:
      getReps(state, chamber) → GET /api/reps?state=...&chamber=...
      getRepDetail(memberId) → GET /api/reps/:member_id
      getRepVotes(memberId, page) → GET /api/reps/:member_id/votes
      getRepPromises(memberId) → GET /api/reps/:member_id/promises
      getRepScore(memberId) → GET /api/reps/:member_id/score
      contactRep(memberId, billId, concern) → POST /api/reps/:member_id/contact
      getRepBills(memberId) → GET /api/reps/:member_id/bills

- [ ] citizenos/src/stores/useRepStore.ts:
      State: reps[], selectedRep, votes[], promises[], scores, filters, isLoading
      Actions: fetchReps, fetchRepDetail, fetchVotes, fetchPromises, fetchScore
```

### B-Phase 2: UI Components (Hours 10–18)
```
- [ ] citizenos/src/components/repscore/RepList.tsx
      - Grid of RepCards
      - Filter by state dropdown, chamber toggle (Senate/House)
      - Sort by: alignment score, party loyalty, attendance

- [ ] citizenos/src/components/repscore/RepCard.tsx
      - Card: avatar photo, name, party badge (D=blue, R=red, I=purple),
        chamber, state, district, overall score as circular gauge
      - Click → navigate to /rep/:memberId

- [ ] citizenos/src/components/repscore/RepDetailPage.tsx
      - Route: /rep/:memberId
      - On mount: fetch rep detail + score + promises + votes
      - Composes all sub-components below

- [ ] citizenos/src/components/repscore/RepHeader.tsx
      - Large avatar, full name, party badge, state + district,
        tenure (term start - now), in_office badge, next election date

- [ ] citizenos/src/components/repscore/ScoreGauges.tsx
      - Row of 3 circular gauges using recharts RadialBarChart:
      - Promise Alignment Score (0-100): green >70, yellow 40-70, red <40
      - Party Loyalty (%): neutral color
      - Attendance (%): neutral color
      - Each gauge: number in center, label below

- [ ] citizenos/src/components/repscore/PromiseTracker.tsx
      - List of PromiseItems
      - Summary bar at top: "5 kept, 2 broken, 1 in progress, 1 TBD"
      - Filter by status

- [ ] citizenos/src/components/repscore/PromiseItem.tsx
      - Promise text + status chip:
        kept = green with check icon
        broken = red with X icon
        in_progress = yellow with clock icon
        not_yet_addressed = gray with question mark
      - Expandable: evidence text + linked vote references
      - Click linked vote → highlights in VotingRecord below

- [ ] citizenos/src/components/repscore/VotingRecord.tsx
      - Paginated table (shadcn Table):
        Columns: Date, Bill, Question, Position, Result
      - Position: "Yes" = green badge, "No" = red badge, "Not Voting" = gray
      - Category filter dropdown
      - Click bill name → navigate to /bill/:id (cross-module link to BillBreaker)
      - Load more button for pagination

- [ ] citizenos/src/components/repscore/BillsSponsored.tsx
      - Compact list of bills this rep sponsored/co-sponsored
      - Each: bill number, title, status, date
      - Click → /bill/:id

- [ ] citizenos/src/components/repscore/ContactRep.tsx
      - Concern topic input (or pre-filled if coming from a bill)
      - "Generate Email" button → calls contactRep API
      - Preview: editable subject line + body textarea
      - "Open in Email" button → window.open(mailto:...)
      - "Copy to Clipboard" button

- [ ] citizenos/src/components/repscore/RepScoreDashboard.tsx
      - Route: /reps
      - State filter + chamber filter + sort dropdown
      - Grid of RepCards
      - Browse all reps without needing the map

- [ ] Wire RepList into StatePanel Reps tab:
      - Edit citizenos/src/components/map/StatePanel.tsx
      - Reps tab: render <RepList> filtered by selectedState
```

### B-Phase 3: Cross-Module + Dashboard (Hours 18–24)
```
- [ ] Deploy edge function: GET /api/reps/:member_id/bills
      - Query rep_votes JOIN bills → bills this rep voted on
      - Returns: [{ bill_id, title, vote_position, vote_date }]
      - Used by Person A's RepsVoted component

- [ ] Map integration:
      - Add "Party control" color mode option to MapControls
      - Color states by majority party of their reps

- [ ] Dashboard integration:
      - Add "Your Representatives" section to Dashboard.tsx
      - Shows RepCards for user's state (from useAuthStore.user.state_code)
      - Quick view of scores
```

### B-Phase 4: Polish (Hours 24–28)
```
- [ ] Score explanation tooltip: "How is this calculated?" popover
- [ ] Promise status distribution: recharts PieChart (kept/broken/in_progress/TBD)
- [ ] Voting record: flag icon on votes that contradict a promise
- [ ] Loading skeletons for RepCard, RepDetailPage
- [ ] Empty states: "No voting record found", "No promises tracked"
- [ ] Stretch: rep comparison — side-by-side two reps from same state
```

---

## PERSON C TASKS — VoteMap Module

> **Prerequisite:** Sprint 0 must be complete (pull latest from Person A). Seed data from Person C's curation phase must be in seed/seed-candidates.json and seed/seed-positions.json.
> **Time:** Hours 4–28
> **Files to create/edit:** Everything in `citizenos/src/components/votemap/`, `citizenos/src/stores/useQuizStore.ts`, `citizenos/src/api/candidates.ts`, `citizenos/src/api/quiz.ts`
> **External APIs:** TinyFish/AgentQL (key: TINYFISH_API_KEY), OpenSecrets (key: OPENSECRETS_API_KEY)
> **InsForge tables used:** candidates, candidate_positions, candidate_reputation, quiz_results
> **AI prompts:** Use prompts from "AI Prompt Architecture > VoteMap Prompts" section of this document

### C-Phase 1: Data + Quiz Engine (Hours 4–10)
```
- [ ] Seed candidates table from seed/seed-candidates.json:
      - Deploy edge function or run seed script
      - INSERT each candidate: name, party, state_code, district, office_sought,
        incumbent, photo_url, bio, website

- [ ] Seed candidate_positions from seed/seed-positions.json:
      - For each candidate × each policy axis:
        INSERT: candidate_id, policy_axis, position_score, position_summary
      - 10 axes × 10-15 candidates = 100-150 rows

- [ ] Deploy edge function: GET /api/quiz/questions
      - Returns 10 questions from policyAxes.ts data:
        [{ axis: "immigration", question: "The government should...",
           options: [
             { value: -2, label: "Strongly Disagree" },
             { value: -1, label: "Disagree" },
             { value: 0, label: "Neutral" },
             { value: 1, label: "Agree" },
             { value: 2, label: "Strongly Agree" }
           ]
        }]

- [ ] Deploy edge function: POST /api/quiz/submit
      - Body: { answers: { immigration: 2, healthcare: -1, ... } }
      - Load all candidate_positions from DB
      - For each candidate:
          per_axis_diff = |user_answer - candidate_score| for each axis
          total_diff = sum of all per_axis_diff
          max_possible_diff = 4 * number_of_axes  // max diff per axis is 4 (-2 vs +2)
          match_pct = Math.round((1 - total_diff / max_possible_diff) * 100)
          axis_breakdown = { axis: { user: X, candidate: Y, diff: Z } per axis }
      - Sort candidates by match_pct descending
      - INSERT INTO quiz_results (user_id, answers, matches)
      - Returns: { matches: [{ candidate_id, name, party, photo_url, score, axis_breakdown }] }

- [ ] Deploy edge function: GET /api/candidates?state={code}&office={type}
      - Query candidates table with optional filters
      - Returns: list of candidates with basic info

- [ ] Deploy edge function: GET /api/candidates/:id
      - Returns: full candidate record

- [ ] Deploy edge function: GET /api/candidates/:id/positions
      - Query candidate_positions WHERE candidate_id
      - Returns: [{ axis, score, summary }]

- [ ] citizenos/src/api/quiz.ts — frontend client:
      getQuizQuestions() → GET /api/quiz/questions
      submitQuiz(answers) → POST /api/quiz/submit

- [ ] citizenos/src/api/candidates.ts — frontend client:
      getCandidates(state, office) → GET /api/candidates?...
      getCandidateDetail(id) → GET /api/candidates/:id
      getCandidatePositions(id) → GET /api/candidates/:id/positions
      getCandidateReputation(id) → GET /api/candidates/:id/reputation
      compareCandidates(ids) → GET /api/candidates/compare?ids=...

- [ ] citizenos/src/stores/useQuizStore.ts:
      State: questions[], answers {}, currentStep, matches[], isSubmitting
      Actions: setAnswer, nextStep, prevStep, submitQuiz, resetQuiz
```

### C-Phase 2: Reputation Engine (Hours 10–16)
```
- [ ] Seed candidate_reputation for curated candidates:
      - Use TinyFish/AgentQL to scrape OpenSecrets for each candidate:
        → Total raised, small donor %, top 5 donors
      - Use TinyFish/AgentQL to scrape Ballotpedia for each candidate:
        → Endorsements, controversies
      - LLM call with "Reputation Analysis" prompt per candidate:
        → reputation_score (0-100), media_sentiment, ai_summary,
           key_strengths, key_concerns
      - INSERT INTO candidate_reputation

- [ ] Deploy edge function: GET /api/candidates/:id/reputation
      - Query candidate_reputation WHERE candidate_id
      - Returns: { reputation_score, funding_transparency, top_donors[],
                   total_raised, small_donor_pct, controversy_flags[],
                   endorsements[], media_sentiment, ai_summary }

- [ ] Deploy edge function: GET /api/candidates/compare?ids=1,2
      - Load both candidates' positions + reputation
      - Returns: { candidates: [full data for each],
                   axes: [list of all policy axes],
                   diff_matrix: { axis: { candidate1: score, candidate2: score, diff } } }
```

### C-Phase 3: UI Components (Hours 16–24)
```
- [ ] citizenos/src/components/votemap/VoteMapPage.tsx
      - Route: /vote
      - If no quiz results: show PolicyQuiz
      - If quiz completed: show QuizResults
      - Toggle: "Retake Quiz" button to reset

- [ ] citizenos/src/components/votemap/PolicyQuiz.tsx
      - Wrapper: progress bar showing step X of 10
      - Renders current QuizQuestion
      - Navigation: Back / Skip / Next buttons
      - Submit button on last question → calls submitQuiz()

- [ ] citizenos/src/components/votemap/QuizQuestion.tsx
      - Policy statement text (large)
      - 5 radio buttons or button group:
        Strongly Disagree (-2) → Disagree (-1) → Neutral (0) → Agree (+1) → Strongly Agree (+2)
      - Selected option highlighted

- [ ] citizenos/src/components/votemap/QuizResults.tsx
      - Wrapper for results view
      - Contains: MatchList + PolicyRadar + CandidateCompare section

- [ ] citizenos/src/components/votemap/MatchList.tsx
      - Ranked list of candidates by match %
      - Each item: <MatchCard>

- [ ] citizenos/src/components/votemap/MatchCard.tsx
      - Photo (avatar), name, party badge, match score % (large, colored)
      - Mini horizontal bars per policy axis showing alignment
      - Click → expand to full candidate detail or navigate to /candidate/:id

- [ ] citizenos/src/components/votemap/PolicyRadar.tsx
      - recharts RadarChart component
      - Overlays: user answers (blue fill) vs top 3 matched candidates (distinct colors)
      - 10 axes around the radar
      - Hover: shows exact values
      - Legend: user + candidate names with colors

- [ ] citizenos/src/components/votemap/CandidateCompare.tsx
      - Select 2 candidates from dropdown
      - Side-by-side layout (2 columns)
      - Per axis row: visual scale -2 to +2, dots showing each candidate's position
      - Reputation score comparison
      - Funding comparison bar chart

- [ ] citizenos/src/components/votemap/CandidateList.tsx
      - Grid/list of candidate cards
      - Filter by: office sought, party, state
      - Used in StatePanel Candidates tab

- [ ] citizenos/src/components/votemap/CandidateDetail.tsx
      - Full candidate page (can be modal or page)
      - All positions listed with summaries
      - ReputationCard embedded
      - If incumbent → link to /rep/:memberId (cross-module)

- [ ] citizenos/src/components/votemap/ReputationCard.tsx
      - Reputation score gauge (recharts RadialBarChart, 0-100)
      - Funding: total raised, small donor %, top 5 donors list
      - Endorsements: org names/badges
      - Controversy flags: warning cards (if any)
      - AI summary paragraph

- [ ] citizenos/src/components/votemap/FundingChart.tsx
      - recharts BarChart: total raised comparison between candidates
      - Stacked or grouped bars: small donors vs large donors

- [ ] Wire CandidateList into StatePanel Candidates tab:
      - Edit citizenos/src/components/map/StatePanel.tsx
      - Candidates tab: render <CandidateList> filtered by selectedState
```

### C-Phase 4: Polish (Hours 24–28)
```
- [ ] "Retake Quiz" button on results page
- [ ] "Share Results" → generate shareable link or image
- [ ] Policy axis explainer tooltips on radar chart
- [ ] Candidate detail page as full route: /candidate/:id
- [ ] Dashboard integration: "Your Quiz Results" section
- [ ] Loading skeletons on quiz submit, candidate list
- [ ] Empty states: "No candidates found", "Take the quiz to see matches"
- [ ] Link incumbent candidates to their RepScore profile (if rep exists in DB)
```

---

## INTEGRATION SPRINT (Hours 28–32) — ALL THREE

```
- [ ] Cross-module navigation:
      Bill → "Reps who voted" links to /rep/:id     (A uses B's API)
      Rep → voting record bills link to /bill/:id    (B links to A's pages)
      Rep → "candidate profile" links to /candidate  (B links to C's pages)
      Map StatePanel: all 3 tabs rendering real data

- [ ] Dashboard page (citizenos/src/components/layout/Dashboard.tsx):
      Combine data from all 3 modules for logged-in user:
      - "Bills affecting you" feed (A's useBillStore)
      - "Your representatives" cards with scores (B's useRepStore)
      - "Quiz results" summary (C's useQuizStore)
      - Recent notifications
      - Saved bills

- [ ] End-to-end smoke test:
      Signup → onboarding → map → click state → bill → chat → rep → contact → quiz
      Verify: every navigation link works, data loads, no console errors

- [ ] Bug fixes, edge cases, error states
- [ ] Deploy via InsForge site deployment
```

---

## DATA SEEDING STRATEGY (Before Demo)

```
1. Bills (Person A runs):
   Fetch 50-100 active bills from Congress.gov API
   → Run AI enrichment (summary, categories) as batch
   → Pre-compute impact_personas for student, veteran, small_business

2. Reps (Person B runs):
   Fetch all current members from ProPublica for 5-6 demo states
   → Fetch voting records for 5-8 curated reps
   → Seed campaign_promises from seed-promises.json
   → Pre-compute rep_scores

3. Candidates (Person C runs):
   Seed from seed-candidates.json + seed-positions.json
   → Run TinyFish reputation scraping
   → Pre-compute reputation analysis

4. Demo user:
   Create test account: demo@citizenos.com / password
   → State: Arizona, Profiles: [student, veteran]
   → Categories: [education, healthcare, veterans]
   → Pre-populate 3-5 notifications
   → Pre-populate 2-3 saved bills
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
